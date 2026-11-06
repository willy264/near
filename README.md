# Untangle

Untangle records two-sided obligations and cancels verified debt cycles on NEAR testnet. Remaining debts are paid using tUSD, a simulated test token with no value, then creditors withdraw their balances.

## Current state

The contract and token are implemented and deployed to testnet. Unit tests and the sandbox integration flow passed; see [unit evidence](docs/evidence/tests-2026-11-06.md) and [sandbox evidence](docs/evidence/sandbox-2026-11-06.md). The simulator, solver and viewer are not complete. Testnet key proof and gas measurements are in progress; no completed demo is claimed.

## Development

Prerequisites: Rust 1.99.1, cargo-near 0.22.0, Node 26.13.0 LTS and pnpm 12.16.1. Sandbox tests require Linux or macOS; on this Windows build machine they run in Ubuntu WSL.

1. Run `cargo test --manifest-path contracts/Cargo.toml -p untangle -p untangle-test-token` to run the ledger and token unit tests. See `docs/evidence/unit-tests-latest.log` for the recorded output.
2. Build the contracts using `cargo near build non-reproducible-wasm --locked --no-abi --manifest-path contracts/untangle/Cargo.toml` and the equivalent command for `contracts/test-token/Cargo.toml`.
3. On Linux/macOS, run `cargo test --manifest-path contracts/Cargo.toml -p untangle-integration-tests -- --nocapture` to run the sandbox flow. Initial dependencies and sandbox download require network access.

The judge script is not implemented yet. These builds are not claimed to be Docker-reproducible.

## Testnet contracts

Deployment IDs, code hashes and transaction hashes are saved in [deployments/testnet.json](deployments/testnet.json). Both contracts are on testnet only:

- Ledger: `ledger.untangle-261106-e1386a.testnet`
- Test token: `tusd.untangle-261106-e1386a.testnet`

## Rules and limitations

See [RULES.md](RULES.md). Issuance requires prepaid storage; acceptance requires an operator-set debtor cap. Clearing preserves net positions. Payment credits an internal creditor balance; withdrawal failure restores that balance.

This is an unfinished hackathon implementation. Debts are public, the token has no value, the operator retains contract upgrade keys, and no mainnet security or production-readiness claim is made. Simulations will be scripted, with no LLM calls.

## Built with

Rust; near-sdk 5.30.1; near-contract-standards 5.30.1; cargo-near 0.22.0; near-workspaces 0.24.0; near-api-js 7.4.0. Additional pinned dependencies are in the manifests and lockfiles. Codex implements the code under human direction; Claude supplied research and planning.

## Hackathon and license

Built for NEAR HACKATHON 2026. Project implementation began November 6, 2026. MIT license; see [LICENSE](LICENSE).
