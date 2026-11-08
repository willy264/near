import { call, account, project, verifyNetwork } from "../packages/client/src/index.ts";
await verifyNetwork();
const p = project();
const config = { max_cycle_len: 12, max_cycles_per_batch: 5, max_memo_bytes: 128, max_batch_issue: 20 };
const result = await call(account(p.parent), p.ledger, "set_config", { config }, 1n, 30n * 10n ** 12n);
console.log(JSON.stringify({ config, tx: result.hash }));
