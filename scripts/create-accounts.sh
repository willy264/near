#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm exec tsx scripts/create-parent.ts
