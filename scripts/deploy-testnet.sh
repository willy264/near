#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cargo near build non-reproducible-wasm --manifest-path contracts/untangle/Cargo.toml --locked --no-abi
cargo near build non-reproducible-wasm --manifest-path contracts/test-token/Cargo.toml --locked --no-abi
pnpm exec tsx scripts/create-parent.ts
pnpm exec tsx scripts/deploy-testnet.ts
