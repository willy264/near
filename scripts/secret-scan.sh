#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
gitleaks git --log-opts=--all --redact --no-banner
