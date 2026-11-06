#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "$(uname -s)-$(uname -m)" in
 Linux-x86_64) target=x86_64-unknown-linux-gnu ;;
 Linux-aarch64) target=aarch64-unknown-linux-gnu ;;
 Darwin-arm64) target=aarch64-apple-darwin ;;
 Darwin-x86_64) target=x86_64-apple-darwin ;;
 *) echo 'Install cargo-near 0.22.0 manually for this platform.' >&2; exit 1 ;;
esac
mkdir -p .tools
archive="cargo-near-$target.tar.gz"
base=https://github.com/near/cargo-near/releases/download/cargo-near-v0.22.0
curl --fail --location --retry 2 "$base/$archive" -o ".tools/$archive"
curl --fail --location --retry 2 "$base/$archive.sha256" -o ".tools/$archive.sha256"
(cd .tools; if command -v sha256sum >/dev/null; then sha256sum -c "$archive.sha256"; else shasum -a 256 -c "$archive.sha256"; fi)
tar -xzf ".tools/$archive" -C .tools
echo "Add $PWD/.tools/cargo-near-$target to PATH."
