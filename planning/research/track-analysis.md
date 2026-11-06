# Track Analysis & Decision

Date: 2026-11-02. Builder profile: **solo, full-time (~12 days left), Codex agent does the coding, free tools only, testnet deployment.**

## Hard filters (outside the score)
| Constraint | Effect |
|---|---|
| Free tools only | Penalizes tracks that need paid compute: NEAR AI Cloud beyond the $10 credit, OutLayer per-execution fees, BigQuery beyond free tier |
| Testnet | Penalizes tracks whose core value needs NEAR Intents (mainnet-only): defi, realworld payments, business |
| Solo | Penalizes large UI/art scope (games) |
| AI screener | Rewards anything a fresh clone can run without keys |

## Weighted scores (internal model, not official)
Weights: rubric 25 · differentiation 20 · feasibility 15 · need 15 · tech advantage 10 · demonstrability 10 · competition 5. Scores 1–5. **Confidence: low–medium** (no rubric, density unknown).

| Track | Rub | Diff | Feas | Need | Tech | Demo | Comp | **Score** | Main reason |
|---|---|---|---|---|---|---|---|---|---|
| swarms | 4 | 4 | 4 | 4 | 4 | 4 | 3 | **3.95** | Coordination/markets between agents; sub-accounts; simulation mode is native to the track; testnet-friendly |
| thesis | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 3.55 | Reproducible, cheap; lower grand-prize ceiling |
| realworld | 4 | 3 | 3 | 4 | 3 | 3 | 3 | 3.40 | Strong need; real payments need mainnet Intents |
| social | 4 | 3 | 3 | 3 | 4 | 3 | 4 | 3.40 | Must integrate Sputnik/Trezu; fewer entrants likely |
| security | 4 | 2 | 4 | 4 | 3 | 4 | 1 | 3.35 | Already crowded (AgentGuard, Clearance) |
| nfts | 3 | 4 | 3 | 3 | 4 | 3 | 4 | 3.35 | TLA primitive, no SDK; contract risk |
| agents | 4 | 2 | 4 | 3 | 4 | 4 | 1 | 3.30 | Most crowded |
| memecoins | 3 | 3 | 5 | 2 | 3 | 4 | 3 | 3.25 | Easy build; weak need for investor judges |
| games | 3 | 4 | 2 | 2 | 3 | 4 | 4 | 3.05 | Too much UI for solo |
| privacy | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3.00 | Paid inference beyond $10 |
| business | 3 | 2 | 3 | 3 | 3 | 3 | 2 | 2.75 | Payment rails mainnet; crowded with agent shops |
| defi | 3 | 2 | 2 | 3 | 4 | 3 | 2 | 2.70 | Intents mainnet-only, real funds |
| open | — | — | — | — | — | — | — | stack | Add whenever the mechanism is unusual |

## Decision
- **Primary track: AI Swarms (`swarms`).**
- **Also select (only because the product genuinely fits):** `agents` (agents transact on credit and pay each other), `realworld` (the same contract nets real business invoices), `open` (unusual mechanism).
- **Strongest alternative:** Investment Thesis — keep as fallback if the build slips badly by Nov 7.
- **Reconsider if:** (a) a visible competitor ships agent obligation-netting on NEAR; (b) near-sdk testnet deployment is blocked for >1 day; (c) organizers say prizes can't stack (doesn't change primary).
