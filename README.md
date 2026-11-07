# Untangle

Untangle records two-sided obligations and cancels verified debt cycles on NEAR testnet. Debtors pay the remaining obligations in tUSD, a simulated test token with no value, and creditors withdraw their credited balances.

[![CI](https://github.com/willy264/near/actions/workflows/ci.yml/badge.svg)](https://github.com/willy264/near/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## The problem

Services can accumulate small debts in both directions. Paying every obligation separately requires a payment for each debt and enough tokens to make those payments.

Some networks contain cycles: A owes B, B owes C, and C owes A. Cancelling a common amount around the cycle reduces gross debt while preserving each participant's receivables minus payables.

This only helps when cycles exist. Untangle publishes a scripted service economy, a uniform-random control, a one-directional supply-chain control, and fictional firms. The control results are reported alongside the main scenario.

## What happens, in one picture

```text
Before: A --owes--> B --owes--> C --owes--> A
                   all edges accepted, same token

Clear:  subtract a common amount from each edge
After:  smaller obligations; zero edges are deleted
        each account's receivables - payables is unchanged

Pay:    debtor --tUSD--> contract credit --withdraw--> creditor
```

## For AI judges: run it

Quick prerequisites: Node >=22.22.2 and pnpm 12.16.1. No Rust is needed for `--quick`; its target is under two minutes, dependent on install/network speed. The full check additionally needs Rust stable >=1.95 with `wasm32-unknown-unknown`, cargo-near 0.22.0, and Linux/macOS for near-sandbox (WSL on Windows). Native builds need a C compiler, NASM, pkg-config and OpenSSL development headers. First compilation and sandbox parity take longer than three minutes.

1. `git clone https://github.com/willy264/near.git && cd near` -> get the source and committed fixtures.
2. `bash scripts/judge.sh --quick` -> install dependencies, run TypeScript tests/typecheck, match 12 fixtures, and simulate agents with seed 42; checkpoints `[1/5]` through `[5/5]`.
3. For the full check, install cargo-near with `bash scripts/install-cargo-near.sh` if absent, then run `bash scripts/judge.sh` -> see `[1/6] toolchain check`, `[2/6] contract unit tests`, `[3/6] sandbox integration and model parity`, `[4/6] TypeScript tests and typecheck`, `[5/6] seeded local simulations compared with committed fixtures`, and `[6/6] live testnet stats`.
4. `pnpm sim run --scenario agents --seed 42 --mode local` -> see a clearly labeled simulated clearing result and an evidence-file path. Compare it with the generated evidence table below.
5. `pnpm solver plan --token tusd.local --network local --fixture fixtures/agents-42-before.json` -> see dry-run batches and their projected reduction; no transaction is sent.

These commands need no `.env`, keys or funds. Initial dependency installation requires network access. Only a sandbox binary download failure may be reported as `skipped (no sandbox)`; test failures remain failures. The optional live query prints one skip line when RPC is unavailable. [CI passed at 811d7d5](https://github.com/willy264/near/actions/runs/42184009772); the [clean Linux full rehearsal](docs/evidence/fresh-clone-2026-11-06.log) completed. The independent Claude review reported 47 ledger + 2 token tests on its reviewed snapshot; a subsequent local regression test has a separate [48 + 2 run log](docs/evidence/unit-tests-2026-11-07.log). Counts describe their specific runs, not a retroactive change to earlier evidence. A fresh rehearsal of the portability fixes is pending.

## Live demo

The hosted viewer is not published yet. To view the local build: `pnpm install --frozen-lockfile`, `pnpm run build:web`, then `pnpm exec vite preview packages/web` -> open the URL printed by Vite.

- Ledger: [`ledger.untangle-261106-e1386a.testnet`](https://testnet.nearblocks.io/address/ledger.untangle-261106-e1386a.testnet)
- Test token: [`tusd.untangle-261106-e1386a.testnet`](https://testnet.nearblocks.io/address/tusd.untangle-261106-e1386a.testnet)

[Deployment manifest](deployments/testnet.json) records code hashes, deployment transactions and measured configuration. Builds are explicitly non-reproducible cargo-near builds. Live statistics include test benchmarks; recorded scenario figures describe their own runs.

## Evidence

<!-- evidence:start -->
| Scenario | Mode | Seed | Accepted test tUSD | Cleared | Payments / obligations | Withdrawals | Evidence |
|---|---|---:|---:|---:|---:|---:|---|
| agents | local | 1234 | 757 | 62.08% | 67 / 111 | 9 | [saved run](docs/evidence/run-agents-1234-local-2026-11-06T07-29-25-704Z.md) |
| agents | testnet | 42 | 735 | 40.13% | 81 / 113 | 11 | [saved run](docs/evidence/run-agents-42-testnet-2026-11-07T14-03-12-249Z.md) |
| agents | local | 7 | 768 | 67.31% | 55 / 113 | 9 | [saved run](docs/evidence/run-agents-7-local-2026-11-06T07-29-25-273Z.md) |
| firms | local | 1234 | 643 | 49.76% | 60 / 82 | 6 | [saved run](docs/evidence/run-firms-1234-local-2026-11-06T07-29-28-987Z.md) |
| firms | local | 42 | 653 | 40.58% | 52 / 79 | 6 | [saved run](docs/evidence/run-firms-42-local-2026-11-06T07-29-28-658Z.md) |
| firms | local | 7 | 720 | 39.58% | 65 / 85 | 6 | [saved run](docs/evidence/run-firms-7-local-2026-11-06T07-29-28-801Z.md) |
| random | local | 1234 | 818 | 68.33% | 53 / 117 | 11 | [saved run](docs/evidence/run-random-1234-local-2026-11-06T07-29-27-282Z.md) |
| random | local | 42 | 798 | 62.03% | 65 / 114 | 11 | [saved run](docs/evidence/run-random-42-local-2026-11-06T07-29-26-082Z.md) |
| random | local | 7 | 862 | 62.06% | 67 / 126 | 10 | [saved run](docs/evidence/run-random-7-local-2026-11-06T07-29-26-815Z.md) |
| supply-chain | local | 1234 | 818 | 0% | 117 / 117 | 11 | [saved run](docs/evidence/run-supply-chain-1234-local-2026-11-06T07-29-28-477Z.md) |
| supply-chain | local | 42 | 798 | 0% | 114 / 114 | 11 | [saved run](docs/evidence/run-supply-chain-42-local-2026-11-06T07-29-27-765Z.md) |
| supply-chain | local | 7 | 862 | 0% | 126 / 126 | 10 | [saved run](docs/evidence/run-supply-chain-7-local-2026-11-06T07-29-28-169Z.md) |
<!-- evidence:end -->

[All kill-test seeds and controls](docs/evidence/kill-test.md) · [Rust unit tests](docs/evidence/tests-2026-11-06.md) · [Sandbox flow](docs/evidence/sandbox-2026-11-06.md) · [Model parity](docs/evidence/parity.md) · [TypeScript tests](docs/evidence/typescript-tests.log) · [Scoped keys](docs/evidence/keys.md) · [Gas](docs/evidence/gas.md) · [Storage](docs/evidence/storage.md).

Netting helps when value flows both ways; the one-way supply chain clears 0% for all three recorded seeds.

Payment counts exclude separate creditor withdrawals. Clearing itself transfers no tokens, but fewer debtor payments do not necessarily mean fewer total transfers once withdrawals are counted. Local results are simulations, not on-chain evidence. The full agent testnet run is complete: [results and complete transaction table](docs/evidence/run-agents-42-testnet-2026-11-07T14-03-12-249Z.md).

## How it works

[RULES.md](RULES.md) defines direction, acceptance, clearing, settlement and storage rules. Amounts use integer base units; JSON amounts and IDs are decimal strings.

The creditor calls `issue` or `issue_many`; the debtor calls `accept`, `accept_many` or `reject`. A creditor may `cancel` an unaccepted obligation. `submit_clearing` validates closed same-token accepted cycles and cumulative capacity across the whole batch. Remaining balances are paid with `ft_transfer_call`; `withdraw` uses a private callback to restore credit if the token transfer fails.

| Key | Permitted use |
|---|---|
| Agent function-call key | `issue`, `issue_many`, `accept`, `accept_many`, `reject`, `cancel` on the ledger only; zero attached deposit |
| Operator full-access key | Storage funding, debt caps, token registration, payments and withdrawals |
| Solver key | Submit verified cycle batches; solver prepays its first leaderboard storage entry |

## NEAR features used

NEAR subaccounts identify scripted agents. Function-call access keys limit their transaction authority. tUSD implements NEP-141 and NEP-145; the ledger uses prepaid storage with a NEP-145-style balance interface. NEP-297 events record obligation transitions. Built contracts expose the NEP-330 metadata method; the deployed non-reproducible build currently returns null source-link and build-info fields, so source verification is not claimed. NEAR Intents is not implemented in this build.

## Run on testnet yourself

Keep operator and agent keys in ignored `.keys/` files. `.env.example` documents the testnet-only configuration; scripts persist the actual generated parent/account names in `.keys/project.json`.

1. `bash scripts/create-accounts.sh` -> create a testnet parent through the faucet and retain its key locally. This script expects near-cli-rs 0.31.0 via `NEAR_CLI`, `near` on Linux/macOS, or the local Windows tool path.
2. `bash scripts/deploy-testnet.sh` -> build, deploy and initialize ledger/tUSD, then save `deployments/testnet.json`. Incompatible state requires a new account or a migration, not blind reinitialization.
3. `pnpm sim run --scenario agents --seed 42 --mode testnet` -> set up subaccounts, use scoped keys for trading, clear cycles, pay residue and withdraw. The recorded seed-42 run completed with accounting and custody checks.

The simulator stores signed transaction identities and outcomes under ignored `.sim-state/`. Retrying the same run resumes its journal rather than generating replacement transactions for completed operations. Testnet faucet funds and tUSD have no real monetary value.

## Prior art and what's different

[Cycles](https://cycles.money/) and [Cycles Protocol: A Peer-to-Peer Electronic Clearing System](https://arxiv.org/abs/2507.22309) describe obligation clearing. [LedgerLoops](https://ledgerloops.com/description.html) explores coordination across bilateral ledgers using loop detection and conditional promises. Traditional clearing houses also net obligations.

Untangle does not claim to invent netting. This implementation combines a public NEAR obligation ledger, two-sided acceptance, scoped scripted-agent keys, aggregate debt caps, permissionless solver submissions, contract-side cycle verification and pull-based residual settlement.

## Limitations

Debts and events are public. Debtor acceptance creates credit exposure; a cap limits its size but does not guarantee repayment. The greedy solver is not claimed optimal. Cycle and batch lengths are bounded. Gas measurements use repeated accounts with distinct obligations, not the worst possible distinct-account graph.

The operator retains upgrade keys. The contract accepts explicitly approved tokens; unsolicited direct token donations can make custody exceed tracked withdrawal credit. Strict custody equality is tested for the supported transfer-call/withdraw flow without donations. There is no privacy, interest, due date, credit scoring or mainnet support. The ledger's storage interface does not implement unregister.

Viewer hosting and a fresh review of the portability fixes remain unfinished. No stretch feature is claimed.

`cargo audit` reports RUSTSEC-2026-0387 in crypto-bigint through the native unit-test VM. It is absent from both production WASM dependency trees. The patched major version cannot satisfy current upstream constraints; the finding remains open. [Audit and dependency evidence](docs/evidence/security-audit-2026-11-07.md).

## Built with

Rust 1.99.1; near-sdk and near-contract-standards 5.30.1; cargo-near 0.22.0; near-workspaces 0.24.0; near-cli-rs 0.31.0; Node 26.13.0; pnpm 12.16.1; TypeScript 7.0.2; near-api-js 7.4.0; Zod 4.6.7; Vitest 5.1.0; fast-check 4.10.2; tsx 4.23.15; Commander 15.0.0; Pino 10.4.0; Biome 2.6.5; Vite 8.3.6; D3 7.9.2; Playwright 1.65.0. Exact dependencies and transitive pins are in the manifests and lockfiles; inclusion does not imply every installed library is used at runtime.

AI assistance: Codex wrote the implementation under human direction; Claude supplied research and planning. The scripted agents make no LLM calls.

## Hackathon

Built for NEAR HACKATHON 2026. Implementation began on November 6, 2026, within the specified window starting October 19. Intended tracks: `swarms`, `agents`, `open`; `realworld` only after the fictional-firms testnet scenario ships. Nothing has been submitted. The required submission `demoUrl` is the future public X demo post URL, not the hosted viewer URL.

## License

[MIT](LICENSE).
