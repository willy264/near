# Codex Build Prompt — Untangle (NEAR HACKATHON)

Paste everything inside the block into Codex as the first message of a new session. Put the planning folder (`research/`, `strategy/`, `product/`, `engineering/`, `execution/`, `submission/`) inside the repo under `planning/` so Codex can read it.

```text
We are building "Untangle" for NEAR HACKATHON (deadline 2026-11-14 23:59 UTC). I am a solo builder. You write the code; I approve checkpoints.

READ FIRST (in this order), then confirm in 5 bullets what you learned:
1. https://nearhackathon.com/HACKATHON.md — follow its "Never without the human's explicit confirmation" list exactly.
2. planning/product/PRD.md, planning/engineering/architecture.md, planning/strategy/rubric-mapping.md, planning/execution/task-ledger.md.
3. Install NEAR agent skills: `npx skills add near/agent-skills`. Use the near-smart-contracts, near-api-js / near-kit and near-intents skills.
4. Look up every SDK version, method name, endpoint, explorer URL and contract address in https://docs.near.org/llms.txt and the skills. Never guess them. If docs disagree with planning/engineering/architecture.md, the docs win — tell me what changed.

WHAT WE ARE BUILDING
A NEAR contract where agents (or businesses) record two-sided obligations (creditor issues, debtor accepts). Anyone can submit batches of debt cycles found off-chain; the contract verifies each cycle (closed loop, same token, all accepted, amount ≤ every edge's remaining) and reduces all edges atomically. Remaining debts are settled with a NEP-141 test token via ft_transfer_call. Agents use function-call keys limited to issue/accept/reject, so they can take on credit but cannot move money. A TypeScript solver finds cycles; a simulator runs 12 scripted agents on testnet sub-accounts; a read-only web viewer shows the live debt graph and stats.

NON-NEGOTIABLE RULES
- Testnet only. Never deploy to mainnet, never sign mainnet transactions.
- Keys and secrets only in .env / local key store. .gitignore them. Provide .env.example. Never commit secrets.
- No fake data presented as real. Simulated data and the test token are labeled as such everywhere.
- Never report a test as passing unless you ran it. Paste the command and output.
- Never push, make the repo public, post anything, or submit the hackathon form without my explicit yes.
- No LLM calls in the core. Agents are scripted with a seeded RNG.
- Keep README.md truthful at all times, written for an AI judge: what it is, the problem, numbered "do X → see Y" steps. No marketing.
- Commit after every working milestone with a clear message.

REPO LAYOUT
contracts/untangle (Rust, near-sdk), contracts/test-token (NEP-141 "tUSD", capped faucet, TEST ONLY), shared/ (TS types + pure TS model of the clearing rules), solver/ (TS), sim/ (TS), web/ (Vite + TS, free graph lib), scripts/ (judge.sh, deploy-testnet.sh), fixtures/, docs/evidence/, planning/, README.md, RULES.md, LICENSE (MIT).

BUILD ORDER (critical path first — do not start a later step before the earlier one is green)
1. RULES.md: exact clearing and settlement rules + invariants. README skeleton. Contract skeleton: issue/accept/reject + unit tests.
2. submit_clearing with every rejection case (open path, mixed token, unaccepted, over-amount, length > MAX_LEN, same id reused beyond remaining) + invariant test: no account's net position changes. tUSD token. ft_on_transfer settlement with partial pay, refund of excess, failure callback that restores state. NEP-297 events. Views: get_obligation, list_open (paginated), net_position, stats(token), solver_leaderboard.
3. Deploy both contracts to testnet via scripts/deploy-testnet.sh. Prove on testnet that an agent function-call key (methods issue/accept/reject) can issue/accept but cannot settle; save tx hashes and outputs to docs/evidence/. Measure gas for cycle lengths 2..12 and set MAX_LEN and batch size from the data.
4. shared/ model + solver (greedy shortest-cycle cancellation) + property tests on random graphs (net positions preserved; result accepted by the model). Fixture export/import.
5. Simulator: local mode (in-memory, no network) and testnet mode (sub-accounts agent-01..agent-12 under one parent, function-call keys, seeded roles trading services for N rounds, solver run, residual settlement). Writes fixtures/ and docs/evidence/<run>.md with every tx hash.
6. web/: read-only viewer over public testnet RPC (no wallet, no key): graph (edge width ∝ remaining), totals, cleared ratio, latest clearing tx link; "Dry-run clearing" button that runs the solver in the browser and is clearly labeled dry-run. Must work on mobile width.
7. Scenario 2: 8 fictional small firms with supplier chains on the same contract.
8. scripts/judge.sh: cargo test → npm test → sim local on fixture seed with numbered checkpoints matching README → if network available, print live testnet stats. Must pass on a fresh clone with NO .env. Add a CI workflow running it.
Stretch only after 1–8 pass: optimal solver comparison (report honestly), NEAR Intents 1Click dry:true quote for paying a residue on another chain (no funds), CSV export, solver leaderboard UI.

README MUST CONTAIN
What it is (2 sentences) · The problem · How it works (rules, diagram in text) · NEAR features used (sub-accounts, function-call keys, NEP-141, events; Intents only if actually used) · "For AI judges": exact commands and expected output · Live demo URL + testnet contract IDs + explorer links · Evidence (numbers only from docs/evidence runs, with seed and parameters) · Prior art: Cycles (cycles.money, arXiv 2507.22309), Ledgerloops; what is different here · Limitations · Libraries and AI assistance used (Codex) · Hackathon window note (all code written from 2026-10-19 onward) · License.

CHECKPOINT NOW
Before writing any code: (a) list the exact near-sdk / cargo-near / near-api-js (or near-kit) versions you'll use and where you found them; (b) show RULES.md draft; (c) show the file tree; (d) list anything in the planning docs you think is wrong. Then wait for my OK.
```

## How to run the sessions
- One Codex session per build step; start each with "Read planning/execution/handoff.md and the ledger, continue at step N."
- At the end of each session ask Codex to update `planning/execution/task-ledger.md` and `planning/execution/handoff.md`.
- Day 10: open the repo fresh in Claude Code *and* Codex and ask each: "You are a hackathon judge. Follow the README exactly from a fresh clone. Report every step that fails or doesn't match the README." Fix everything they find.
