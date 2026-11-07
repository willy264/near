import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  keys,
  verifyNetwork,
  exists,
  project,
} from "../packages/client/src/index.ts";
await verifyNetwork();
mkdirSync(".keys", { recursive: true });
if (!existsSync(".keys/project.json")) {
  const parent = `untangle-261106-${randomBytes(3).toString("hex")}.testnet`;
  writeFileSync(
    ".keys/project.json",
    JSON.stringify(
      {
        parent,
        ledger: `ledger.${parent}`,
        token: `tusd.${parent}`,
        solver: `solver.${parent}`,
      },
      null,
      2,
    ),
  );
}
const { parent } = project();
const key = keys(parent);
if (!(await exists(parent))) {
  const cli =
    process.env.NEAR_CLI ??
    (process.platform === "win32"
      ? ".tools/near-cli-rs-x86_64-pc-windows-msvc/near.exe"
      : "near");
  const result = spawnSync(
    cli,
    [
      "account",
      "create-account",
      "sponsor-by-faucet-service",
      parent,
      "use-manually-provided-public-key",
      key.public_key,
      "network-config",
      "testnet",
      "create",
    ],
    { encoding: "utf8", timeout: 120000 },
  );
  mkdirSync("docs/evidence", { recursive: true });
  const out = (result.stdout ?? "") + (result.stderr ?? "");
  writeFileSync("docs/evidence/account-creation.txt", out);
  console.log(out);
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw Error(`Account creation failed: exit ${result.status}`);
}
console.log(JSON.stringify({ parent, created: await exists(parent) }));
