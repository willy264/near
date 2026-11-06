# 03 — Judging Intelligence

Accessed 2026-11-02.

## 1. What is officially published
**No numeric rubric or weights exist** for this event (VERIFIED absence on S1, S2, S3). Official statements:

| Statement | Source | Status |
|---|---|---|
| "Claude Code & Codex screen every project first: they check that it runs and does what the README says. The human judges above make the decisions." | S1 FAQ | VERIFIED |
| AI role: "Screening, not deciding: reproducibility check, feature verification, structured report, preliminary score. Humans decide; low AI score alone cannot reject." | S2 Q-017 | VERIFIED |
| "Previous NEAR hackathons evaluated technical implementation, design, impact, originality and sustainability — a good guide to prepare by." | S1 FAQ | VERIFIED (as guidance, not rubric) |
| README "for a machine reader as well as a human one: what the product is, the problem it solves, and how to try it as 'do X - see Y' steps a judge can follow. No marketing." | S2 | VERIFIED |
| Demo post guidance: lead with user problem; show one complete moment from real user action to visible result; explain NEAR's role concretely (not "powered by NEAR"); give a next step | S2 | VERIFIED |
| Track-specific bars (thesis, games, memecoins, social, realworld) | S1/S3 | VERIFIED — see 02 |
| Hints are "what the organizers hope to see… name them in the README" | S2 | VERIFIED |

## 2. Criterion → evidence map
The five criteria below are the officially suggested *guide*, not a confirmed rubric. Weights are **our planning assumption** only.

| Criterion (guide) | Our weight (internal) | Evidence that satisfies it | Superficial version that fails | Exceptional evidence |
|---|---|---|---|---|
| **Reproducibility gate** (AI screen — not in the 5, but precedes them) | gate | Fresh clone → one command → documented output matches README | README claims features that need keys, mainnet funds or manual steps the screener can't do | `make judge` / `npm run demo` that runs offline or on testnet with seeded accounts, prints numbered checkpoints matching README "do X → see Y"; CI badge showing the same run |
| Technical implementation | 30% | Working NEAR contract or integration on the critical path; tests run | UI over a mock; LLM wrapper; contract unused | Contract tests + integration test against testnet; attestation/tx hashes in output; explorer links |
| Impact | 20% | Named user, real pain, outcome measurable in the demo | "Could revolutionize X" | Baseline vs result shown (time, cost, risk blocked), with honest limits |
| Originality | 20% | Mechanism differs from starter prompt & from public repos | Literal starter idea | One-sentence insight a judge hasn't heard; documented nearest alternatives in README |
| Design / UX | 15% | Clear flow, readable states, chain hidden where appropriate | Generic dashboard, wallet popups everywhere | End-to-end flow a non-crypto user completes; games/realworld: chain invisible |
| Sustainability | 15% | Why it keeps running after the hackathon (economics, owner, users) | None stated | Revenue/incentive model actually wired (fees, revenue split) + next steps |

## 3. Implications of the AI screener (INFERRED, high confidence)
- Screeners run in sandboxes. Things they likely **cannot** do: hold mainnet funds, solve wallet popups, log in with social accounts, get your API keys. Every feature claimed must have a path that works without those, or be clearly labeled "requires X; recorded in video."
- Inconsistencies are cheap to detect by a model and expensive for us: e.g. AgentGuard's README states 7 tests in one place and 9 in another, and two different slippage limits (observed 2026-11-02). Keep numbers in README generated from actual runs.
- A machine-readable section (`## For AI judges` with exact commands and expected outputs) is low-cost and directly targets the screener's task.

## 4. Judges — public affiliations
Affiliations below are VERIFIED from S1. Background notes are from general public knowledge (**INFERRED**, not re-verified this session). They indicate what the judges are *likely to understand deeply*, not how they will score.

| Judge | Affiliation (S1) | Public background (INFERRED) | What a submission should be ready for |
|---|---|---|---|
| Illia Polosukhin | NEAR Protocol (@ilblackdragon) | NEAR co-founder; co-author of "Attention Is All You Need"; pushes user-owned AI, chain abstraction, NEAR AI | Real use of NEAR-specific primitives (Intents, Chain Signatures, NEAR AI Cloud TEE), not generic EVM-style code |
| Eddy Lazzarin | a16z crypto | CTO of a16z crypto; writes on crypto design, mechanism design | Sound mechanism design; clear "why a blockchain" |
| Mert Mumtaz | Helius | CEO of Helius (Solana RPC/infra); outspoken on privacy and UX | Performance, developer experience, privacy claims that hold up |
| Avichal Garg | Electric Capital | Co-founder Electric Capital (known for the Developer Report, data-driven) | Evidence and data; developer adoption |
| Kain Warwick | Synthetix & Infinex | Founder of Synthetix (derivatives) and Infinex (cross-chain UX) | DeFi/perps correctness; chain-abstracted UX |
| Haseeb Qureshi | Dragonfly | Managing partner, Dragonfly; writes widely on crypto markets | Market thesis, business viability |
| Stepan Gershuni | cyber•Fund | Investor / researcher in AI × crypto | Agentic and AI-native ideas with substance |
| Claude Code & Codex | Anthropic & OpenAI | Screening only | Reproducibility & claim verification |

Do not contact judges for preferences. Do not tailor claims to imagined individual tastes.

## 5. Submission implications (actionable)
1. Write README **first** in "do X → see Y" form; keep it truthful as code evolves.
2. Provide a no-funds path for every claim (testnet, dry-run quotes, seeded fixtures).
3. Put hint names that you actually use in the README (organizers asked for this).
4. Demo video: one complete user moment, < ~90 seconds is a reasonable target (INFERRED; no length specified).
5. Description field (≤2,000 chars) = problem, product, NEAR's concrete role.
