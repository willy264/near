#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PWD/.tools/cargo-near-x86_64-unknown-linux-gnu:$PWD/.tools/cargo-near-aarch64-unknown-linux-gnu:$PATH"
echo '[1/6] toolchain check'
rustc --version
cargo --version
node --version
pnpm --version
pnpm install --frozen-lockfile
echo '[2/6] contract unit tests'
cargo test --locked --manifest-path contracts/Cargo.toml -p untangle -p untangle-test-token
echo '[3/6] sandbox integration and model parity'
cargo near --version
cargo near build non-reproducible-wasm --locked --no-abi --manifest-path contracts/untangle/Cargo.toml
cargo near build non-reproducible-wasm --locked --no-abi --manifest-path contracts/test-token/Cargo.toml
mkdir -p .tools
if cargo test --locked --manifest-path contracts/Cargo.toml -p untangle-integration-tests -- --nocapture > .tools/judge-integration.log 2>&1; then
 cat .tools/judge-integration.log
else
 cat .tools/judge-integration.log
 # Only a sandbox binary download failure is skippable. Compilation, assertions,
 # runtime errors and unsupported platforms remain real failures.
 if grep -Eiq '(failed to download|unable to download|error downloading).*(near-sandbox|sandbox)|(near-sandbox|sandbox).*(failed to download|unable to download|error downloading)' .tools/judge-integration.log; then
  echo '[3/6] skipped (no sandbox: binary download failed)'
 else
  exit 1
 fi
fi
echo '[4/6] TypeScript tests and typecheck'
pnpm -r test
pnpm typecheck
echo '[5/6] seeded local simulations compared with committed fixtures'
pnpm exec tsx scripts/verify-fixtures.ts
pnpm exec tsx scripts/live-stats.ts
