import { readFileSync, writeFileSync } from "node:fs";
import { actions } from "near-api-js";
import {
  account,
  project,
  transaction,
  verifyNetwork,
} from "../packages/client/src/index.ts";

await verifyNetwork();
const p = project();
const manifestPath = "deployments/testnet.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const old = {
  ledger: manifest[p.ledger]?.codeHash,
  token: manifest[p.token]?.codeHash,
};
const deployments = [
  {
    id: p.token,
    wasm: "contracts/target/near/untangle_test_token/untangle_test_token.wasm",
  },
  { id: p.ledger, wasm: "contracts/target/near/untangle/untangle.wasm" },
];
for (const d of deployments) {
  const result = await transaction(
    account(d.id),
    d.id,
    [actions.deployContract(readFileSync(d.wasm))],
    "redeploy-standard-allocator",
  );
  const state = await (
    await import("../packages/client/src/index.ts")
  ).provider.viewAccount({ accountId: d.id });
  manifest[d.id] = {
    ...(manifest[d.id] ?? {}),
    previousCodeHash: old[d.id === p.ledger ? "ledger" : "token"],
    codeHash: state.code_hash,
    deployTx: result.transaction.hash,
    timestamp: new Date().toISOString(),
    allocator: "Rust standard allocator",
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    JSON.stringify({
      account: d.id,
      previousCodeHash: old[d.id === p.ledger ? "ledger" : "token"],
      codeHash: state.code_hash,
      tx: result.transaction.hash,
    }),
  );
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
