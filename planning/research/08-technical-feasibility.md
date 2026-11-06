# 08 — Technical Feasibility & Dependencies

Accessed 2026-11-02. "Checked" = verified from docs this session; nothing was executed against live APIs yet.

## Access checks
| Dependency | Access path | Sandbox / free tier | Credential lead time | Checked? | Day-1 test to run |
|---|---|---|---|---|---|
| NEAR testnet account + funds | near-cli / wallet; faucet | Free | Minutes | Docs ✔ | Create `team-dev.testnet`, deploy hello contract |
| NEAR mainnet payout account | Any wallet | — | Minutes (human) | Rule ✔ | Human creates; never agent |
| NEAR AI Cloud | cloud.near.ai API key | $10 credits via NEAR Builders; otherwise paid | Minutes–hours | Docs ✔ | One completion + attestation verify with fresh nonce |
| 1Click API (Intents) | Public; JWT optional | **No testnet**; `dry: true` quotes free | JWT via partners.near-intents.org (UNKNOWN delay) | Docs ✔ | Fetch tokens list + dry quote |
| OutLayer | Dashboard; Payment Keys (USDC) or NEAR | Testnet contract referenced | UNKNOWN | Overview ✔ | Deploy sample WASM, call via HTTPS, read attestation |
| Agent Market API | market.near.ai/docs | UNKNOWN | UNKNOWN | Overview ✔ — **programmatic posting not verified** | Read API ref; post a test job |
| Chain Signatures | Testnet MPC signer | Testnet (INFERRED) | None | Links only | Derive a testnet ETH address from a NEAR account |
| BigQuery | Google Cloud project | Free tier + pay per query | Minutes | Docs ✔ | One `block_date`-filtered query |
| Sputnik DAO / Trezu | Contracts on testnet | Free | None | Links only | Deploy DAO factory instance on testnet |
| TLA contracts | Mainnet (live, audited); testnet UNKNOWN | — | — | Note ✔ | Check for testnet deployment |
| GitHub | Need public repo; our gh CLI lacks a linked account | — | Human links account | ✘ (403) | Link GitHub in claude.ai connectors |

## Reproducibility design (applies to all tracks)
The AI screener must be able to run something meaningful without keys or mainnet funds:
1. `.env.example` with every variable; app starts with none set.
2. **Three modes:** `fixture` (recorded real responses, labeled), `testnet` (needs only testnet key, provided via script that creates a throwaway account), `mainnet` (human only, documented with tx links).
3. `scripts/judge.sh` → runs tests + demo in fixture/testnet mode and prints numbered checkpoints matching README.
4. CI workflow running the same script (public badge = third-party evidence it runs).

## Build-time estimates (rough, team of 1–2 experienced devs; INFERRED)
| Shape | Core contract | Off-chain/agent | UI | Integration risk | Est. days |
|---|---|---|---|---|---|
| Thesis (data + dashboard) | none | SQL + scripts | static site | low | 5–7 |
| Privacy app on NEAR AI Cloud | optional | API + verification | small | low–med | 5–7 |
| Contract-centric (memecoin mechanic, NFT-account, DAO tiers) | 3–5 | light | 2 | med | 7–10 |
| Agent system with payments (testnet + dry-run Intents) | 2–3 | 4–5 | 2 | med–high | 9–12 |
| Game with economy | 2 | 3–4 | 4–5 | med | 10–12 |
| Cross-chain via Chain Signatures | 3–4 | 2 | 2 | high | 10–13 |

Remaining calendar: ~12.9 days. Reserve the final 1.5 days for README, video, X post, security scan, submission.

## Main blockers & mitigations
| Blocker | Mitigation |
|---|---|
| Intents mainnet-only | dry quotes + tiny mainnet run recorded with tx links; never required for screener path |
| Paid AI inference | fixture mode with real recorded, signed responses (label them) |
| Function-call key gas lockout | top-up script; document limits |
| Agent Market API unknown | verify day 1; fall back to own escrow contract |
| Secrets leakage | gitleaks/trufflehog scan of full history before going public |
| GitHub search/API unavailable to us | user links GitHub, or monitor manually via web |

## What can legitimately be reused
Libraries, templates, AI-generated code, own older libraries (count as baseline) — listed in README (Q-005). Existing products from other chains are allowed if the NEAR part is new and separated (Q-002/003).
