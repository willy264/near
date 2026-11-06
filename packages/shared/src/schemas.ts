import { z } from "zod";
const decimal = z.string().regex(/^(0|[1-9][0-9]*)$/);
export const obligationSchema = z.object({
  id: decimal,
  creditor: z.string(),
  debtor: z.string(),
  token: z.string(),
  amount: decimal,
  remaining: decimal,
  status: z.enum(["Issued", "Accepted"]),
  memo: z.string(),
  created_ms: decimal,
  storage_payer: z.string(),
  storage_fee: decimal,
});
export const tokenStatsSchema = z.object({
  accepted_total: decimal,
  cleared_total: decimal,
  settled_total: decimal,
  outstanding_total: decimal,
  open_count: decimal,
  closed_by_clearing: decimal,
  closed_by_payment: decimal,
  clearing_batches: decimal,
  cycles_cleared: decimal,
  payments: decimal,
  cleared_ratio_bps: decimal,
});
export const cycleSchema = z.object({
  ids: z.array(decimal).min(2),
  amount: decimal,
});
export const clearingBatchSchema = z.object({
  token: z.string(),
  cycles: z.array(cycleSchema),
});
export const scenarioConfigSchema = z.object({
  schemaVersion: z.literal(1),
  scenario: z.enum(["agents", "random", "supply-chain", "firms"]),
  seed: z.number().int(),
  rounds: z.number().int().positive(),
  mode: z.enum(["local", "testnet"]),
});
export const fixtureSchema = z.object({
  schemaVersion: z.literal(1),
  simulated: z.literal(true),
  token: z.string(),
  tokenLabel: z.literal("tUSD (test token)"),
  parameters: scenarioConfigSchema,
  obligations: z.array(obligationSchema),
  stats: tokenStatsSchema,
});
export const runEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  simulated: z.literal(true),
  tokenLabel: z.literal("tUSD (test token)"),
  parameters: scenarioConfigSchema,
  stages: z.array(
    z.object({
      name: z.enum(["trading", "clearing", "settlement"]),
      fixture: fixtureSchema,
    }),
  ),
  batches: z.array(clearingBatchSchema),
  acceptedCount: decimal,
  rejectedCount: decimal,
  payments: decimal,
  withdrawals: decimal,
  elapsedMs: z.number().nonnegative(),
  transactions: z.array(
    z.object({
      hash: z.string(),
      method: z.string(),
      signer: z.string(),
      keyRole: z.enum(["agent", "operator", "solver"]),
      gas: decimal,
    }),
  ),
});
export type ScenarioConfig = z.infer<typeof scenarioConfigSchema>;
export type Fixture = z.infer<typeof fixtureSchema>;
export type RunEvidence = z.infer<typeof runEvidenceSchema>;
