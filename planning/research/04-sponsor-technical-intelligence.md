# 04 — Ecosystem / Sponsor Technical Intelligence

Accessed 2026-11-02. The site lists 14 ecosystem partners as **tools**, not prize sponsors. Integration with any of them is optional (Q-011). Depth: ★ = overview read this session, ☆ = links only (not read).

## Core NEAR tooling (applies to every track)
| Item | What it gives | Link | Notes |
|---|---|---|---|
| NEAR agent skills | Agent skills: `near-ai-cloud`, `near-api-js`, `near-dapp`, `near-intents`, `near-kit`, `near-smart-contracts` | `npx skills add near/agent-skills` · github.com/near/agent-skills | VERIFIED via S3 00-setup.md |
| LLM-friendly docs | docs.near.org/llms.txt, docs.near-intents.org/llms.txt | | Use to find exact endpoints; never guess (S3) |
| Public RPC | Free providers | docs.near.org/api/rpc/providers | Q-009 |
| Testnet funds | Free via near-cli faucet / near-faucet.io | | Q-008 |
| Access keys | Full-access vs function-call keys | docs.near.org/protocol/accounts-contracts/access-keys | Caveat (S3 security note): an account holding only function-call keys can't transfer NEAR or add keys, and can lock itself out if gas allowance runs out |
| NEAR MCP server | Lets agents act on NEAR | github.com/nearai/near-mcp | ☆ |
| BigQuery dataset | `bigquery-public-data.crypto_near_mainnet_us` | docs.near.org/data-infrastructure/big-query | You pay query costs; filter on `block_date` (S3) |

## Partners
| Partner | Category | Docs | Hackathon-relevant capability | Access / cost | Risk |
|---|---|---|---|---|---|
| **NEAR Intents / 1Click API** ★ | Cross-chain execution | docs.near-intents.org · github.com/near/intents | Quotes, deposits, status tracking for swaps across chains; `dry: true` quotes | **No testnet**; JWT optional (partners.near-intents.org) — without it an extra fee (0.2% per S2, 0.25% per docs) | Real money on mainnet; refunds/failed states must be handled |
| **Agent API (agentsonintents)** ☆ | Agent access to Intents | docs.agentsonintents.com/integration/agent-api/overview | Added to prompts on 2026-10-29/30 | UNKNOWN | Newly added — fewer teams will notice (INFERRED) |
| **Chain Signatures** ☆ | NEAR account controls BTC/ETH/etc. addresses via MPC | docs.near.org/chain-abstraction/chain-signatures/getting-started | Contract-owned cross-chain wallets | Testnet available (INFERRED) | Complexity; MPC latency |
| **NEAR AI Cloud** ★ | Private inference in TEEs | docs.near.ai · cloud.near.ai · github.com/nearai/cloud-api | OpenAI-compatible API (base `https://cloud-api.near.ai/v1` per S3); Gateway attestation, model attestation, response signatures; browser Verification Center at cloud.near.ai/verify; example repos `near-examples/nearai-cloud-verification-example`, `nearai/nearai-cloud-verifier` | Paid credits; $10 free via NEAR Builders join (Q-000) | `{slug}.completions.near.ai` direct path is experimental |
| **OutLayer** ★ | Verifiable compute & agent custody | app.outlayer.ai/docs/getting-started · github.com/out-layer/outlayer | WASM runs in Intel TDX with attestation (code hash, input hash, output, measurements); private keys can stay in TEE; Confidential Key Derivation; dashboard: Wallets, Approvals, Connectors, Vaults, Audit log; called from a NEAR contract (`request_execution`, yield/resume) or HTTPS (X-Payment-Key, USDC) | Per-execution pricing; testnet contract `outlayer.testnet` referenced (testnet support INFERRED) | Policy/spend-limit semantics not documented on overview page |
| **Agent Market** ★ | Marketplace hiring agents per job | market.near.ai · docs.market.near.ai · API ref market.near.ai/docs | Post brief → agent takes job → escrow → accept/dispute; MCP surface for agents to work and subcontract; list your own agent (~10 min) | Auth/payment token not on overview page | Programmatic posting not yet verified — starter prompt itself says "if there's no public way, tell me" |
| **PingPay Agent Pay** ☆ | x402 facilitator | pingpay.gitbook.io/docs/pingpay-api/agent-pay-facilitator | HTTP 402 pay-per-call for agents | UNKNOWN | — |
| **Aurora / Aurora Intents** ☆ | EVM on NEAR | doc.aurora.dev · intents.aurora.dev | Solidity teams can deploy on NEAR | — | Judges may value NEAR-native over EVM port (INFERRED) |
| **HOT** ☆ | Chain abstraction | docs.hotdao.ai | Wallet / chain abstraction | — | — |
| **HEX** ☆ | Cross-chain swaps | hot-labs.gitbook.io/hex | Interactive blocks | No public git | — |
| **Rhea** (formerly Ref/Burrow lineage — INFERRED) ☆ | DEX + lending | guide.rhea.finance · github.com/rhea-finance/rhea-sdk-docs | CLMM/AMM pools, cross-chain swap API, vaults on lending; CLI trading | — | Organizer partner note invites building on it (S2) |
| **meme.cooking** ☆ | Memecoin launchpad | docs.meme.cooking · api.meme.cooking | Launch NEP-141 memes | — | — |
| **Trezu** ☆ | Multisig treasury | github.com/NEAR-DevHub/trezu-docs | Treasury flows | — | Must read code to find approval hooks |
| **Sputnik DAO** ☆ | DAO contract | github.com/near-daos/sputnik-dao-contract | Proposals, roles, policies | — | Policy model is complex |
| **near.social** ☆ | Social graph | near.social/skill.md | Posts are writes to `social` account; tx shows failed (CodeDoesNotExist) but data lands; verify via api2.near.social/v1/tx/{hash} | — | Confusing failure semantics (documented) |
| **Top Level Accounts (TLA)** ☆ | Named accounts as NFTs | nearaccounts.com · github.com/houseofstake/tla-contracts | A rented name is an NEP-171 NFT *and* a real account; live, audited on mainnet; no SDK | — | Build directly on contracts |
| **SVRN** ☆ | Sovereign tech research | svrn.net/research/near-protocol | Research context | — | — |
| **GoMining** ☆ | Bitcoin mining superapp | docs.gomining.com | Unclear hackathon fit | — | — |
| **NEAR Builders** | Community + $10 AI credits | nearbuilders.org/build | Resource hub | Free | — |

## Capabilities likely underused by competitors (HYPOTHESIS)
1. **Response signatures + attestation from NEAR AI Cloud** as a *product feature* (proof a specific model produced a specific output) rather than a badge.
2. **OutLayer contract callbacks** (yield/resume) — verifiable off-chain compute that a NEAR contract consumes; enables contracts whose logic depends on AI/heavy computation with proof.
3. **TLA accounts-as-NFTs** — no SDK means little competition.
4. **Agent API / x402** — added to the official prompts only on 2026-10-29/30.
5. **NEAR BigQuery dataset** — cheap, public, reproducible.

## Technical risks
- Intents mainnet-only → real loss risk and screener can't reproduce; mitigate with dry-run + recorded video + tx links.
- Function-call-key-only agents can brick themselves on gas (documented).
- NEAR AI Cloud & OutLayer are paid; keys must stay in `.env`; screener path must not need them (fixture/recorded responses, clearly labeled).
