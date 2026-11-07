# Decisions — 2026-11-06

Approved corrections:
1. demoUrl is the public X demo post URL.
2. Fixed per-obligation storage fee: measure worst case after flushing in tests, round up with margin; charge creditor and refund storage_payer. Registration minimum covers account bookkeeping. No runtime byte measurement.
3. Sandbox proves receipt rollback; caught unit panics do not. View equality is not byte-identical proof.
4. Debt caps cannot be lowered below payable.
5. remove_token is removed entirely; add_token remains owner-only with one yocto.
6. Agent methods include issue, issue_many, accept, accept_many, reject, cancel.
7. Long simple cycles cannot generally be split without extra edges; report unsupported optimal circulation honestly.
8. Verify dependency pins by building and log compatibility fallbacks.

BUILD-SPEC.md was absent from the ZIP; the full specification is currently in the conversation.

Toolchain finding: cargo install cargo-near --version 0.22.0 --locked failed in aws-lc-sys 0.39.1: NASM command not found. Investigating NASM installation; this is an environment prerequisite, not evidence of incompatible SDK pins.

2026-11-06: user explicitly directed manual code/testing while cargo-near installs; this overrides skill scaffold-only guidance. Full BUILD-SPEC replacement was not visible: only the 14KB condensed copy remained. Deleted that condensed copy as requested; full conversation v1.1 governs until the replacement is available.

Storage hardening: additional per-token account buckets reserve another registration minimum; persistent pair limits and first solver/token leaderboard entry reserve a fixed fee. Empty account index sets and zero-exposure pairs without limits are removed. This closes unbounded storage growth through nominally zero-deposit calls. Solvers remain permissionless but must prepay their first leaderboard entry. The fixed-fee measurements must cover these entries before deployment.

Integration first run reached scoped-key issue/accept but failed NotEnoughAllowance: near-workspaces max_gas reserves 1000Tgas on the current sandbox, exceeding the 0.25NEAR key allowance. Helper now explicitly attaches 100Tgas. Keep the requested final measured safety ceiling of 180Tgas; do not infer the current protocol limit from the old 300Tgas assumption.
near-api-js 7.4.0 correction: skill action example addFunctionAccessKey is stale; installed official declarations/export use actions.addFunctionCallAccessKey. Account.addFunctionCallAccessKey remains as documented.

User explicitly authorized adding origin https://github.com/willy264/near.git and pushing main on 2026-11-06. Existing local milestone commits are preserved. Full-history and working-tree secret scans are required before the push.

2026-11-06: Repository pushed with explicit user authorization. Origin/main verified at 6880c92. Full-history gitleaks scan found no leaks after exact-value exceptions for documentation placeholders/public values. Testnet faucet top-up follows the official near/docs snippets/faucet.jsx flow (5 test NEAR); temporary account retained. Storage measurement now flushes every collection before the baseline: 2459 bytes, fee covers 4000 bytes.

2026-11-06 gas freeze: testnet configuration is max cycle 12, max cycles/batch 5, issue batch 20, memo 128 bytes. Combined 5 x length 12 used 112.436179311279 Tgas. 20 x length 4 used 150.217059342196 Tgas; 40 x length 4 exhausted 300 Tgas. Issue_many(40) hit log output limits. Measurements use two accounts with distinct edges, not a distinct-account worst case. Failed benchmark obligations were cleared using smaller valid batches; no debt was discarded.

2026-11-06: Queried deployed contract_source_metadata: version 0.1.0, NEP-330 version 1.3.0, link=null and build_info=null. README now explicitly avoids source-verification claims. Docker CLI is installed but its daemon is unavailable; existing deployments remain noted non-reproducible builds. CI actions were resolved from official release APIs (checkout7.0.1, setup-node7.1.0, pnpm/action-setup6.1.1, gitleaks-action3.0.0).

2026-11-07: Human approved Vercel/Cloudflare publication and all current pushes. Testnet evidence pushed first as dad33ad. Rust channel changed to stable, package minimum 1.95; Node engine >=22.22.2 per independent clean Linux review. Preserve each run's actual test count (reviewed 47+2, later regression run 48+2). Explorer links use verified NearBlocks /txns/ and /address/ formats. Native test-only crypto-bigint advisory remains documented; incompatible patched major cannot replace transitive 0.5 requirement.

2026-11-07: Fresh review revealed2077.831ms solver vs2s threshold. Added deterministic2-edge fastpath/final-depth pruning;710.866ms and12 unchangedfixtures. No threshold relaxation. Public viewer deployed authorized Vercel Hobby. Same-run CLI lock and process-specific journal temp prevent overlapping testnet runners; no replacement signing for ambiguous outcomes. Claude follow-up unavailable due local login, not represented as passed.

2026-11-07 CI scan correction: gitleaks-action3.0.0 defaults to CLI8.24.3, which ignored the modern global allowlists syntax and flagged public tUSD account strings. Pin CLI8.30.1, matching the successful full-history local scan, and explicitconfig. Keep exact-value exclusions only; no broad evidence exclusion. Disable automatic PR comments under no-post authorization rule.

2026-11-07: Human supplied original Claude review verbatim; authentication no longer a review blocker. Offline HiGHS1.15.4 comparison restricts total capacity to safe integers and verifies output bounds/conservation with bigint. It reports unsupported long cycles separately; all12 published fixtures had none. Intents preview uses a documentation-example address and live-catalog Base/Ethereum USDC assets, with dry=true only; simulated tUSD is not an Intents asset. Public viewer displays the recorded quote with timestamp, no execution controls. Personal submission draft stays ignored per live HACKATHON.md.
