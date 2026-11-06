# Untangle

Untangle is being built to record bilateral obligations and cancel verified debt cycles on NEAR testnet. Residual payments use a simulated tUSD test token and creditor withdrawals.

Status: the first contract unit run passed: see docs/evidence/tests-2026-11-06.md. Integration and testnet verification remain pending. No contracts are deployed; no demo or performance claims are available.

## Development

The pinned Rust version is 1.99.1. Contract sources are in contracts/untangle.

Run cargo test --manifest-path contracts/Cargo.toml to attempt the unit suite. Initial dependency installation is required. This command passed with the installed stable Rust 1.99.1 compiler; see docs/evidence/unit-tests.log.

RULES.md describes the intended rules. docs/evidence contains only completed-run evidence when available. Planning and the full user-supplied v1.1 specification govern implementation.

## License

MIT. Codex is implementing the code under human direction; Claude provided research and planning. Full library versions will be documented after validation.

