import { writeFileSync, readFileSync } from "node:fs";
import {
  account,
  project,
  call,
  view,
  YOCTO,
  evidence,
} from "../packages/client/src/index.ts";
const p = project(),
  owner = account(p.parent),
  solver = account(p.solver);
const ids = [`agent-01.${p.parent}`, `agent-02.${p.parent}`],
  agents = ids.map((id) => account(id));
const config = {
  max_cycle_len: 16,
  max_cycles_per_batch: 40,
  max_memo_bytes: 128,
  max_batch_issue: 40,
};
await call(owner, p.ledger, "set_config", { config }, 1n, 30n * 10n ** 12n);
for (const id of ids) {
  const storage = await view<{ total: string; available: string }>(
    p.ledger,
    "storage_balance_of",
    { account_id: id },
  );
  const topup = (33n * YOCTO) / 10n - BigInt(storage?.total ?? 0);
  if (topup > 0n)
    await call(
      owner,
      p.ledger,
      "storage_deposit",
      { account_id: id },
      topup,
      30n * 10n ** 12n,
    );
}
const rows: { method: string; size: string; tgas: number; hash: string }[] = [];
function record(
  method: string,
  size: string,
  result: Awaited<ReturnType<typeof call>>,
) {
  const gas = result.result.receipts_outcome.reduce(
    (n, r) => n + BigInt(r.outcome.gas_burnt),
    BigInt(result.result.transaction_outcome.outcome.gas_burnt),
  );
  const row = { method, size, tgas: Number(gas) / 1e12, hash: result.hash };
  rows.push(row);
  evidence("gas", row);
  console.log(JSON.stringify(row));
}
async function graph(length: number, count: number) {
  const cycles = Array.from({ length: count }, () => ({
    ids: Array<string>(length),
    amount: "1",
  }));
  for (let creditor = 0; creditor < 2; creditor++) {
    const positions = cycles
      .flatMap((_, c) => Array.from({ length }, (_, e) => ({ c, e })))
      .filter(({ e }) => e % 2 === creditor);
    for (let start = 0; start < positions.length; start += 20) {
      const batch = positions.slice(start, start + 20);
      const issued = await call(
        agents[creditor],
        p.ledger,
        "issue_many",
        {
          items: batch.map(() => ({
            debtor: ids[1 - creditor],
            token: p.token,
            amount: "1",
            memo: "G".repeat(128),
          })),
        },
        0n,
        280n * 10n ** 12n,
      );
      record("issue_many", String(batch.length), issued);
      batch.forEach(({ c, e }, i) => (cycles[c].ids[e] = issued.value[i]));
      await call(
        agents[1 - creditor],
        p.ledger,
        "accept_many",
        { ids: issued.value },
        0n,
        280n * 10n ** 12n,
      );
    }
  }
  const result = await call(
    solver,
    p.ledger,
    "submit_clearing",
    { batch: { token: p.token, cycles } },
    0n,
    300n * 10n ** 12n,
  );
  record("submit_clearing", `${count} x length ${length}`, result);
}
if (!process.argv.includes("--resume") && !process.argv.includes("--final"))
  for (const length of [2, 4, 8, 12, 16]) await graph(length, 1);
for (const count of process.argv.includes("--final")
  ? []
  : process.argv.includes("--resume")
    ? [20, 40]
    : [5, 10, 20, 40])
  await graph(4, count);
await graph(12, 5);
const allRows = readFileSync("docs/evidence/gas.jsonl", "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
const combined = rows.find(
  (r) => r.method === "submit_clearing" && r.size === "5 x length 12",
);
if (!combined || combined.tgas > 180)
  throw Error("Combined maximum is not proven below 180 Tgas");
const finalConfig = {
  ...config,
  max_cycle_len: 12,
  max_cycles_per_batch: 5,
  max_batch_issue: 20,
};
const frozen = await call(
  owner,
  p.ledger,
  "set_config",
  { config: finalConfig },
  1n,
  30n * 10n ** 12n,
);
const deployment = JSON.parse(readFileSync("deployments/testnet.json", "utf8"));
deployment.config = finalConfig;
deployment.configTx = frozen.hash;
writeFileSync("deployments/testnet.json", JSON.stringify(deployment, null, 2));
writeFileSync(
  "docs/evidence/gas.md",
  `# Testnet gas measurements\n\nTEST ONLY. Every cycle uses distinct obligations. Repeated accounts form valid closed walks; measurements do not cover distinct-account worst cases. Memos are 128 bytes. Total transaction and receipt gas burnt is reported.\n\n| Method | Size | Tgas | Transaction |\n|---|---|---:|---|\n${allRows.map((r) => `| ${r.method} | ${r.size} | ${r.tgas.toFixed(3)} | ${r.hash} |`).join("\n")}\n\nFinal limits: cycle 12, batch 5, issue batch 20. The combined 5 x length 12 case measured ${combined.tgas.toFixed(3)} Tgas, below 180. Config transaction: ${frozen.hash}.\n\nIssue batch 40 with 128-byte memos failed the runtime log limit, tx 8tioh7T6vgNEB5DyPCM6cVYndTVtBGzNfBirGWoHRqJH. Failed receipts are retained in transactions.jsonl.\n`,
);
console.log("Gas measurements complete; conservative configuration frozen.");
