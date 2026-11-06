# 07 — Domain & Problem Intelligence

Accessed 2026-11-02. This file lists **problem areas** with evidence, not chosen projects. Evidence labels apply per row.

## Problem shortlist
| # | Problem | Evidence | Label | Existing solutions | Gap | Best-fit tracks |
|---|---|---|---|---|---|---|
| P1 | AI agents that move money can be tricked (lookalike payees, fake failure → double-pay, prompt injection) | Clearance crash-test results on public prompts (Oct 29, 2026): one model paid a lookalike payee, another double-paid after a fake "failed" result | VERIFIED (small sample, single runs) | AgentGuard (policy engine), function-call keys, allowlists | Idempotency/one-payment-per-invoice and payee-identity verification are rarely enforced at contract level | security, agents, business |
| P2 | Buyers can't verify an agent's deliverable before paying | Agent Market model = escrow + human accept/dispute (docs); starter prompt asks for "checks the work" | VERIFIED (mechanism) / INFERRED (pain) | Human acceptance, disputes | Automated, evidence-backed acceptance (tests, attested execution, response signatures) | agents, swarms, business, privacy |
| P3 | Hard to prove which model produced an output and that data stayed private | NEAR AI Cloud provides attestation + response signatures + Verification Center | VERIFIED (capability) | Attestation badges | Using signatures as *inputs to contracts/payments* | privacy, security, agents |
| P4 | Freelancers/SMBs in emerging markets get paid cross-border slowly and expensively | General industry knowledge (remittance costs, FX friction) | INFERRED — needs a cited source before claims | Stablecoin wallets, payment links, starter invoicing prompt | Accounting-grade records, local-currency context, gasless UX | realworld |
| P5 | Investors lack reproducible evidence about NEAR usage | Track brief: "judged on the evidence"; BigQuery dataset + Intents Explorer API exist | VERIFIED (data availability) | Dashboards (Dune-like, nearblocks) | Re-runnable, hypothesis-testing analysis with counter-evidence | thesis |
| P6 | DAOs with Sputnik/Trezu still route every small payout through full votes | Track brief + starter "earned trust" bounty tiers | INFERRED | Sputnik policies, Trezu multisig | Reputation-driven approval tiers, budget streams | social |
| P7 | Game economies inflate or collapse because they're patched manually | Track brief | INFERRED | Centralized game economies | Self-balancing agent merchants; chain invisible | games |
| P8 | NFTs hold no value or rights beyond a picture | Track brief; TLA "name = NFT = account" | VERIFIED (TLA primitive) | Dynamic NFTs | Transferable accounts with balances and rights, safe hand-off on sale | nfts |
| P9 | Assets lost when owners die/lose keys across chains | Starter prompt (inheritance via Chain Signatures) | INFERRED | Custodial recovery, Safe modules | One NEAR account governing BTC/ETH with guardian release | open |
| P10 | Memecoins have no lasting mechanic | Track brief | INFERRED | Launchpads (meme.cooking) | Contract-enforced community mechanics with no admin key | memecoins |

## Public datasets & data sources
- NEAR BigQuery: `bigquery-public-data.crypto_near_mainnet_us` (accounts, txs, receipts) — VERIFIED via S3.
- NEAR Intents Explorer API (JWT from partner dashboard) — VERIFIED via S3.
- near.social API `api2.near.social` — VERIFIED via S3.
- Agent Market public job listings (market.near.ai/jobs) — pages are public (VERIFIED: job pages appeared in search).

## Recently practical capabilities (why now)
- TEE-attested inference with per-response signatures (NEAR AI Cloud).
- Verifiable off-chain compute consumable by contracts (OutLayer yield/resume).
- Chain-abstracted cross-chain settlement via 1Click/Agent API.
- Coding agents that can read HACKATHON.md and the NEAR agent skills — lowers build cost for everyone (raises the baseline).

## What NOT to claim without new evidence
Market size, user demand numbers, cost savings percentages, remittance fee statistics. Find a citable source first or label as hypothesis.

## Local context note (user in Lagos)
If the team has first-hand access to Nigerian freelancers or merchants, P4 could gain real user validation (interviews, a pilot invoice) within the window — a genuine advantage over teams writing from assumptions. This is a HYPOTHESIS until confirmed with the user.
