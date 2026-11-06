import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { actions, PublicKey } from "near-api-js";
import {
  account,
  project,
  keys,
  exists,
  transaction,
  call,
  view,
  YOCTO,
  verifyNetwork,
  evidence,
} from "../packages/client/src/index.ts";
await verifyNetwork();
const p = project();
const owner = account(p.parent);
const records: Record<string, unknown> = {
  network: "testnet",
  createdAt: new Date().toISOString(),
  parent: p.parent,
  ledger: p.ledger,
  token: p.token,
  solver: p.solver,
  reproducible: false,
};
if (existsSync("deployments/testnet.json"))
  Object.assign(
    records,
    JSON.parse(readFileSync("deployments/testnet.json", "utf8")),
  );
for (const [id, near] of [
  [p.ledger, 4n * YOCTO],
  [p.token, 2n * YOCTO],
  [p.solver, YOCTO / 2n],
  [`agent-01.${p.parent}`, (3n * YOCTO) / 4n],
  [`agent-02.${p.parent}`, (3n * YOCTO) / 4n],
] as [string, bigint][]) {
  if (!(await exists(id))) {
    const k = keys(id);
    await transaction(
      owner,
      id,
      [
        actions.createAccount(),
        actions.transfer(near),
        actions.addFullAccessKey(PublicKey.fromString(k.public_key)),
      ],
      "create-subaccount",
    );
  }
}
const deployments = [
  {
    id: p.token,
    wasm: "contracts/target/near/untangle_test_token/untangle_test_token.wasm",
    args: {},
  },
  {
    id: p.ledger,
    wasm: "contracts/target/near/untangle/untangle.wasm",
    args: {
      owner: p.parent,
      tokens: [p.token],
      config: {
        max_cycle_len: 12,
        max_cycles_per_batch: 5,
        max_memo_bytes: 128,
        max_batch_issue: 20,
      },
    },
  },
];
for (const d of deployments) {
  const a = account(d.id);
  const state = await a.getState();
  if (state.codeHash === "11111111111111111111111111111111") {
    const result = await transaction(
      a,
      d.id,
      [
        actions.deployContract(readFileSync(d.wasm)),
        actions.functionCall("new", d.args, 50n * 10n ** 12n, 0n),
      ],
      "deploy-and-init",
    );
    records[d.id] = {
      codeHash: (await a.getState()).codeHash,
      deployTx: result.transaction.hash,
      timestamp: new Date().toISOString(),
    };
    mkdirSync("deployments", { recursive: true });
    writeFileSync("deployments/testnet.json", JSON.stringify(records, null, 2));
  }
}
if (!(await view(p.token, "storage_balance_of", { account_id: p.ledger })))
  await call(
    owner,
    p.token,
    "storage_deposit",
    { account_id: p.ledger, registration_only: true },
    YOCTO / 100n,
  );
console.log(JSON.stringify(records, null, 2));
