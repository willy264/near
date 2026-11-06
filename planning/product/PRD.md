# PRD — Untangle

**One line:** Untangle is a NEAR contract where agents (or businesses) record what they owe each other, anyone can cancel debt cycles that the contract verifies, and only the leftover is paid.

## Users & use case
- **Primary:** operators of AI agents that buy and sell services from each other (data, inference, summarising, translation). Agents accrue many small debts in both directions.
- **Secondary:** small businesses that invoice each other in chains (supplier → maker → retailer → supplier). Demo uses a **fictional** scenario, clearly labeled.

## Core problem
Settling every obligation separately needs working capital and a transfer per debt. In a network, A owes B, B owes C and C owes A — those debts can cancel without anyone moving money.

## Mechanism (the differentiator)
1. **Two-sided obligations:** creditor issues, debtor accepts. One-sided debts don't count.
2. **Permissionless clearing:** anyone submits a batch of cycles; the contract checks each is closed, same token, accepted, and the amount ≤ every edge's remaining balance; then reduces all edges. Every account's net position is unchanged by construction.
3. **Residual settlement:** debtor pays what's left with a NEP-141 token via `ft_transfer_call`; the contract forwards to the creditor.
4. **Restricted agent keys:** agent accounts hold a function-call key limited to `issue/accept/reject` on Untangle, so an agent can take on bounded credit but cannot move money.
5. **Credit limits:** a creditor caps open exposure per debtor.

## Primary journey (demo)
1. Simulator spins up 12 agent sub-accounts on testnet; they trade services for N rounds, issuing and accepting obligations.
2. Viewer shows the debt graph and gross total owed.
3. Solver runs; contract clears cycles (tx link).
4. Graph collapses; viewer shows **cleared vs settled-in-cash vs open**, read live from the contract.
5. Remaining debts are settled with the test token; final ledger balances to zero.

## MVP scope
- Untangle contract (Rust, near-sdk) + tests
- Test token tUSD (NEP-141, faucet; labeled as test token)
- TypeScript solver (greedy cycle cancellation) + property tests
- Simulator with scripted agents on testnet sub-accounts + local fixture mode
- Web viewer: live graph, stats, in-browser dry-run of clearing on current state
- `judge.sh`, CI, README for AI judges

## Out of scope (explicitly)
Mainnet deployment; real stablecoins; LLM-driven agents (optional stretch only); privacy of obligations; interest/due-date penalties; credit scoring; Sputnik integration.

## Stretch (only after MVP is verified)
1. Optimal clearing (min-cost-flow/LP) compared with greedy, reported honestly.
2. 1Click **dry** quote showing how a residue could be paid on another chain (no funds).
3. CSV export of an account's obligations, clearings and payments.
4. Solver leaderboard (who cleared how much).

## Acceptance criteria
| ID | Criterion | Verified by |
|---|---|---|
| AC1 | Only accepted obligations can be cleared or settled | Contract tests |
| AC2 | Invalid cycles (open path, mixed tokens, over-amount, duplicate edge, unaccepted) are rejected | Contract tests |
| AC3 | Clearing never changes any account's net position | Property test (random graphs, solver + contract model) |
| AC4 | Settling via ft_transfer_call reduces the obligation and pays the creditor; overpayment refunded | Contract/sandbox test |
| AC5 | Agent function-call key can issue/accept but cannot transfer tokens | Testnet check, logged in docs/evidence |
| AC6 | Simulator produces ≥1 clearing tx on testnet, links in README | Testnet tx hash |
| AC7 | Viewer shows live stats from testnet with no wallet/key | Manual + screenshot |
| AC8 | `./scripts/judge.sh` passes on a fresh clone with no `.env` | Fresh-clone run in clean container |
| AC9 | Every number in README comes from a run log in `docs/evidence/` | Review |

## Success metric (reported, not promised)
`cleared_ratio = amount cleared by cycles ÷ total accepted`, per scenario, read from contract `stats()`. Report with scenario parameters and seed.

## Demo central claim
"These agents owed each other X tUSD across N debts. Untangle cancelled Y% of it without a single transfer; they settled the remaining Z with M payments." — values filled from the actual run.
