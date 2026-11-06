import { readFileSync } from "node:fs";
import { JsonRpcProvider, FailoverRpcProvider } from "near-api-js";
const deployment = JSON.parse(readFileSync("deployments/testnet.json", "utf8"));
const provider = new FailoverRpcProvider(
  ["https://test.rpc.fastnear.com", "https://near-testnet.drpc.org"].map(
    (url) => new JsonRpcProvider({ url }),
  ),
);
try {
  const stats = await provider.callFunction<Record<string, string>>({
    contractId: deployment.ledger,
    method: "stats",
    args: { token: deployment.token },
  });
  if (!stats) throw Error("Empty view response");
  console.log(
    `[6/6] live testnet stats: accepted=${stats.accepted_total}, cleared=${stats.cleared_total}, outstanding=${stats.outstanding_total} (base units; lifetime includes benchmarks)`,
  );
} catch (e) {
  console.log(
    `[6/6] live testnet stats: skipped (RPC unavailable/offline): ${(e as Error).message}`,
  );
}
