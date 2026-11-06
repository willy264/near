import { it, expect } from "vitest";
import fc from "fast-check";
import { LedgerModel, STORAGE_FEE } from "../../shared/src/model.ts";
import { planClearing, shortestCycle } from "./index.ts";
function graph(rows: [number, number, number][]) {
  const m = new LedgerModel(["t"]);
  for (let i = 0; i < 51; i++) {
    m.storageDeposit(String(i), STORAGE_FEE * 1000n);
    m.setDebtCap(String(i), "t", 10n ** 18n);
  }
  for (const [d, c, n] of rows) {
    if (d === c) continue;
    const id = m.issue(String(c), String(d), "t", BigInt(n));
    m.accept(String(d), id);
  }
  return m;
}
function clear(m: LedgerModel) {
  const nets = Array.from(
    { length: 51 },
    (_, i) => m.netPosition(String(i), "t").net,
  );
  for (const b of planClearing(m.listOpen("t"), "t")) m.submitClearing("50", b);
  m.assertInvariants();
  expect(
    Array.from({ length: 51 }, (_, i) => m.netPosition(String(i), "t").net),
  ).toEqual(nets);
  expect(shortestCycle(m.listOpen("t"), 12)).toBeNull();
  return m.stats("t").cleared_total;
}
it("triangle, chain, figure-eight, parallel edges and overlapping cycles", () => {
  expect(
    clear(
      graph([
        [0, 1, 8],
        [1, 2, 6],
        [2, 0, 9],
      ]),
    ),
  ).toBe(18n);
  expect(
    clear(
      graph([
        [0, 1, 8],
        [1, 2, 6],
      ]),
    ),
  ).toBe(0n);
  expect(
    clear(
      graph([
        [0, 1, 3],
        [1, 0, 3],
        [0, 2, 5],
        [2, 0, 5],
      ]),
    ),
  ).toBe(16n);
  expect(
    clear(
      graph([
        [0, 1, 2],
        [0, 1, 5],
        [1, 0, 7],
      ]),
    ),
  ).toBe(14n);
  expect(
    clear(
      graph([
        [0, 1, 8],
        [1, 2, 4],
        [2, 0, 4],
        [1, 3, 4],
        [3, 0, 4],
      ]),
    ),
  ).toBe(24n);
});
it("shortest cycle ties prefer largest bottleneck", () => {
  const m = graph([
    [0, 1, 3],
    [1, 0, 3],
    [2, 3, 9],
    [3, 2, 8],
  ]);
  expect(shortestCycle(m.listOpen("t"), 12)?.amount).toBe(8n);
});
it("random graphs preserve nets and leave no supported cycle", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 39 }),
          fc.integer({ min: 0, max: 39 }),
          fc.integer({ min: 1, max: 1000 }),
        ),
        { maxLength: 140 },
      ),
      (rows) => {
        expect(clear(graph(rows))).toBeGreaterThanOrEqual(0n);
      },
    ),
    { seed: 42, numRuns: 60 },
  );
}, 30000);
it("50 nodes / 500 edges plans in under two seconds", () => {
  let seed = 42;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const rows: [number, number, number][] = Array.from({ length: 500 }, () => [
    (rand() >>> 8) % 50,
    (rand() >>> 8) % 50,
    1 + (rand() % 1000),
  ]);
  const m = graph(rows);
  const start = performance.now();
  planClearing(m.listOpen("t"), "t");
  const elapsed = performance.now() - start;
  console.log(`solver_50_nodes_500_edges_ms=${elapsed.toFixed(3)}`);
  expect(elapsed).toBeLessThan(2000);
}, 30000);
