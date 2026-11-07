import {
  type Obligation,
  type Cycle,
  type ClearingBatch,
  type Config,
  DEFAULT_CONFIG,
} from "../../shared/src/model.ts";

/** Shortest directed cycle; ties maximize the minimum remaining amount. */
export function shortestCycle(
  edges: Obligation[],
  maxLength: number,
): Cycle | null {
  const outgoing = new Map<string, Obligation[]>();
  for (const e of edges) {
    if (e.remaining <= 0n || e.status !== "Accepted") continue;
    const row = outgoing.get(e.debtor) ?? [];
    row.push(e);
    outgoing.set(e.debtor, row);
  }
  let best: Cycle | null = null;
  const starts = [...outgoing.keys()].sort();
  // Two-edge cycles are globally shortest. Preserve BFS's widest first edge
  // and insertion-order tie breaking without allocating its next layers.
  if (maxLength >= 2) {
    for (const start of starts) {
      const first = new Map<string, Obligation>();
      for (const edge of outgoing.get(start)!) {
        const old = first.get(edge.creditor);
        if (!old || edge.remaining > old.remaining)
          first.set(edge.creditor, edge);
      }
      for (const [middle, a] of first) {
        if (middle === start) continue;
        for (const b of outgoing.get(middle) ?? []) {
          if (b.creditor !== start) continue;
          const amount = a.remaining < b.remaining ? a.remaining : b.remaining;
          if (!best || amount > best.amount)
            best = { ids: [a.id, b.id], amount };
        }
      }
    }
    if (best) return best;
  }
  for (const start of starts) {
    const distance = new Map<string, number>([[start, 0]]);
    let layer = new Map<string, { amount: bigint; ids: string[] }>([
      [start, { amount: (1n << 128n) - 1n, ids: [] }],
    ]);
    for (
      let depth = 1;
      depth <= Math.min(maxLength, best?.ids.length ?? maxLength) && layer.size;
      depth++
    ) {
      const next = new Map<string, { amount: bigint; ids: string[] }>();
      for (const [node, path] of layer)
        for (const e of outgoing.get(node) ?? []) {
          const amount = path.amount < e.remaining ? path.amount : e.remaining;
          if (e.creditor === start) {
            if (
              depth >= 2 &&
              (!best ||
                depth < best.ids.length ||
                (depth === best.ids.length && amount > best.amount))
            )
              best = { ids: [...path.ids, e.id], amount };
            continue;
          }
          // At the last allowed depth only a closing edge can contribute.
          if (depth >= Math.min(maxLength, best?.ids.length ?? maxLength))
            continue;
          const oldDistance = distance.get(e.creditor);
          if (oldDistance !== undefined && oldDistance < depth) continue;
          distance.set(e.creditor, depth);
          const old = next.get(e.creditor);
          if (!old || amount > old.amount)
            next.set(e.creditor, { amount, ids: [...path.ids, e.id] });
        }
      layer = next;
    }
  }
  return best;
}

export function planClearing(
  obligations: Obligation[],
  token: string,
  config: Config = DEFAULT_CONFIG,
): ClearingBatch[] {
  const edges = obligations
    .filter((o) => o.token === token && o.status === "Accepted")
    .map((o) => ({ ...o }));
  const byId = new Map(edges.map((o) => [o.id, o]));
  const batches: ClearingBatch[] = [];
  for (;;) {
    const cycle = shortestCycle(edges, config.max_cycle_len);
    if (!cycle) break;
    let batch = batches.at(-1);
    if (!batch || batch.cycles.length === config.max_cycles_per_batch) {
      batch = { token, cycles: [] };
      batches.push(batch);
    }
    batch.cycles.push(cycle);
    for (const id of cycle.ids) byId.get(id)!.remaining -= cycle.amount;
  }
  return batches;
}
