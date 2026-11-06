# Handoff — 2026-11-06

Current state: ledger and tUSD implemented, 47 ledger + 2 token unit tests passed; one comprehensive sandbox integration test passed. Both contracts deployed on testnet; deployments/testnet.json records hashes. Restricted testnet keys issued/accepted and five forbidden actions failed. Operator payment/withdraw succeeded (docs/evidence/keys.md).

Repository: https://github.com/willy264/near.git; main pushed and remote verified at 6880c92 under explicit user authorization. Full-history gitleaks scan of four commits passed. Further benchmark work is local and uncommitted.

Last green commands:
- cargo test --manifest-path contracts/Cargo.toml -p untangle measured_worst_case_storage -- --nocapture: 1 passed, 0 failed, exit 0; measured 2459 bytes against 4000-byte fixed fee.
- pnpm exec tsc --noEmit: exit 0.
- pnpm exec tsx scripts/prove-keys.ts: issue/accept succeeded; five forbidden actions rejected; operator settled/withdrew.

Next action: finish scripts/measure-gas.ts --resume, record all success/failure measurements, validate combined maximum cycle/batch configuration, update deployment config, commit the testnet gate. Then shared model, parity, solver and local simulator/kill test.

Current finding: issue_many(40) with 128-byte memos failed the runtime log limit (tx 8tioh7T6vgNEB5DyPCM6cVYndTVtBGzNfBirGWoHRqJH); receipt reverted. Benchmark now issues at most 20 per call. Large clearing batches are still being measured. Proposed conservative final limits: cycle 12, batch 5, issue batch 20; do not call these frozen until final measurement succeeds.

Tooling: Rust 1.99.1, near-sdk/standards 5.30.1, cargo-near 0.22.0, Node 26.13.0, pnpm 12.16.1. On Windows use the portable Node in .tools and the npm-installed pnpm.exe; old PATH pnpm shim is broken. Sandbox tests run in Ubuntu WSL with target dir /tmp/untangle-integration-target.

Spec: full v1.1 in the conversation is authority. The on-disk condensed BUILD-SPEC was deleted per instruction; no full replacement was visible at that time. Do not write another condensed spec.

Standing authorization: code, install, test, testnet operations and local commits. User additionally authorized pushing this project to willy264/near. Posting, submission, mainnet activity and deleting outside the repository still require explicit approval.

Latest gate: gas measurement COMPLETE. Combined 5 cycles x length 12 used 112.436 Tgas, final configuration frozen at 12/5/128/20 and saved in deployments/testnet.json. All benchmark debts cleared. Next exact action: implement packages/shared LedgerModel and schemas, then contract parity tests and solver/local scenarios. Last green benchmark command: pnpm exec tsx scripts/measure-gas.ts --final.

Latest gate: model, solver and local simulation GREEN. Sandbox parity 25x40 matched (543.90s); TS 9 passed, 50-node/500-edge solver 869.585ms. Kill report delivered; all agents seeds exceed proceed threshold, all supply-chain seeds are zero. Full evidence kill-test.md/parity.md/typescript-tests.log. Viewer built successfully; browser installation/checks in progress. Next: complete viewer checks/judge tooling and implement resumable testnet simulation using seeded trades and scoped keys.
