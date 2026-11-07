# Independent Codex judge review — 2026-11-07

Reviewed commit `d1bed5e` in a clean Linux Ext4 clone at `/tmp/untangle-codex-review-d1bed5e`. No `.env`, `.keys`, or pre-existing node_modules. Node 26.13.0 and pnpm 12.16.1 were supplied as prerequisites; Rust was excluded from PATH.

Commands:
```sh
git clone --no-hardlinks /mnt/c/Users/HP/Documents/people/hackathons/near /tmp/untangle-codex-review-d1bed5e
cd /tmp/untangle-codex-review-d1bed5e
git checkout d1bed5e
bash scripts/judge.sh --quick
```

Result: **FAIL** at TypeScript solver performance assertion. Shared 4, client 1 and simulator 1 tests passed; solver 3 passed and 1 failed. Exact output is in [codex-review-ext4.log](codex-review-ext4.log).

```text
AssertionError: expected 2077.8310770000007 to be less than 2000
Tests 1 failed | 3 passed (4)
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL
```

The host was also doing other work; this is not a controlled performance benchmark. Nevertheless the literal README quick command failed, and later typecheck/fixture/simulation checkpoints were not reached. Do not count this run as passing or use it to claim the two-minute target. Consider optimizing the solver or separating the machine-dependent performance benchmark from correctness tests while retaining an explicit measured performance gate.

Static findings: quick mode correctly avoids Rust and live network queries after dependency installation. README distinguishes the earlier 47+2 unit run from the later 48+2 run rather than rewriting counts. Live-stats now catches RPC failure, emits a single skip line and restores SDK console handlers in finally. This review did not run full Rust/sandbox tests, publish a site, or use any signing keys.

A separate working-tree snapshot run on the Windows-mounted filesystem is recorded in `codex-review-quick.log`; it is not the clean committed-clone result above.

## Fix verification

The builder applied a two-edge fast path and final-layer BFS pruning without changing the 2-second threshold. Its targeted solver tests and all 12 fixtures passed (`solver-review-fix.log`). I reran the exact `bash scripts/judge.sh --quick` command in the Ext4 clone with only that solver source replaced. This is a modified-clone verification, not an unmodified commit claim.

**PASS, 60 seconds**, with cached dependencies; 10 TypeScript tests passed, web and root typechecks passed, all 12 fixtures matched, and the final local simulation completed:
```text
12 deterministic local scenario/seed fixtures matched; no network, .env, keys or funds.
SIMULATED: cleared 295 of 735 tUSD (test token) (40.13%) with 0 transfers; 81 payments settled the rest; 11 creditor withdrawals.
Elapsed: 60 seconds
```

Exact output: [codex-review-ext4-fixed.log](codex-review-ext4-fixed.log). The runtime target is met for this cached Ext4 run; it is not established for a cold network install or the Windows-mounted filesystem.

## Journal/CLI concurrency follow-up

Copied the current journal and simulator CLI into the isolated Ext4 review clone. Ran `pnpm --filter @untangle/client test` (1 passed) and `pnpm typecheck` (completed), then created an existing per-run lock and ran `pnpm sim run --scenario firms --seed 42 --mode testnet`. The command rejected with `Run already locked` before reading keys or accessing the network, and retained the original lock. Output: [codex-review-lock.log](codex-review-lock.log). The PowerShell wrapper reported exit 1 while collecting native stderr; the inner script reached its explicit final PASS marker after all assertions.

Inspection: exclusive `wx` acquisition blocks duplicate CLI runners. The finally block only removes a lock acquired by that process. Absolute journal paths prevent later working-directory changes from redirecting saves; PID-specific temporary files remove the previous shared-temp collision. Direct Journal users still bypass the CLI lock; this is not multi-writer journal synchronization. Abrupt termination leaves a stale lock intentionally; confirm no process is running before manually removing it. Acquisition errors other than EEXIST currently share the locked-error message, a minor diagnostic limitation.

The initial per-run lock allowed distinct scenarios to share signing accounts concurrently. The builder changed it to global `.sim-state/testnet.lock`. I copied the updated CLI, created that global lock in the isolated clone, and reran the firms command. It rejected before setup and preserved the lock; wrapper exit 0 and explicit PASS. See [codex-review-global-lock.log](codex-review-global-lock.log). This resolves CLI concurrency across scenarios within the same workspace; separate workspaces sharing keys still require operator coordination.

## Transient filesystem denial follow-up

Reviewed bounded rename retry: only EACCES/EPERM/EBUSY are retried, with the same tempfile and destination; eight total attempts and 700ms total backoff. Other errors and exhausted retries throw without truncating the previous durable journal. Added a regression test injecting one EACCES while checking the old journal remains readable, then verifying the next rename persists new state. In the isolated clone, `pnpm --filter @untangle/client test` passed **2 tests**, and `pnpm typecheck` passed; combined shell exit 0. Exact output: [codex-review-rename.log](codex-review-rename.log). No active run state was read by this review.
