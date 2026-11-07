# Greedy versus optimal circulation

Command: `pnpm exec tsx scripts/compare-optimal.ts`

All amounts are simulated tUSD base units (6 decimals). LP maximizes per-edge reduction without a cycle-length constraint. Supported decomposition is separately validated against LedgerModel. Long simple cycles are reported as unsupported, never split using invented edges. This is an offline comparison, not submitted on-chain.

HiGHS 1.15.4 uses floating-point arithmetic; inputs whose total capacity exceeds Number.MAX_SAFE_INTEGER are rejected. Returned integer bounds, flow conservation, objective and supported cycles are checked exactly with bigint. This comparison does not support arbitrary u128 inputs.

| Scenario | Seed | Greedy | LP optimal | Supported | Unsupported | Gap |
|---|---:|---:|---:|---:|---:|---:|
| agents | 7 | 517000000 | 533000000 | 533000000 | 0 | 16000000 |
| agents | 42 | 295000000 | 321000000 | 321000000 | 0 | 26000000 |
| agents | 1234 | 470000000 | 470000000 | 470000000 | 0 | 0 |
| firms | 7 | 285000000 | 332000000 | 332000000 | 0 | 47000000 |
| firms | 42 | 265000000 | 310000000 | 310000000 | 0 | 45000000 |
| firms | 1234 | 320000000 | 361000000 | 361000000 | 0 | 41000000 |
| random | 7 | 535000000 | 637000000 | 637000000 | 0 | 102000000 |
| random | 42 | 495000000 | 589000000 | 589000000 | 0 | 94000000 |
| random | 1234 | 559000000 | 649000000 | 649000000 | 0 | 90000000 |
| supply-chain | 7 | 0 | 0 | 0 | 0 | 0 |
| supply-chain | 42 | 0 | 0 | 0 | 0 | 0 |
| supply-chain | 1234 | 0 | 0 | 0 | 0 | 0 |

Fixture hashes and decomposed cycles: [optimal.json](optimal.json). API source: https://github.com/lovasoa/highs-js (pinned npm package declarations also checked).
