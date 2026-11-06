import { readFileSync, readdirSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { scenarioConfigSchema } from "../packages/shared/src/schemas.ts";
import { runLocal } from "../packages/sim/src/local.ts";
let count = 0;
for (const file of readdirSync("fixtures").filter(
  (f) => f.startsWith("expected-") && f.endsWith(".json"),
)) {
  const expected = JSON.parse(readFileSync(`fixtures/${file}`, "utf8"));
  const run = runLocal(scenarioConfigSchema.parse(expected.parameters));
  const actual = {
    schemaVersion: 1,
    parameters: run.parameters,
    stats: run.stages.at(-1)!.fixture.stats,
    acceptedCount: run.acceptedCount,
    rejectedCount: run.rejectedCount,
    payments: run.payments,
    withdrawals: run.withdrawals,
  };
  if (!isDeepStrictEqual(actual, expected))
    throw Error(`Fixture mismatch: ${file}`);
  count++;
}
if (count !== 12)
  throw Error(`Expected 12 scenario/seed fixtures, found ${count}`);
console.log(
  `12 deterministic local scenario/seed fixtures matched; no network, .env, keys or funds.`,
);
