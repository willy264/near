import {
  LedgerModel,
  STORAGE_FEE,
  type Obligation,
  type ClearingBatch,
  type Config,
} from "../../shared/src/model.ts";
/** Validate a plan against a fresh working ledger initialized from current remaining amounts. */
export function validatePlan(
  edges: Obligation[],
  batches: ClearingBatch[],
  config: Config,
) {
  const tokens = [
    ...new Set(edges.map((o) => o.token).concat(batches.map((b) => b.token))),
  ];
  const model = new LedgerModel(tokens, config),
    solver = "validation-solver.local";
  const accounts = new Set(
    edges.flatMap((o) => [o.creditor, o.debtor]).concat(solver),
  );
  for (const a of accounts) {
    model.storageDeposit(
      a,
      STORAGE_FEE * BigInt(edges.length + tokens.length + 10),
    );
    for (const t of tokens) model.setDebtCap(a, t, (1n << 128n) - 1n);
  }
  const ids = new Map<string, string>();
  for (const o of edges) {
    if (o.status !== "Accepted") continue;
    const id = model.issue(o.creditor, o.debtor, o.token, o.remaining);
    model.accept(o.debtor, id);
    ids.set(o.id, id);
  }
  const nets = [...accounts].flatMap((a) =>
    tokens.map((t) => model.netPosition(a, t).net),
  );
  for (const b of batches) {
    model.submitClearing(solver, {
      token: b.token,
      cycles: b.cycles.map((c) => ({
        amount: c.amount,
        ids: c.ids.map((id) => {
          const mapped = ids.get(id);
          if (mapped === undefined) throw Error("ERR_NOT_FOUND");
          return mapped;
        }),
      })),
    });
    model.assertInvariants();
  }
  if (
    JSON.stringify(nets) !==
    JSON.stringify(
      [...accounts].flatMap((a) =>
        tokens.map((t) => model.netPosition(a, t).net),
      ),
    )
  )
    throw Error("I1");
}
