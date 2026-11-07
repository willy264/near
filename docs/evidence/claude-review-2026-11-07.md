# Independent Claude review — fresh clone, 2026-11-07

Reviewer: Claude (Anthropic), acting as a mock NEAR HACKATHON AI judge. Environment: clean Linux container, Node 22.23.4, pnpm 12.16.1, Rust stable 1.97.0. Commit reviewed: `d8edf1a`. The README was followed literally.

## Results
| Step | Command | Result |
|---|---|---|
| 1 | `git clone … && cd near` | PASS |
| 2 | `bash scripts/judge.sh --quick` | PASS in 18 s (5/5 checkpoints; 12 fixtures matched; seed 42 → 295 of 735 tUSD cleared, 40.13%) |
| 4 | `pnpm sim run --scenario agents --seed 42 --mode local` | PASS (same output as the README) |
| 5 | `pnpm solver plan … --fixture fixtures/agents-42-before.json` | PASS (dryRun true, totalReduced 295000000) |
| — | Contract unit tests (`cargo test`, earlier snapshot 811d7d5) | PASS, 47 + 2 |
| — | Testnet evidence file | Present, with per-transaction signer, key role, gas and nearblocks links |
| — | Viewer (local build of this commit, desktop 1280 px and mobile 390 px) | Renders; labels are honest; no console errors |

The full judge script (sandbox and cargo-near) was not run in this review.

## Findings to fix
1. **The viewer opens at replay stage "Trading" and shows "Cleared without transfers: 0 (0%)."** A judge's first impression or screenshot shows 0%. Open at the final stage, or always show the run's headline result (40.13% cleared, 81 payments for 113 obligations) above the replay.
2. Graph labels repeat role names (two "translator" nodes, and so on). Use `agent-01 · translator` style labels.
3. Running the judge steps leaves untracked `docs/evidence/run-*-local-*.{md,json}` files in the clone. Write quick-mode and ad-hoc local runs to an ignored directory, such as `.runs/`.
4. The testnet evidence shows `Elapsed: 108877558.000 ms` (about 30 h), which looks wrong. Label it as wall-clock time including pauses and resumes, or report active time.
5. Remove process notes from the README, such as "blocked by local authentication", "Counts describe their specific runs, not a retroactive change…" and "fresh rehearsal pending". Link this review instead.
6. In the evidence table, put the testnet row first, then sort the rest by scenario and seed.
