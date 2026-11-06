# Architecture — Untangle

Principle: **solve off-chain, verify on-chain.** Simplest design that proves the mechanism. Codex must confirm every SDK version, method name and address in official docs (docs.near.org/llms.txt, NEAR agent skills) — nothing here overrides the docs.

## Components
| Component | Tech | Responsibility |
|---|---|---|
| `contracts/untangle` | Rust, near-sdk (latest stable per `near-smart-contracts` skill), cargo-near | Obligations, credit limits, cycle verification, settlement, stats, events |
| `contracts/test-token` | Rust NEP-141 (near-contract-standards) | `tUSD` test token with capped faucet; labeled "TEST ONLY" |
| `solver/` | TypeScript (Node 20+) | Read open obligations, find cycles per token, build batches, submit `submit_clearing` |
| `sim/` | TypeScript, near-api-js or near-kit | Create agent sub-accounts, add function-call keys, run scripted service trades, drive settlement |
| `web/` | Vite + TypeScript, d3-force (or similar free lib) | Read-only live view via public RPC; in-browser dry-run using the solver package |
| `shared/` | TS types + a pure TS model of contract clearing rules | Used by solver tests and web dry-run |
| `scripts/` | bash | `judge.sh`, `deploy-testnet.sh`, `seed-fixtures.sh` |
| `fixtures/` | JSON | Snapshot(s) of obligations exported from testnet runs |
| `docs/evidence/` | Markdown + logs | Tx hashes, run outputs, gas measurements |

## Contract state
```
Obligation { id: u64, creditor: AccountId, debtor: AccountId, token: AccountId,
             amount: U128, remaining: U128, status: Issued|Accepted|Rejected|Closed,
             memo: String(≤128), created_ms: u64 }
obligations: IterableMap<u64, Obligation>
open_by_account: LookupMap<AccountId, IterableSet<u64>>   // paginated views
credit_limit: LookupMap<(creditor, debtor, token), U128>
exposure: LookupMap<(creditor, debtor, token), U128>       // sum of remaining accepted
stats: LookupMap<token, Stats{ accepted_total, cleared_total, settled_total }>
solver_stats: LookupMap<AccountId, U128>
accepted_tokens: set (tUSD only for MVP)
```
Storage: callers pay storage via attached deposit on `issue` (or a `storage_deposit`-style registration). Codex to choose per docs; document it.

## Methods
| Method | Caller | Rules |
|---|---|---|
| `new(owner, accepted_tokens)` | deploy | init |
| `set_credit_limit(debtor, token, max)` | creditor | sets cap |
| `issue(debtor, token, amount, memo) -> id` | creditor | creditor ≠ debtor; amount > 0; token accepted; status Issued |
| `accept(id)` / `reject(id)` | debtor | only Issued; accept checks `exposure + amount ≤ limit` (if set); updates exposure & stats.accepted_total |
| `submit_clearing(cycles: Vec<{ids: Vec<u64>, amount: U128}>)` | anyone | per cycle: 2 ≤ len ≤ MAX_LEN (e.g. 12); all Accepted; same token; no repeated id inside batch exceeding remaining; `debtor(ids[i]) == creditor(ids[i+1])` and `debtor(last) == creditor(first)`; `amount ≤ remaining` for all; then subtract, close zeros, update exposure, stats.cleared_total, solver_stats; emit event. Whole call fails on any invalid cycle (atomic) |
| `ft_on_transfer(sender, amount, msg)` | token contract | msg = `{"obligation_id": n}`; sender must be debtor; pay = min(amount, remaining); reduce; forward `pay` to creditor via `ft_transfer`; return unused amount for refund; stats.settled_total |
| views | anyone | `get_obligation`, `list_open(token, from_index, limit)`, `net_position(account, token)`, `stats(token)`, `solver_leaderboard` |

Events: NEP-297 JSON logs `obligation_issued/accepted/rejected/cleared/settled`.

**Invariant (test it):** for every account and token, `Σ remaining owed to it − Σ remaining it owes` is unchanged by `submit_clearing`.

**Forwarding risk:** if `ft_transfer` to creditor fails (unregistered), handle in callback: restore obligation remaining and refund — or require creditors to be registered with tUSD at `issue`. Simpler: require registration (checked at `issue` via cross-contract? costly) → MVP: sim registers every account with tUSD; document; callback restores state on failure.

## Keys & security
- Agent sub-accounts `agent-NN.<parent>.testnet`. Each gets a **function-call key** for the Untangle contract restricted to `["issue","accept","reject"]` with a small allowance.
- Settlement uses the parent/owner full-access key in the sim (FCKs cannot attach deposit; `ft_transfer_call` needs 1 yoctoNEAR) — verify on testnet and record evidence. This is the security story: agents take bounded credit; money only moves under a stronger key.
- All keys in `.env` / local key store; `.gitignore`; secret scan before going public.
- Contract owner powers: none over obligations (no admin edit/delete). Only `add_accepted_token` by owner (MVP) — document.

## Solver
1. Load open accepted obligations for a token (paginate `list_open`).
2. Build directed multigraph debtor → creditor (edge = obligation, weight = remaining).
3. Greedy: repeat — find a short cycle (BFS/DFS from each node, prefer shortest), clear `min(weights)`, update weights — until none or batch limit.
4. Validate batch with `shared/` model (same rules as contract) → submit in chunks sized by measured gas.
5. Optional: optimal via LP / min-cost circulation (stretch); report both.

## Simulator
- Seeded RNG; roles (e.g. data-feed, inference-reseller, summariser, translator, scraper, auditor). Each round, agents buy services from neighbours according to role demand, creditor issues, debtor auto-accepts within its limit.
- Modes: `local` (in-memory model, no network) · `testnet` (real accounts/txs).
- Scenario 2 (realworld, fictional): 8 small firms with supplier chains.
- Writes `fixtures/<scenario>-<seed>.json` and `docs/evidence/<run>.md` with tx hashes.

## Web viewer
- Reads contract via public testnet RPC (no key). Polls every few seconds.
- Graph: nodes = accounts, edges = open obligations (thickness ∝ remaining).
- Panel: accepted total, cleared total, settled total, cleared ratio, latest clearing tx link (testnet explorer).
- "Dry-run clearing" button: runs solver in-browser on the current snapshot and animates what would clear (clearly labeled dry-run).
- Hosted free (Vercel/Netlify/GitHub Pages). Keep online until Nov 25.

## Reproducibility
`scripts/judge.sh`: (1) `cargo test` for contracts (2) `npm test` (solver + property tests) (3) `npm run sim:local` on fixture seed, printing numbered checkpoints (4) if network available, read live testnet `stats()` via RPC and print. Must pass with **no `.env`**. CI runs the same script.

## Known limitations (to state in README)
Testnet + test token only; obligations are public; no due dates/interest; greedy clearing is not optimal; agents are scripted, not LLMs; sim results depend on graph structure.
