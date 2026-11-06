import { it, expect } from "vitest";
import { runLocal } from "./local.ts";
it("seeded scenarios are reproducible, conserve amounts and finish locally under five seconds", () => {
  for (const scenario of [
    "agents",
    "random",
    "supply-chain",
    "firms",
  ] as const) {
    const p = {
      schemaVersion: 1 as const,
      scenario,
      seed: 42,
      rounds: 10,
      mode: "local" as const,
    };
    const a = runLocal(p),
      b = runLocal(p);
    expect({ ...a, elapsedMs: 0 }).toEqual({ ...b, elapsedMs: 0 });
    expect(a.elapsedMs).toBeLessThan(5000);
    expect(a.stages.at(-1)!.fixture.stats.outstanding_total).toBe("0");
    if (scenario === "supply-chain")
      expect(a.stages.at(-1)!.fixture.stats.cleared_total).toBe("0");
  }
}, 30000);
