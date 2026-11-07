import loadHighs from "highs";
import {
  DEFAULT_CONFIG,
  type Config,
  type Obligation,
  type Cycle,
  type ClearingBatch,
} from "../../shared/src/model.ts";

/** Offline comparison only. Floating-point LP output is checked with exact integers. */
export async function optimalClearing(
  input: Obligation[],
  token: string,
  config: Config = DEFAULT_CONFIG,
) {
  const edges = input.filter(
    (e) => e.token === token && e.status === "Accepted" && e.remaining > 0n,
  );
  const capacity = edges.reduce((n, e) => n + e.remaining, 0n);
  if (capacity > BigInt(Number.MAX_SAFE_INTEGER))
    throw Error("LP_PRECISION_RANGE");
  if (new Set(edges.map((e) => e.id)).size !== edges.length)
    throw Error("LP_DUPLICATE_ID");
  const batches: ClearingBatch[] = [];
  const unsupported: Cycle[] = [];
  if (!edges.length)
    return {
      optimal: 0n,
      supported: 0n,
      unsupportedTotal: 0n,
      batches,
      unsupported,
    };
  const accounts = [...new Set(edges.flatMap((e) => [e.debtor, e.creditor]))];
  const rows = accounts.map(
    (a, i) =>
      ` c${i}: ${edges.flatMap((e, j) => (e.debtor === a ? [`+ f${j}`] : e.creditor === a ? [`- f${j}`] : [])).join(" ")} = 0`,
  );
  const lp = `Maximize\n obj: ${edges.map((_, i) => `f${i}`).join(" + ")}\nSubject To\n${rows.join("\n")}\nBounds\n${edges.map((e, i) => ` 0 <= f${i} <= ${e.remaining}`).join("\n")}\nEnd`;
  const highs = await loadHighs();
  const result = highs.solve(lp, { output_flag: false });
  if (result.Status !== "Optimal") throw Error(`LP_STATUS_${result.Status}`);
  const flows = edges.map((e, i) => {
    const value = result.Columns[`f${i}`].Primal;
    if (
      !Number.isFinite(value) ||
      Math.abs(value - Math.round(value)) > 0.00001
    )
      throw Error("LP_NON_INTEGER");
    const amount = BigInt(Math.round(value));
    if (amount < 0n || amount > e.remaining) throw Error("LP_CAPACITY");
    return amount;
  });
  for (const a of accounts) {
    const net = edges.reduce(
      (n, e, i) =>
        n +
        (e.debtor === a ? flows[i] : 0n) -
        (e.creditor === a ? flows[i] : 0n),
      0n,
    );
    if (net !== 0n) throw Error("LP_CONSERVATION");
  }
  const optimal = flows.reduce((n, f) => n + f, 0n);
  if (Math.abs(Number(optimal) - result.ObjectiveValue) > 0.00001)
    throw Error("LP_OBJECTIVE");
  let supported = 0n;
  let unsupportedTotal = 0n;
  while (flows.some((f) => f > 0n)) {
    let node = edges[flows.findIndex((f) => f > 0n)].debtor;
    const seen = new Map<string, number>();
    const path: number[] = [];
    while (!seen.has(node)) {
      seen.set(node, path.length);
      const i = edges.findIndex((e, j) => e.debtor === node && flows[j] > 0n);
      if (i < 0) throw Error("LP_DECOMPOSITION");
      path.push(i);
      node = edges[i].creditor;
    }
    const indices = path.slice(seen.get(node)!);
    const amount = indices.reduce(
      (n, i) => (flows[i] < n ? flows[i] : n),
      flows[indices[0]],
    );
    const cycle = { ids: indices.map((i) => edges[i].id), amount };
    for (const i of indices) flows[i] -= amount;
    const reduced = amount * BigInt(indices.length);
    if (indices.length > config.max_cycle_len || indices.length < 2) {
      unsupported.push(cycle);
      unsupportedTotal += reduced;
    } else {
      let batch = batches.at(-1);
      if (!batch || batch.cycles.length >= config.max_cycles_per_batch) {
        batch = { token, cycles: [] };
        batches.push(batch);
      }
      batch.cycles.push(cycle);
      supported += reduced;
    }
  }
  return { optimal, supported, unsupportedTotal, batches, unsupported };
}
