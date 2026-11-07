import { Command } from "commander";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fixtureSchema, obligationSchema } from "../../shared/src/schemas.ts";
import {
  DEFAULT_CONFIG,
  stringify,
  type Obligation,
  type Config,
} from "../../shared/src/model.ts";
import { planClearing } from "./index.ts";
import { validatePlan } from "./validate.ts";
const cli = new Command();
cli.name("solver");
for (const command of ["plan", "submit"])
  cli
    .command(command)
    .requiredOption("--token <account>")
    .option("--network <network>", "local or testnet", "local")
    .option("--fixture <path>")
    .option("--signer <account>")
    .action(async (options) => {
      if (!["local", "testnet"].includes(options.network))
        throw Error("TESTNET_ONLY");
      let edges: Obligation[],
        config: Config = DEFAULT_CONFIG;
      if (options.network === "local") {
        if (!options.fixture)
          throw Error("--fixture is required for local planning");
        const fixture = fixtureSchema.parse(
          JSON.parse(readFileSync(options.fixture, "utf8")),
        );
        edges = fixture.obligations.map((o) => ({
          ...o,
          amount: BigInt(o.amount),
          remaining: BigInt(o.remaining),
          storage_fee: BigInt(o.storage_fee),
        }));
      } else {
        const { view } = await import("../../client/src/index.ts");
        const deployment = JSON.parse(
          readFileSync("deployments/testnet.json", "utf8"),
        );
        config = (await view<Config>(deployment.ledger, "get_config", {}))!;
        edges = [];
        for (let offset = 0; ; offset += 200) {
          const page =
            (await view<object[]>(deployment.ledger, "list_open", {
              token: options.token,
              from_index: String(offset),
              limit: 200,
            })) ?? [];
          for (const raw of page) {
            const o = obligationSchema.parse(raw);
            edges.push({
              ...o,
              amount: BigInt(o.amount),
              remaining: BigInt(o.remaining),
              storage_fee: BigInt(o.storage_fee),
            });
          }
          if (page.length < 200) break;
        }
      }
      const batches = planClearing(edges, options.token, config);
      validatePlan(edges, batches, config);
      const total = batches
        .flatMap((b) => b.cycles)
        .reduce((n, c) => n + c.amount * BigInt(c.ids.length), 0n);
      console.log(
        stringify({
          dryRun: command === "plan",
          token: options.token,
          totalReduced: total,
          batches,
        }),
      );
      if (command === "submit") {
        if (options.network !== "testnet")
          throw Error("Submit requires --network testnet");
        if (
          !options.signer ||
          !existsSync(`.keys/${options.signer}.operator.json`)
        )
          throw Error("A local operator key for --signer is required");
        const { account } = await import("../../client/src/index.ts");
        const { Journal } = await import("../../client/src/journal.ts");
        const deployment = JSON.parse(
          readFileSync("deployments/testnet.json", "utf8"),
        );
        const id =
            "solver-" +
            createHash("sha256")
              .update(stringify(batches))
              .digest("hex")
              .slice(0, 24),
          journal = new Journal(id);
        for (let i = 0; i < batches.length; i++) {
          const result = await journal.call(
            `batch-${i}`,
            account(options.signer),
            deployment.ledger,
            "submit_clearing",
            { batch: JSON.parse(stringify(batches[i])) },
            0n,
            180n * 10n ** 12n,
            "solver",
          );
          console.log(
            `Testnet clearing: https://testnet.nearblocks.io/txns/${result.hash}`,
          );
        }
      }
    });
await cli.parseAsync();
