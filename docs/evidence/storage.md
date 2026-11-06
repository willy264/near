# Storage measurement — 2026-11-06

Command: `cargo test --manifest-path contracts/Cargo.toml -p untangle measured_worst_case_storage -- --nocapture`

```text
worst_case_obligation_bytes=2459; fee=40000000000000000000000; byte_cost=10000000000000000000
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 46 filtered out
cargo_exit_code=0
```

The test uses 64-byte creditor, debtor and token IDs, a 128-byte memo, and fresh obligation/account-index entries. Collections are flushed before the baseline and after issue/accept. The fixed fee covers 4,000 bytes, exceeding the measured 2,459 bytes by more than 20%. Normal calls do not measure storage bytes. Full output: storage-measurement.log.

Registration reserves 0.04 test NEAR per initial account; additional token buckets reserve another registration minimum. Pair-limit and solver-leaderboard entries reserve a separate fixed fee, documented in decisions.md. These constants are conservative; measurements are evidence for this implementation and toolchain, not a protocol-wide storage guarantee.
