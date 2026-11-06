# Competitive Thesis — Untangle

## One-sentence insight
When agents pay each other per call, they build dense webs of small mutual debts; much of that value cancels out around cycles, so a NEAR contract that **verifies cycles found off-chain** lets agents trade on credit and move only the residue.

## Why this can win here
1. **Fits the event's thesis literally:** "programmable money… money with a mind of its own… many agents, one economy." Clearing is coordination between agents (swarms) that makes agent commerce cheaper (agents) and works for business invoices (realworld). (VERIFIED theme text)
2. **Mechanism, not wrapper.** No LLM needed for the core; the novelty is a verifiable algorithmic market structure. Investor and mechanism-design judges (a16z crypto, Dragonfly, Electric Capital) can evaluate it on substance. (INFERRED)
3. **Solve off-chain, verify on-chain** is a clean fit for NEAR gas limits and a recognizable good-design pattern. (INFERRED)
4. **One honest number** carries the demo: share of accepted obligations cleared without any token transfer, read live from the testnet contract. (Planned; will be measured, never assumed)
5. **AI screener advantage:** contract unit tests, solver property tests and a fixture run need no keys; live stats come from public RPC with no key. (Planned)
6. **No visible competitor** in this event as of Nov 2 (search-based; density UNKNOWN).

## Defensible advantage (what's hard to copy in 12 days)
Correct cycle verification + settlement + key-scoped agent accounts + a simulator that produces real testnet history, tied together with reproducible evidence. Any one piece is easy; all of it working and measured is not.

## Assumptions to test (each has a kill/adjust condition)
| Assumption | Test | If false |
|---|---|---|
| Simulated agent economies produce meaningful cycles | Run sim with mixed service roles; measure cleared % on fixtures by Nov 5 | Make the realworld SME scenario primary; tune roles honestly and report the dependence on graph structure |
| Cycle verification fits gas for batches | Benchmark cycles of length 2–16 in sandbox tests | Cap cycle length/batch size; document |
| Function-call keys can issue/accept but not settle (FCK can't attach deposits; `ft_transfer_call` needs 1 yocto) | Verify on testnet day 3 | If FCK can settle, add explicit policy; either way document |
| Judges see it as more than "Cycles on NEAR" | README states prior art and the agent-native difference upfront | Lean harder on agent use + permissionless solvers |

## What we will never claim
Real-world liquidity savings, user adoption, or performance numbers not produced by our own runs. All simulated data is labeled as simulated.
