import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { runEvidenceSchema } from "../packages/shared/src/schemas.ts";
const source = "run-agents-42-testnet-2026-11-07T14-03-12-249Z.json";
const run = runEvidenceSchema.parse(
  JSON.parse(readFileSync(`docs/evidence/${source}`, "utf8")),
);
const residual = new Map<string, bigint>();
for (const edge of run.stages.find((s) => s.name === "clearing")!.fixture
  .obligations)
  residual.set(
    edge.creditor,
    (residual.get(edge.creditor) ?? 0n) + BigInt(edge.remaining),
  );
const [creditor, amount] = [...residual].sort((a, b) =>
  a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : a[0].localeCompare(b[0]),
)[0];
const base = "https://1click.chaindefuser.com";
const tokenResponse = await fetch(`${base}/v0/tokens`, {
  signal: AbortSignal.timeout(30000),
});
if (!tokenResponse.ok) throw Error(`TOKENS_HTTP_${tokenResponse.status}`);
type Token = {
  assetId: string;
  symbol: string;
  blockchain: string;
  decimals: number;
};
const tokens = (await tokenResponse.json()) as Token[];
function asset(chain: string) {
  const matches = tokens.filter(
    (t) => t.blockchain === chain && t.symbol === "USDC" && t.decimals === 6,
  );
  if (matches.length !== 1) throw Error(`AMBIGUOUS_USDC_${chain}`);
  return matches[0];
}
const origin = asset("base"),
  destination = asset("eth");
// Public documentation example, not an operator/user address. Dry quotes only.
const exampleAddress = "0x2527D02599Ba641c19FEa793cD0F167589a0f10D";
const request = {
  dry: true,
  swapType: "EXACT_INPUT",
  slippageTolerance: 100,
  originAsset: origin.assetId,
  depositType: "ORIGIN_CHAIN",
  destinationAsset: destination.assetId,
  amount: amount.toString(),
  refundTo: exampleAddress,
  refundType: "ORIGIN_CHAIN",
  recipient: exampleAddress,
  recipientType: "DESTINATION_CHAIN",
  deadline: new Date(Date.now() + 600000).toISOString(),
} as const;
const response = await fetch(`${base}/v0/quote`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(request),
  signal: AbortSignal.timeout(60000),
});
const payload = await response.json();
if (!response.ok)
  throw Error(`QUOTE_HTTP_${response.status}: ${JSON.stringify(payload)}`);
if (payload.quote?.depositAddress || payload.quote?.depositMemo)
  throw Error("UNEXPECTED_DEPOSIT_IN_DRY_QUOTE");
if (!/^\d+$/.test(payload.quote?.amountOut ?? ""))
  throw Error("INVALID_QUOTE_OUTPUT");
const evidence = {
  schemaVersion: 1,
  recordedAt: new Date().toISOString(),
  label: "quote only, not executed",
  explanation:
    "Illustrative USDC route using the numerical size of a simulated tUSD residue. tUSD has no value and cannot be swapped. Documentation example addresses; no funds or signatures.",
  source,
  creditor,
  residualTestUnits: amount.toString(),
  origin,
  destination,
  endpoint: `${base}/v0/quote`,
  docs: `${base}/docs/v0/openapi.yaml`,
  request,
  response: payload,
};
const json = JSON.stringify(evidence, null, 2) + "\n";
writeFileSync("docs/evidence/intents-quote.json", json);
mkdirSync("packages/web/public/evidence", { recursive: true });
writeFileSync("packages/web/public/evidence/intents-quote.json", json);
writeFileSync(
  "docs/evidence/intents-quote.md",
  `# NEAR Intents dry quote\n\nRecorded: ${evidence.recordedAt}. Command: \`pnpm exec tsx scripts/intents-dry-quote.ts\`.\n\n${evidence.explanation}\n\n${creditor} had ${amount} tUSD base units receivable after clearing in [the recorded run](${source}). A dry quote used the same numerical amount in USDC on Base, targeting USDC on Ethereum. Quoted output: ${payload.quote.amountOut} USDC base units. This is a historical quote, not a current price or executed payment.\n\nRequest: dry=true. No deposit address returned; no funds, JWT, wallet, signature or transaction. [Full request, response and token metadata](intents-quote.json). Asset IDs came from GET /v0/tokens; the public example address came from the [official OpenAPI](${evidence.docs}).\n`,
);
console.log(
  `Dry quote recorded: ${amount} -> ${payload.quote.amountOut} USDC base units; no deposit address; not executed.`,
);
