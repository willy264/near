import { mkdirSync, writeFileSync } from "node:fs";
import { type RunEvidence } from "../../shared/src/schemas.ts";
import { displayAmount } from "./local.ts";
export function saveRun(run: RunEvidence) {
  mkdirSync("fixtures", { recursive: true });
  mkdirSync("docs/evidence", { recursive: true });
  const p = run.parameters,
    stamp = new Date().toISOString().replace(/[:.]/g, "-"),
    base = `run-${p.scenario}-${p.seed}-${p.mode}-${stamp}`;
  writeFileSync(
    `fixtures/${p.scenario}-${p.seed}${p.mode === "testnet" ? "-testnet" : ""}-before.json`,
    JSON.stringify(run.stages[0].fixture, null, 2),
  );
  writeFileSync(`docs/evidence/${base}.json`, JSON.stringify(run, null, 2));
  const s = run.stages.at(-1)!.fixture.stats;
  const checks =
    p.mode === "local"
      ? "Local model invariants were checked after each operation, including net preservation during clearing and final token conservation."
      : "The complete plan was checked against LedgerModel before submission. Final I2 accounting and I8 token custody were checked against testnet views. Receipt behavior is tested separately in sandbox.";
  const txTable = run.transactions.length
    ? "\n## Transactions\n\n| Method | Signer | Key role | Gas burnt | Transaction |\n|---|---|---|---:|---|\n" +
      run.transactions
        .map(
          (t) =>
            `| ${t.method} | ${t.signer} | ${t.keyRole} | ${t.gas} | [${t.hash}](https://testnet.nearblocks.io/txns/${t.hash}) |`,
        )
        .join("\n") +
      "\n"
    : "";
  writeFileSync(
    `docs/evidence/${base}.md`,
    `# SIMULATED ${p.scenario}: seed ${p.seed}, ${p.mode}\n\ntUSD is a test token with no value. Parameters: ${JSON.stringify(p)}.\n\nAccepted: ${displayAmount(s.accepted_total)} tUSD across ${run.acceptedCount} obligations; rejected at cap: ${run.rejectedCount}.\nCleared: ${displayAmount(s.cleared_total)} tUSD (${Number(s.cleared_ratio_bps) / 100}%).\nPayments: ${run.payments}; creditor withdrawals: ${run.withdrawals}. Outstanding: ${s.outstanding_total}.\nElapsed: ${run.elapsedMs.toFixed(3)} ms.\n\n${p.mode === "local" ? "In-memory run; no network, real transactions, or transaction hashes. Storage, balances and keys are modeled; local mode is not key-permission proof." : "See JSON for transaction hashes and signer roles. Scenario statistics subtract the saved pre-run contract counters; live lifetime statistics include earlier benchmarks."}\n\n${checks} Payment count excludes creditor withdrawals: a lower payment count does not by itself imply lower total token-transfer count.\n\nFull machine-readable evidence: ${base}.json\n${txTable}`,
  );
  return base;
}
