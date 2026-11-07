import { Command } from "commander";
import { scenarioConfigSchema } from "../../shared/src/schemas.ts";
import { runLocal, displayAmount } from "./local.ts";
import { saveRun } from "./evidence.ts";
import { mkdirSync, openSync, closeSync, unlinkSync } from "node:fs";
const cli = new Command();
cli.name("sim");
cli
  .command("run")
  .option(
    "--scenario <name>",
    "agents, random, supply-chain or firms",
    "agents",
  )
  .option("--seed <integer>", "seed", "42")
  .option("--rounds <integer>", "rounds", "10")
  .option("--mode <mode>", "local or testnet", "local")
  .action(async (options) => {
    const p = scenarioConfigSchema.parse({
      schemaVersion: 1,
      ...options,
      seed: Number(options.seed),
      rounds: Number(options.rounds),
    });
    // Runs share the operator and solver signers, so serialize all testnet runs.
    const lock = ".sim-state/testnet.lock";
    let lockFd: number | undefined;
    if (p.mode === "testnet") {
      mkdirSync(".sim-state", { recursive: true });
      try {
        lockFd = openSync(lock, "wx", 0o600);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        throw Error(
          `Run already locked: ${lock}. Stop any existing runner before removing a stale lock.`,
        );
      }
    }
    try {
      const run =
          p.mode === "local"
            ? runLocal(p)
            : await (await import("./testnet.ts")).runTestnet(p),
        s = run.stages.at(-1)!.fixture.stats;
      const path = saveRun(run);
      console.log(
        `SIMULATED: cleared ${displayAmount(s.cleared_total)} of ${displayAmount(s.accepted_total)} tUSD (test token) (${Number(s.cleared_ratio_bps) / 100}%) with 0 transfers; ${run.payments} payments settled the rest; ${run.withdrawals} creditor withdrawals.`,
      );
      console.log(
        `Evidence: ${p.mode === "local" ? ".runs/evidence" : "docs/evidence"}/${path}.md`,
      );
    } finally {
      if (lockFd !== undefined) {
        closeSync(lockFd);
        unlinkSync(lock);
      }
    }
  });
await cli.parseAsync();
