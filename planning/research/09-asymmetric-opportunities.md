# 09 — Asymmetric Opportunities (ranked, not a final choice)

Accessed 2026-11-02. Each item is a **hypothesis about advantage**, not a verified one. Ranking = our judgment of (evidence strength × likely overlooked × feasibility).

## A1. Win the AI screening gate decisively (applies to any track) — rank 1
- **Evidence:** Every project is screened by Claude Code & Codex for "runs and does what the README says" (VERIFIED). Visible entries already show README/code inconsistencies (AgentGuard) and mock-only paths (Bot Desk).
- **Insight:** Many entries will be agent-built and look polished but fail fresh-clone reproduction or overclaim.
- **Mechanism:** README-as-test-spec; `judge.sh`; fixture/testnet/mainnet modes; CI badge; claims auto-generated from test output; "For AI judges" section.
- **Rubric mapping:** Gate + technical implementation.
- **Validation:** Run our own fresh-clone test in a clean container with Claude Code and Codex before submitting.
- **Cost:** ~1 day. **Reproducible by others:** yes, but most won't do it rigorously.

## A2. Evidence-first Investment Thesis track — rank 2
- **Evidence:** Only track where "evidence someone else can reproduce" is the stated score; public BigQuery data; judges are mostly investors (VERIFIED affiliations).
- **Why overlooked (INFERRED):** Hackathon builders gravitate to products; analytics feels less "hackathon-y"; BigQuery setup + SQL deters agent-only teams.
- **Mechanism:** Falsifiable hypotheses, one-command rebuild, counter-evidence section, live dashboard.
- **Uncertainty:** Density unknown; may be judged mostly by investors whose priors vary; grand-prize odds probably lower for analysis-only work.
- **Validation:** Run 3 queries day 1; check cost and whether a non-obvious finding emerges.

## A3. "Verify before you pay": evidence-gated settlement for agent work — rank 3
- **Evidence:** Agent Market relies on human accept/dispute (VERIFIED); Clearance shows payment agents fail on fake signals (VERIFIED, small sample); NEAR AI Cloud provides response signatures and attestation; OutLayer provides attested execution consumable by contracts (VERIFIED capabilities).
- **Insight:** Visible entries guard *the agent's own spending*; few verify *the counterparty's delivered work* before money moves (INFERRED).
- **Mechanism:** Escrow contract releases only when an attested checker (OutLayer/TEE) returns pass for a deliverable spec; idempotent one-payment-per-invoice invariant.
- **Tracks:** agents + security + swarms + business + open (stackable).
- **Risk:** Crowded neighborhood; must show a clearly different mechanism; OutLayer integration depth unverified.

## A4. Contract-native primitives few teams can ship (TLA accounts-as-NFTs, Chain Signatures, Sputnik/Trezu hooks) — rank 4
- **Evidence:** TLA is live on mainnet with no SDK (VERIFIED); social track forbids rebuilding the multisig (VERIFIED).
- **Insight:** AI-generated code is weakest where SDKs and examples are sparse → lower competition (INFERRED).
- **Tracks:** nfts, social, open.
- **Risk:** Higher build risk; testnet availability of TLA unknown.

## A5. Real-world money with genuine user validation from Lagos — rank 5
- **Evidence:** Track bar "a normal company could use tomorrow" (VERIFIED); user located in Lagos (context).
- **Insight:** Real users (freelancers/merchants) testing the prototype is evidence most teams can't produce in 2 weeks (HYPOTHESIS).
- **Mechanism:** Payment flow + accountant-grade export + recorded pilot with real (consenting) users.
- **Risk:** Intents mainnet-only; avoid claims about fees/market without sources; starter invoicing idea is a collision magnet — must differ.

## A6. Games/memecoins where the stated bar is easy to show — rank 6
- **Evidence:** "Judged on the game loop/mechanic, not the token/chart" (VERIFIED).
- **Insight:** A fast-forward simulation that visibly proves the mechanic satisfies the bar in 30 seconds of video.
- **Risk:** Game design/art takes time; memecoins may feel unserious to investor judges (INFERRED).

## A7. Track stacking with Open Innovation — tactical
- Always add `open` when the mechanism is unusual; add every genuinely fitting track. Prize-stacking rules UNKNOWN — confirm in Discord.

## Ideas to avoid as-is (high collision)
Literal starter prompts: DCA vault, Intents-volume thesis hypothesis, private expense auditor, one-agent research shop, GPU group-buying swarm, counterparty allow/warn/block service, general-contractor agent, freelancer invoicing, market-town game, membership NFT wallet, streak coin, earned-trust bounty board, inheritance account. Also: generic agent spending-limit firewalls (AgentGuard exists) and payment-agent crash tests (Clearance exists).

## Validation experiments (day 1–2)
1. Fresh-clone screener rehearsal on a hello-world repo (A1).
2. Three BigQuery queries + cost check (A2).
3. OutLayer sample execution + attestation read; NEAR AI Cloud signed response (A3).
4. TLA testnet presence check; Sputnik testnet DAO deploy (A4).
5. 2–3 user conversations if pursuing A5.
