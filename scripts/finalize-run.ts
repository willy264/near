import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { Journal } from "../packages/client/src/journal.ts";
import { runEvidenceSchema } from "../packages/shared/src/schemas.ts";
import { saveRun } from "../packages/sim/src/evidence.ts";
const id = process.argv[2];
if (!id) throw Error("Pass the completed journal run id");
const journal = new Journal(id);
if (!journal.data.complete)
  throw Error("Run is not complete; no evidence fabricated");
const run = runEvidenceSchema.parse({
  ...(journal.data.complete as object),
  transactions: journal.transactions(),
  contractBaseline: Object.fromEntries(
    Object.entries(journal.data.baseline as object).map(([k, v]) => [
      k,
      String(v),
    ]),
  ),
});
const base = saveRun(run),
  newMarkdown = readFileSync(`docs/evidence/${base}.md`, "utf8");
// Enrich earlier exports of this same completed run without changing its measured results.
for (const file of readdirSync("docs/evidence").filter(
  (f) =>
    f.startsWith(
      `run-${run.parameters.scenario}-${run.parameters.seed}-testnet-`,
    ) && f.endsWith(".json"),
)) {
  const prior = runEvidenceSchema.parse(
    JSON.parse(readFileSync(`docs/evidence/${file}`, "utf8")),
  );
  if (prior.parameters.rounds !== run.parameters.rounds) continue;
  writeFileSync(`docs/evidence/${file}`, JSON.stringify(run, null, 2));
  writeFileSync(
    `docs/evidence/${file.replace(/\.json$/, ".md")}`,
    newMarkdown.replaceAll(base, file.replace(/\.json$/, "")),
  );
}
const local = readdirSync("docs/evidence")
  .filter(
    (f) =>
      f.startsWith(
        `run-${run.parameters.scenario}-${run.parameters.seed}-local-`,
      ) && f.endsWith(".json"),
  )
  .sort()
  .at(-1);
if (local) {
  const prior = runEvidenceSchema.parse(
    JSON.parse(readFileSync(`docs/evidence/${local}`, "utf8")),
  );
  writeFileSync(
    `fixtures/${run.parameters.scenario}-${run.parameters.seed}-before.json`,
    JSON.stringify(prior.stages[0].fixture, null, 2),
  );
}
journal.data.complete = run;
journal.save();
console.log(
  `Finalized public transaction links, signing public keys and contract baseline: ${base}`,
);
