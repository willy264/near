import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { actions } from "near-api-js";
import { account, call, project, transaction, view, YOCTO, verifyNetwork } from "../packages/client/src/index.ts";

await verifyNetwork();
const p = project();
const a = [1, 2, 3].map(i => account(`agent-0${i}.${p.parent}`));
const ids = a.map(x => x.accountId);
const amount = "1000000";
const beforeStats = await view(p.ledger, "stats", { token: p.token });
const config = await view(p.ledger, "get_config", {});
for (const x of a) {
  await call(x, p.ledger, "set_debt_cap", { token: p.token, max: "1000000000" }, 1n, 30n * 10n ** 12n);
  await call(x, p.token, "storage_deposit", { account_id: x.accountId, registration_only: true }, YOCTO / 100n, 30n * 10n ** 12n);
  await call(x, p.token, "faucet", { amount: "10000000" }, 0n, 30n * 10n ** 12n);
}
const issued: string[] = [];
for (let i = 0; i < 3; i++) {
  const result = await call(a[i], p.ledger, "issue", { debtor: ids[(i + 1) % 3], token: p.token, amount, memo: "allocator smoke" }, 0n, 80n * 10n ** 12n);
  issued.push(result.value);
}
for (let i = 0; i < 3; i++) await call(a[(i + 1) % 3], p.ledger, "accept", { id: issued[i] }, 0n, 80n * 10n ** 12n);
const clearingIds = [issued[0], issued[2], issued[1]];
const clear = await call(a[0], p.ledger, "submit_clearing", { batch: { token: p.token, cycles: [{ ids: clearingIds, amount }] } }, 0n, 120n * 10n ** 12n);
const settleId = (await call(a[1], p.ledger, "issue", { debtor: ids[2], token: p.token, amount, memo: "allocator settle" }, 0n, 80n * 10n ** 12n)).value;
await call(a[2], p.ledger, "accept", { id: settleId }, 0n, 80n * 10n ** 12n);
const settle = await transaction(a[2], p.token, [actions.functionCall("ft_transfer_call", { receiver_id: p.ledger, amount, msg: JSON.stringify({ obligation_id: settleId }) }, 80n * 10n ** 12n, 1n)], "smoke-settle");
const creditor = ids[1];
const withdraw = await call(a[1], p.ledger, "withdraw", { token: p.token, amount: null }, 1n, 100n * 10n ** 12n);
const stats = await view(p.ledger, "stats", { token: p.token });
const deployment = JSON.parse(readFileSync("deployments/testnet.json", "utf8"));
const lines = ["# Standard allocator redeploy smoke test", "", `Date: ${new Date().toISOString()}`, "", "The ledger and tUSD contracts were code-only redeployed to the same testnet accounts. State was not reinitialized. This smoke test issued and accepted a three-edge cycle, cleared it, issued and settled one residue, and withdrew the creditor balance.", "", `Accounts: ${ids.join(", ")}; creditor withdrawal: ${creditor}.`, `Config after redeploy: ${JSON.stringify(config)}.`, `Stats before smoke (post gas benchmark): ${JSON.stringify(beforeStats)}.`, "", "| Action | Transaction | Explorer |", "|---|---|---|", ...[...issued.map((id, i) => [`issue ${i + 1}`, "recorded in transactions.jsonl", ""]), ["clearing", clear.hash, `https://testnet.nearblocks.io/txns/${clear.hash}`], ["settlement", settle.transaction.hash, `https://testnet.nearblocks.io/txns/${settle.transaction.hash}`], ["withdraw", withdraw.hash, `https://testnet.nearblocks.io/txns/${withdraw.hash}`]].map(r => `| ${r[0]} | ${r[1]} | ${r[2]} |`), "", `Final stats: ${JSON.stringify(stats)}.`, `Ledger code hash: ${deployment[p.ledger].codeHash}; tUSD code hash: ${deployment[p.token].codeHash}.`, "", "The seed-42 agent and fictional-firm runs predate this allocator-only redeploy; they used wee_alloc with the same contract logic.", ""];
writeFileSync("docs/evidence/redeploy-std-alloc-2026-11-08.md", lines.join("\n"));
console.log(lines.join("\n"));
