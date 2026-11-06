# 06 — Competitor Landscape (current edition)

Accessed 2026-11-02 (day 2 of 14). **Method:** web search only. GitHub's search API was unavailable (no linked GitHub account), and there is no public submission gallery — the site shows a "Submitted projects" counter but its value did not render ("—"). **Competition density per track is therefore UNKNOWN**; the list below is a small, biased sample of teams who published early.

## Publicly visible projects
| Project | URL | Tracks (self-declared) | What it does | Evidence quality | Overlap risk |
|---|---|---|---|---|---|
| AgentGuard | github.com/nimrid/agentGuard | security, agents | Firewall + policy engine + sandboxed vault: function-call keys only, prompt-injection screening (Claude Haiku + heuristics), daily quotas, per-tx caps, allowlists, human approval via WebAuthn passkeys, circuit breaker; OutLayer TDX attestation; Intents 1Click + Chain Signatures; ElizaOS/LangChain middleware | README claims 5/5 eval scenarios, 9 Rust tests, 29 SDK tests (self-reported); minor README inconsistencies (7 vs 9 tests; 1.5% vs 5% slippage) | **High** for any "policy engine / spend limits" idea |
| Agent Economy on NEAR (CEOClaw) | github.com/CEOClaw/agent-economy-near | agents, swarms | Agent hires agent, pays NEAR via escrow, delivers via MCP; evaluating Agent Market integration | Pre-build, planning stage as of README | Medium for agent-hires-agent loops |
| Bot Desk (kwelx) | github.com/kwelx/near-bot-desk | agents, business | Agent pays 1 testnet NEAR for a skill and gets a deterministic receipt; local mock path for fresh clones; draft X post | Built largely by a Cursor agent (PR authored by `cursoragent`), merged Nov 1 | Low–medium |
| Clearance (by Selliksss) | linked from BrainDAO/near-intents-agent issue #1 | security (inferred) | Open-source "crash test" for money-moving agents: lookalike payees, fake "payment failed" results; found gpt-4.1-mini paid a lookalike payee, another model double-paid after a fake failure | Published per-model results (each attack run once) | **High** for "red-team / evaluate payment agents" ideas |
| BrainDAO near-intents-agent | github.com/BrainDAO/near-intents-agent | agents/defi (inferred) | AI agent using 1Click tools to move funds | Existing repo, target of Clearance test | Medium |

## Observed patterns (INFERRED)
- **Agent security and agent commerce are the default destination** for AI-assisted teams; at least 4 of 5 visible projects sit there before day 2.
- **Teams are heavily AI-agent-built** (Cursor agent PRs, HACKATHON.md designed for agents). Expect many polished-looking but shallow repos; reproducibility and a real mechanism will separate entries.
- **Starter prompts will be cloned.** Every track's example idea is a likely duplicate magnet.
- No visible entries yet for thesis, games, nfts, memecoins, social, realworld — absence of search results is **not** evidence of low density.

## Differentiation opportunities vs visible entries
- Against AgentGuard-style policy engines: they gate *the agent's own* actions; nobody visible yet verifies *counterparties or deliverables* with attested evidence, or ties policy to a DAO/treasury owner (HYPOTHESIS).
- Against Clearance: it measures failures; an entry could instead *prevent* a class of failures by construction (contract-level invariants) — but must not duplicate their test set.
- Against agent-hires-agent loops: few address *how the buyer verifies work quality* before releasing escrow.

## Monitoring plan (continuous)
1. Daily: search X for `#NEARHackathon` and GitHub for "NEAR HACKATHON" README phrases (needs GitHub account linked for API search).
2. Watch NEAR Discord / Telegram builders chat for teams announcing ideas.
3. If a near-identical concept appears: compare mechanisms, document the difference in README, never copy code.
