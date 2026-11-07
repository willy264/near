import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fixtureSchema } from "../packages/shared/src/schemas.ts";
import { DEFAULT_CONFIG, stringify } from "../packages/shared/src/model.ts";
import { optimalClearing } from "../packages/solver/src/optimal.ts";
import { planClearing } from "../packages/solver/src/index.ts";
import { validatePlan } from "../packages/solver/src/validate.ts";
const rows = [];
for (const file of readdirSync("fixtures")
  .filter((f) =>
    /^(agents|firms|random|supply-chain)-(42|7|1234)-before\.json$/.test(f),
  )
  .sort()) {
  const raw = readFileSync(`fixtures/${file}`, "utf8");
  const fixture = fixtureSchema.parse(JSON.parse(raw));
  const edges = fixture.obligations.map((e) => ({
    ...e,
    amount: BigInt(e.amount),
    remaining: BigInt(e.remaining),
    storage_fee: BigInt(e.storage_fee),
  }));
  const greedyBatches = planClearing(edges, fixture.token);
  const greedy = greedyBatches
    .flatMap((b) => b.cycles)
    .reduce((n, c) => n + c.amount * BigInt(c.ids.length), 0n);
  const result = await optimalClearing(edges, fixture.token);
  validatePlan(edges, result.batches, DEFAULT_CONFIG);
  if (result.optimal < greedy) throw Error("LP_BELOW_FEASIBLE_GREEDY");
  rows.push({
    fixture: file,
    sha256: createHash("sha256").update(raw).digest("hex"),
    scenario: fixture.parameters.scenario,
    seed: fixture.parameters.seed,
    greedy,
    ...result,
  });
}
rows.sort((a, b) => a.scenario.localeCompare(b.scenario) || a.seed - b.seed);
writeFileSync(
  "docs/evidence/optimal.json",
  stringify({
    schemaVersion: 1,
    simulated: true,
    solver: "highs 1.15.4",
    config: DEFAULT_CONFIG,
    generatedAt: new Date().toISOString(),
    rows,
  }),
);
const lines = [
  "# Greedy versus optimal circulation",
  "",
  "Command: `pnpm exec tsx scripts/compare-optimal.ts`",
  "",
  "All amounts are simulated tUSD base units (6 decimals). LP maximizes per-edge reduction without a cycle-length constraint. Supported decomposition is separately validated against LedgerModel. Long simple cycles are reported as unsupported, never split using invented edges. This is an offline comparison, not submitted on-chain.",
  "",
  "HiGHS 1.15.4 uses floating-point arithmetic; inputs whose total capacity exceeds Number.MAX_SAFE_INTEGER are rejected. Returned integer bounds, flow conservation, objective and supported cycles are checked exactly with bigint. This comparison does not support arbitrary u128 inputs.",
  "",
  "| Scenario | Seed | Greedy | LP optimal | Supported | Unsupported | Gap |",
  "|---|---:|---:|---:|---:|---:|---:|",
];
for (const r of rows)
  lines.push(
    `| ${r.scenario} | ${r.seed} | ${r.greedy} | ${r.optimal} | ${r.supported} | ${r.unsupportedTotal} | ${r.optimal - r.greedy} |`,
  );
lines.push(
  "",
  "Fixture hashes and decomposed cycles: [optimal.json](optimal.json). API source: https://github.com/lovasoa/highs-js (pinned npm package declarations also checked).",
  "",
);
writeFileSync("docs/evidence/optimal.md", lines.join("\n"));
console.log(lines.join("\n"));
