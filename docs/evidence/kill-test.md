# Kill test: simulated local runs

All scenarios and seeds use 10 rounds. tUSD is a test token. No network or transactions are used. Demand matrix was fixed before measuring these results.

| Scenario | Seed | Accepted tUSD | Cleared % | Cycles | Payments / obligations | Evidence |
|---|---:|---:|---:|---:|---:|---|
| agents | 42 | 735 | 40.13 | 18 | 81 / 113 | [run](run-agents-42-local-2026-11-06T07-29-24-789Z.md) |
| agents | 7 | 768 | 67.31 | 34 | 55 / 113 | [run](run-agents-7-local-2026-11-06T07-29-25-273Z.md) |
| agents | 1234 | 757 | 62.08 | 23 | 67 / 111 | [run](run-agents-1234-local-2026-11-06T07-29-25-704Z.md) |
| random | 42 | 798 | 62.03 | 44 | 65 / 114 | [run](run-random-42-local-2026-11-06T07-29-26-082Z.md) |
| random | 7 | 862 | 62.06 | 49 | 67 / 126 | [run](run-random-7-local-2026-11-06T07-29-26-815Z.md) |
| random | 1234 | 818 | 68.33 | 51 | 53 / 117 | [run](run-random-1234-local-2026-11-06T07-29-27-282Z.md) |
| supply-chain | 42 | 798 | 0 | 0 | 114 / 114 | [run](run-supply-chain-42-local-2026-11-06T07-29-27-765Z.md) |
| supply-chain | 7 | 862 | 0 | 0 | 126 / 126 | [run](run-supply-chain-7-local-2026-11-06T07-29-28-169Z.md) |
| supply-chain | 1234 | 818 | 0 | 0 | 117 / 117 | [run](run-supply-chain-1234-local-2026-11-06T07-29-28-477Z.md) |
| firms | 42 | 653 | 40.58 | 11 | 52 / 79 | [run](run-firms-42-local-2026-11-06T07-29-28-658Z.md) |
| firms | 7 | 720 | 39.58 | 11 | 65 / 85 | [run](run-firms-7-local-2026-11-06T07-29-28-801Z.md) |
| firms | 1234 | 643 | 49.76 | 11 | 60 / 82 | [run](run-firms-1234-local-2026-11-06T07-29-28-987Z.md) |

Payment counts exclude separate creditor withdrawals. Raw amounts, timings, replay snapshots and all parameters are in the linked JSON files.
