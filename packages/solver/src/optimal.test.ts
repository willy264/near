import { it, expect } from "vitest";
import { DEFAULT_CONFIG, type Obligation } from "../../shared/src/model.ts";
import { optimalClearing } from "./optimal.ts";
import { planClearing } from "./index.ts";
import { validatePlan } from "./validate.ts";
function graph(rows: [string, string, bigint][]): Obligation[] {
  return rows.map(([debtor, creditor, amount], i) => ({
    id: String(i),
    debtor,
    creditor,
    amount,
    remaining: amount,
    token: "t",
    status: "Accepted",
    memo: "",
    created_ms: "0",
    storage_payer: creditor,
    storage_fee: 0n,
  }));
}
it("finds the longer circulation that greedy sacrifices and validates it exactly", async () => {
  const edges = graph([
    ["a", "b", 1n],
    ["b", "a", 1n],
    ["b", "c", 1n],
    ["c", "a", 1n],
  ]);
  const greedy = planClearing(edges, "t")
    .flatMap((b) => b.cycles)
    .reduce((n, c) => n + c.amount * BigInt(c.ids.length), 0n);
  const result = await optimalClearing(edges, "t");
  expect(greedy).toBe(2n);
  expect(result.optimal).toBe(3n);
  expect(result.supported).toBe(3n);
  validatePlan(edges, result.batches, DEFAULT_CONFIG);
});
it("reports an unsupported long cycle without inventing shorter cycles", async () => {
  const edges = graph(
    Array.from({ length: 13 }, (_, i) => [String(i), String((i + 1) % 13), 7n]),
  );
  const result = await optimalClearing(edges, "t");
  expect(result.optimal).toBe(91n);
  expect(result.unsupportedTotal).toBe(91n);
  expect(result.batches).toEqual([]);
});
it("rejects capacities outside the exact floating-point integer domain", async () => {
  await expect(
    optimalClearing(graph([["a", "b", 1n << 64n]]), "t"),
  ).rejects.toThrow("LP_PRECISION_RANGE");
});
