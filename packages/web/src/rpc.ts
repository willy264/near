import deployment from "../../../deployments/testnet.json";
import { obligationSchema } from "../../shared/src/schemas.ts";
import { type Config, type Obligation } from "../../shared/src/model.ts";
const providers = [
  "https://test.rpc.fastnear.com",
  "https://near-testnet.drpc.org",
];
export async function query(
  method: string,
  args: Record<string, unknown>,
  block?: string,
) {
  let last: unknown;
  for (const url of providers)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "untangle-read-only",
          method: "query",
          params: {
            request_type: "call_function",
            account_id: deployment.ledger,
            method_name: method,
            args_base64: btoa(JSON.stringify(args)),
            ...(block ? { block_id: block } : { finality: "final" }),
          },
        }),
      });
      if (!response.ok) throw Error(`RPC HTTP ${response.status}`);
      const data = await response.json();
      if (data.error || data.result?.error) throw Error("RPC view failed");
      return {
        value: JSON.parse(
          new TextDecoder().decode(new Uint8Array(data.result.result)),
        ),
        block: data.result.block_hash as string,
      };
    } catch (e) {
      last = e;
    }
  throw Error(`Both testnet RPC providers unavailable: ${String(last)}`);
}
export async function liveSnapshot() {
  const stats = await query("stats", { token: deployment.token });
  const config = await query("get_config", {}, stats.block);
  const edges: Obligation[] = [];
  for (let offset = 0; ; offset += 200) {
    const page = await query(
      "list_open",
      { token: deployment.token, from_index: String(offset), limit: 200 },
      stats.block,
    );
    if (!Array.isArray(page.value)) throw Error("Invalid RPC response");
    for (const row of page.value) {
      const o = obligationSchema.parse(row);
      edges.push({
        ...o,
        amount: BigInt(o.amount),
        remaining: BigInt(o.remaining),
        storage_fee: BigInt(o.storage_fee),
      });
    }
    if (page.value.length < 200) break;
    if (offset >= 10000) throw Error("Graph exceeds viewer limit");
  }
  return {
    stats: stats.value as Record<string, string | number>,
    config: config.value as Config,
    edges,
    block: stats.block,
  };
}
