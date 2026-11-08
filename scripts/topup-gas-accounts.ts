import { actions } from "near-api-js";
import {
  account,
  project,
  transaction,
  YOCTO,
  verifyNetwork,
} from "../packages/client/src/index.ts";
await verifyNetwork();
const p = project();
const owner = account(p.parent);
for (const id of [`agent-01.${p.parent}`, `agent-02.${p.parent}`])
  await transaction(
    owner,
    id,
    [actions.transfer(YOCTO / 2n)],
    "gas-benchmark-topup",
  );
console.log("Topped up gas benchmark agent accounts by 0.5 NEAR each.");
