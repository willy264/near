# Idea Landscape — 10 concepts, pressure-tested

Date: 2026-11-02. Filter: solo + Codex, free tools, testnet, ~12 days.

## The ten
| # | Concept | Tracks | Target user / pain | Mechanism | Anti-generic verdict | Status |
|---|---|---|---|---|---|---|
| 1 | **Untangle — clearing house for agents** | swarms, agents, realworld, open | Agents (and small firms) that owe each other many small amounts must move money for every debt | Two-sided obligations recorded on NEAR; anyone submits debt *cycles* found off-chain; contract verifies and cancels them; only the residue is paid | Passes: not an LLM wrapper, not a starter prompt, mechanism is verifiable and measurable | **SELECTED** |
| 2 | Agents for sale | nfts, agents, business | Owners can't sell an earning agent with verifiable history | NEP-171 token bound to an agent sub-account; transfer rotates access keys; earnings ledger travels | Borderline: same mechanism as the official nfts starter (NFT ↔ sub-account wallet) | Runner-up #2 |
| 3 | DAO spending cards for people *and* agents | social, security, realworld | DAOs vote on every small spend; agents get all-or-nothing keys | Sputnik proposal issues a capped, expiring "card" (budget contract + function-call key); receipts posted | Moderate: Safe allowance modules exist; AgentGuard covers agent-side limits | Runner-up #3 |
| 4 | Bidding ajo/esusu circle | social, realworld, swarms | West African savings circles rely on trust in a collector | Contract runs rotation, members bid for early payout | **Fails originality:** WeTrust (2017), Celo Esusu grant, EsusuChain, AjoChain, multiple ETHGlobal ROSCA dApps | Rejected |
| 5 | Usage-reality thesis | thesis | Investors can't tell real vs bot activity | BigQuery cohort retention + bot heuristics, re-runnable | Passes, but low grand-prize ceiling | Fallback |
| 6 | Verified-output bounties | privacy, agents | Can't trust an AI judge of bounty work | Payout only when a NEAR AI Cloud signed evaluation passes | Needs paid inference; crowded agent space | Rejected |
| 7 | Proof-of-pay memecoin | memecoins | Memes with no utility | Mints only when holders settle real invoices | Gimmick risk; weak need | Rejected |
| 8 | Merchant-NPC town | games | Game economies need manual patches | NPC agents price from stock/demand; NEP-245 items | Too close to games starter; heavy UI | Rejected |
| 9 | Agent insurance mutual | security, swarms | Agents lose funds to scams | Agents stake; claims paid on tx evidence | Claim verification unsolved in 2 weeks | Rejected |
| 10 | Chain-of-choice DAO payroll | realworld, social | Contributors want pay on their chain | DAO payout → 1Click to any chain | Needs mainnet Intents; near realworld starter | Rejected |

## Top-3 comparison
| Factor | 1 Untangle | 2 Agents for sale | 3 Spending cards |
|---|---|---|---|
| Rubric coverage | High (tech, originality, impact metric, sustainability via solver fees) | Med–high | Medium |
| Distinctiveness vs this event | High (no visible entry) | Medium (starter overlap) | Medium (AgentGuard adjacency) |
| Problem importance (evidence) | **Verified by market:** Cycles raised $6.4M (May 2026) for on-chain clearing; arXiv paper by Buchman et al. | Inferred | Inferred |
| Feasibility solo | High: one contract, a solver, a simulator, a viewer | Medium: key rotation edge cases | Medium: Sputnik policy integration |
| Demo strength | Very high: graph of debts collapses; one number ("% cleared without moving money") | Medium | Medium |
| Reproducible without keys | Yes (unit tests + fixture solver + public RPC reads) | Partly | Partly |
| Free/testnet | Yes | Yes | Yes |
| Failure recovery | Greedy solver works even if optimal solver slips | Hard | Medium |

## Originality check for #1 (nearest alternatives)
| Alternative | What it is | What we do differently |
|---|---|---|
| Cycles (cycles.money; arXiv 2507.22309) | Funded open clearing network for on-chain finance and small firms | Agent-native: obligations created by agents per service call under scoped keys; NEAR contract verifies cycles submitted by *any* solver; runs as an open primitive in this ecosystem. We cite Cycles as prior art and do not claim invention of netting |
| Ledgerloops | P2P obligation-clearing experiment | On-chain, contract-verified, permissionless solvers |
| CreditMesh (ETHGlobal NY 2026) | Receivables financing on Hedera | Financing ≠ netting; we remove debts instead of selling them |
| AgentGuard (this event) | Limits an agent's own spending | We let agents *incur* bounded credit and settle only net residue |

**Honest originality statement:** multilateral netting is an old idea (clearing houses) and an active startup category. What is new here is an agent-economy version on NEAR where agents create two-sided obligations with restricted keys, off-chain solvers compete to find cycles, and the contract checks them in O(cycle length) — making it a public primitive any NEAR agent can use.
