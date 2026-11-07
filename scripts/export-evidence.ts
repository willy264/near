import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import {
  runEvidenceSchema,
  type RunEvidence,
} from "../packages/shared/src/schemas.ts";
import { displayAmount } from "../packages/sim/src/local.ts";
const files = readdirSync("docs/evidence")
  .filter((f) => /^run-.*\.json$/.test(f))
  .sort();
const runs: Record<string, { file: string; run: RunEvidence }> = {};
const allRuns: Record<string, { file: string; run: RunEvidence }> = {};
for (const file of files) {
  const run = runEvidenceSchema.parse(
    JSON.parse(readFileSync(`docs/evidence/${file}`, "utf8")),
  );
  const key = `${run.parameters.scenario}-${run.parameters.seed}`;
  const previous = allRuns[key];
  if (
    !previous ||
    run.parameters.mode === "testnet" ||
    previous.run.parameters.mode === "local"
  )
    allRuns[key] = { file, run };
  if (run.parameters.seed !== 42) continue;
  const old = runs[run.parameters.scenario] as { run: typeof run } | undefined;
  if (
    !old ||
    run.parameters.mode === "testnet" ||
    old.run.parameters.mode === "local"
  )
    runs[run.parameters.scenario] = { file, run };
}
mkdirSync("packages/web/public/evidence", { recursive: true });
writeFileSync(
  "packages/web/public/evidence/latest.json",
  JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    runs,
  }),
);
console.log(
  `Exported ${Object.keys(runs).length} recorded scenarios from validated evidence.`,
);
const table = [
  "| Scenario | Mode | Seed | Accepted test tUSD | Cleared | Payments / obligations | Withdrawals | Evidence |",
  "|---|---|---:|---:|---:|---:|---:|---|",
  ...Object.values(allRuns)
    .sort(
      (a, b) =>
        Number(b.run.parameters.mode === "testnet") -
          Number(a.run.parameters.mode === "testnet") ||
        a.run.parameters.scenario.localeCompare(b.run.parameters.scenario) ||
        a.run.parameters.seed - b.run.parameters.seed,
    )
    .map(({ file, run }) => {
      const scenario = run.parameters.scenario;
      const s = run.stages.at(-1)!.fixture.stats;
      return `| ${scenario} | ${run.parameters.mode} | ${run.parameters.seed} | ${displayAmount(s.accepted_total)} | ${Number(s.cleared_ratio_bps) / 100}% | ${run.payments} / ${run.acceptedCount} | ${run.withdrawals} | [saved run](docs/evidence/${file.replace(/\.json$/, ".md")}) |`;
    }),
].join("\n");
const readme = readFileSync("README.md", "utf8").replace(
  /<!-- evidence:start -->[\s\S]*?<!-- evidence:end -->/,
  `<!-- evidence:start -->\n${table}\n<!-- evidence:end -->`,
);
writeFileSync("README.md", readme);
