# Dependency audit — 2026-11-07

`cargo audit --file contracts/Cargo.lock --json` reported one vulnerability, RUSTSEC-2026-0387 in crypto-bigint 0.5.5. This is not a clean audit.

`cargo tree --manifest-path contracts/Cargo.toml -i crypto-bigint --locked` traces it through elliptic-curve 0.13.8, p256 0.13.2 and near-vm-runner 0.38.0, enabled by near-sdk's native unit-testing feature. See audit-dependency-path.txt.

`cargo tree --manifest-path contracts/Cargo.toml -p untangle -p untangle-test-token --target wasm32-unknown-unknown -e normal --locked` contains neither crypto-bigint nor near-vm-runner. The affected crate is absent from both production contract WASM dependency trees; see wasm-dependency-tree.txt. It is a native test dependency, not contract execution code.

[The RustSec advisory](https://rustsec.org/advisories/RUSTSEC-2026-0387.html) describes timing variability and lists >=0.7.6 as patched. A precise update to 0.7.6 failed: the existing elliptic-curve dependency requires the 0.5 series, and Cargo also reported 0.7.6 as yanked. No incompatible patch was forced. The finding remains open for an upstream compatible SDK/test-VM update. Do not use this native test stack for secret-bearing production cryptography.

The full JSON audit is rust-audit.json. This assessment does not claim that every transitive dependency is vulnerability-free.

Registry follow-up on 2026-11-07: crates.io reports latest stable near-sdk 5.30.1 and near-vm-runner 0.38.0, both already pinned/in use. Latest stable crypto-bigint is 0.7.10 (patched series), but elliptic-curve 0.13.8 requires crypto-bigint ^0.5. There is no newer stable SDK/VM pair available from this registry check to carry the incompatible crypto dependency upgrade. Sources: crates.io API `/api/v1/crates/{crate}` and `/api/v1/crates/elliptic-curve/0.13.8/dependencies`.
