import { actions, PublicKey } from "near-api-js";
import {
  account,
  keys,
  project,
  exists,
  view,
  YOCTO,
  AGENT_METHODS,
  verifyNetwork,
} from "../../client/src/index.ts";
import { Journal } from "../../client/src/journal.ts";
import {
  STORAGE_FEE,
  stringify,
  type Obligation,
  type Config,
} from "../../shared/src/model.ts";
import {
  fixtureSchema,
  runEvidenceSchema,
  type ScenarioConfig,
  type RunEvidence,
} from "../../shared/src/schemas.ts";
import { planClearing } from "../../solver/src/index.ts";
import { validatePlan } from "../../solver/src/validate.ts";
import { trades } from "./local.ts";
type Stats = Record<string, string | number>;
export async function runTestnet(
  parameters: ScenarioConfig,
): Promise<RunEvidence> {
  await verifyNetwork();
  const p = project(),
    owner = account(p.parent),
    runId = `${parameters.scenario}-${parameters.seed}-${parameters.rounds}-testnet`;
  const journal = new Journal(runId);
  if (journal.data.complete)
    return runEvidenceSchema.parse(journal.data.complete);
  const names = Array.from(
      { length: parameters.scenario === "firms" ? 8 : 12 },
      (_, i) =>
        `${parameters.scenario === "firms" ? "firm" : "agent"}-${String(i + 1).padStart(2, "0")}.${p.parent}`,
    ),
    schedule = trades(parameters);
  const config = await view<Config>(p.ledger, "get_config", {});
  if (!config) throw Error("Missing contract config");
  if (!journal.data.started) {
    const baseline = await view<Stats>(p.ledger, "stats", { token: p.token });
    if (!baseline || BigInt(baseline.outstanding_total) !== 0n)
      throw Error("Start a recorded run only with no outstanding obligations");
    journal.data.started = new Date().toISOString();
    journal.data.baseline = baseline;
    journal.save();
  }
  if (!journal.data.setup) {
    // Return unused benchmark storage to the parent before funding demo subaccounts.
    for (const name of names.slice(0, 2))
      if (await exists(name)) {
        const key = `reclaim-${name}`;
        if (journal.data[key] === undefined) {
          const balance = await view<{ available: string }>(
            p.ledger,
            "storage_balance_of",
            { account_id: name },
          );
          journal.data[key] = String(
            balance && BigInt(balance.available) > YOCTO
              ? BigInt(balance.available) - YOCTO
              : 0n,
          );
          journal.save();
        }
        const amount = BigInt(journal.data[key] as string);
        if (amount > 0n) {
          await journal.call(
            `${key}-withdraw`,
            account(name),
            p.ledger,
            "storage_withdraw",
            { amount: String(amount) },
            1n,
            30n * 10n ** 12n,
          );
          await journal.send(
            `${key}-transfer`,
            account(name),
            p.parent,
            [actions.transfer(amount)],
            "return-unused-storage",
          );
        }
      }
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (!(await exists(name))) {
        const k = keys(name);
        await journal.send(
          `create-${i}`,
          owner,
          name,
          [
            actions.createAccount(),
            actions.transfer((2n * YOCTO) / 5n),
            actions.addFullAccessKey(PublicKey.fromString(k.public_key)),
          ],
          "create-agent",
        );
      }
      const a = account(name),
        balance = await view<{ total: string }>(
          p.ledger,
          "storage_balance_of",
          { account_id: name },
        );
      const needed =
        STORAGE_FEE * BigInt(schedule.filter((t) => t.seller === i).length + 3);
      if (!balance || BigInt(balance.total) < needed)
        await journal.call(
          `storage-${i}`,
          owner,
          p.ledger,
          "storage_deposit",
          { account_id: name },
          needed - BigInt(balance?.total ?? 0),
          30n * 10n ** 12n,
        );
      await journal.call(
        `cap-${i}`,
        a,
        p.ledger,
        "set_debt_cap",
        { token: p.token, max: "250000000" },
        1n,
        30n * 10n ** 12n,
      );
      if (!(await view(p.token, "storage_balance_of", { account_id: name })))
        await journal.call(
          `token-registration-${i}`,
          a,
          p.token,
          "storage_deposit",
          { account_id: null, registration_only: true },
          YOCTO / 100n,
          30n * 10n ** 12n,
        );
      await journal.call(
        `faucet-${i}`,
        a,
        p.token,
        "faucet",
        { amount: "1000000000" },
        0n,
        30n * 10n ** 12n,
      );
      const k = keys(name, "agent"),
        list = await a.getAccessKeyList();
      if (!list.keys.some((key) => key.public_key === k.public_key))
        await journal.send(
          `agent-key-${i}`,
          a,
          name,
          [
            actions.addFunctionCallAccessKey(
              PublicKey.fromString(k.public_key),
              p.ledger,
              AGENT_METHODS,
              YOCTO / 4n,
            ),
          ],
          "add-agent-key",
        );
      console.log(`Setup ${i + 1}/${names.length}: ${name}`);
    }
    journal.data.setup = true;
    journal.save();
  }
  if (!journal.data.trading) {
    let accepted = 0n,
      rejected = 0n;
    for (let round = 0; round < parameters.rounds; round++) {
      const pending: { id: string; buyer: number; amount: bigint }[] = [];
      for (let seller = 0; seller < names.length; seller++) {
        const selected = schedule.filter(
          (t) => t.round === round && t.seller === seller,
        );
        for (
          let start = 0;
          start < selected.length;
          start += config.max_batch_issue
        ) {
          const batch = selected.slice(start, start + config.max_batch_issue);
          const result = await journal.call(
            `issue-${round}-${seller}-${start}`,
            account(names[seller], "agent"),
            p.ledger,
            "issue_many",
            {
              items: batch.map((t) => ({
                debtor: names[t.buyer],
                token: p.token,
                amount: String(t.amount),
                memo: `SIMULATED ${parameters.scenario} round ${round + 1}`,
              })),
            },
            0n,
            100n * 10n ** 12n,
            "agent",
          );
          batch.forEach((t, i) =>
            pending.push({
              id: result.value[i],
              buyer: t.buyer,
              amount: t.amount,
            }),
          );
        }
      }
      for (let buyer = 0; buyer < names.length; buyer++) {
        const selected = pending.filter((o) => o.buyer === buyer);
        for (
          let start = 0;
          start < selected.length;
          start += config.max_batch_issue
        ) {
          const chunk = selected.slice(start, start + config.max_batch_issue),
            op = `accept-${round}-${buyer}-${start}`;
          let decision = journal.data[op] as
            | { accepted: string[]; rejected: string[] }
            | undefined;
          if (!decision) {
            const status = await view<{ headroom: string }>(
              p.ledger,
              "debt_status",
              { account: names[buyer], token: p.token },
            );
            let headroom = BigInt(status!.headroom);
            decision = { accepted: [], rejected: [] };
            for (const o of chunk) {
              if (o.amount <= headroom) {
                decision.accepted.push(o.id);
                headroom -= o.amount;
              } else decision.rejected.push(o.id);
            }
            journal.data[op] = decision;
            journal.save();
          }
          if (decision.accepted.length)
            await journal.call(
              op,
              account(names[buyer], "agent"),
              p.ledger,
              "accept_many",
              { ids: decision.accepted },
              0n,
              100n * 10n ** 12n,
              "agent",
            );
          for (const id of decision.rejected)
            await journal.call(
              `reject-${id}`,
              account(names[buyer], "agent"),
              p.ledger,
              "reject",
              { id },
              0n,
              50n * 10n ** 12n,
              "agent",
            );
          accepted += BigInt(decision.accepted.length);
          rejected += BigInt(decision.rejected.length);
        }
      }
      console.log(
        `Trading round ${round + 1}/${parameters.rounds}: ${accepted} accepted; ${rejected} rejected`,
      );
    }
    journal.data.accepted = String(accepted);
    journal.data.rejected = String(rejected);
    journal.data.trading = true;
    journal.save();
  }
  const open = async () => {
    const rows: Obligation[] = [];
    for (let offset = 0; ; offset += 200) {
      const page =
        (await view<Record<string, unknown>[]>(p.ledger, "list_open", {
          token: p.token,
          from_index: String(offset),
          limit: 200,
        })) ?? [];
      for (const item of page) {
        const o = fixtureSchema.shape.obligations.element.parse(item);
        rows.push({
          ...o,
          amount: BigInt(o.amount),
          remaining: BigInt(o.remaining),
          storage_fee: BigInt(o.storage_fee),
        });
      }
      if (page.length < 200) break;
    }
    return rows;
  };
  const snapshot = async () => {
    const raw = (await view<Stats>(p.ledger, "stats", { token: p.token }))!,
      baseline = journal.data.baseline as Stats;
    const stats: Record<string, string> = {};
    for (const key of Object.keys(raw))
      if (key !== "cleared_ratio_bps")
        stats[key] = String(BigInt(raw[key]) - BigInt(baseline[key]));
    stats.cleared_ratio_bps =
      stats.accepted_total === "0"
        ? "0"
        : String(
            (BigInt(stats.cleared_total) * 10000n) /
              BigInt(stats.accepted_total),
          );
    return fixtureSchema.parse(
      JSON.parse(
        stringify({
          schemaVersion: 1,
          simulated: true,
          token: p.token,
          tokenLabel: "tUSD (test token)",
          parameters,
          obligations: await open(),
          stats,
        }),
      ),
    );
  };
  if (!journal.data.before) {
    journal.data.before = await snapshot();
    journal.save();
  }
  if (!journal.data.batches) {
    const edges = await open(),
      batches = planClearing(edges, p.token, config);
    validatePlan(edges, batches, config);
    journal.data.batches = JSON.parse(stringify(batches));
    journal.save();
  }
  const batches = journal.data.batches as RunEvidence["batches"];
  for (let i = 0; i < batches.length; i++)
    await journal.call(
      `clear-${i}`,
      account(p.solver),
      p.ledger,
      "submit_clearing",
      { batch: batches[i] },
      0n,
      180n * 10n ** 12n,
      "solver",
    );
  if (!journal.data.afterClearing) {
    journal.data.afterClearing = await snapshot();
    journal.data.settlements = JSON.parse(stringify(await open()));
    journal.save();
  }
  const settlements = journal.data.settlements as {
    id: string;
    debtor: string;
    remaining: string;
  }[];
  for (const o of settlements)
    await journal.call(
      `pay-${o.id}`,
      account(o.debtor),
      p.token,
      "ft_transfer_call",
      {
        receiver_id: p.ledger,
        amount: o.remaining,
        msg: JSON.stringify({ obligation_id: o.id }),
        memo: "SIMULATED residual settlement",
      },
      1n,
      100n * 10n ** 12n,
    );
  if (!journal.data.withdrawals) {
    const withdrawals = [];
    for (const name of names) {
      const amount = await view<string>(p.ledger, "withdrawable", {
        account: name,
        token: p.token,
      });
      if (amount && BigInt(amount) > 0n) withdrawals.push({ name, amount });
    }
    journal.data.withdrawals = withdrawals;
    journal.save();
  }
  for (const { name, amount } of journal.data.withdrawals as {
    name: string;
    amount: string;
  }[]) {
    const result = await journal.call(
      `withdraw-${name}`,
      account(name),
      p.ledger,
      "withdraw",
      { token: p.token, amount },
      1n,
      100n * 10n ** 12n,
    );
    if (result.value !== true)
      throw Error(`Withdrawal restored after failure: ${result.hash}`);
  }
  const final = await snapshot();
  if (final.stats.outstanding_total !== "0")
    throw Error("Residual obligations remain");
  if (
    BigInt(final.stats.accepted_total) !==
    BigInt(final.stats.cleared_total) + BigInt(final.stats.settled_total)
  )
    throw Error("I2");
  const custody = await view<string>(p.token, "ft_balance_of", {
    account_id: p.ledger,
  });
  if (custody !== "0")
    throw Error(
      `I8: expected empty token custody after withdrawals, got ${custody}`,
    );
  const run = runEvidenceSchema.parse({
    schemaVersion: 1,
    simulated: true,
    tokenLabel: "tUSD (test token)",
    parameters,
    stages: [
      { name: "trading", fixture: journal.data.before },
      { name: "clearing", fixture: journal.data.afterClearing },
      { name: "settlement", fixture: final },
    ],
    batches,
    acceptedCount: journal.data.accepted,
    rejectedCount: journal.data.rejected,
    payments: String(settlements.length),
    withdrawals: String((journal.data.withdrawals as unknown[]).length),
    elapsedMs: Date.now() - Date.parse(journal.data.started as string),
    transactions: journal.transactions(),
  });
  journal.data.complete = run;
  journal.save();
  return run;
}
