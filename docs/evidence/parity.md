# Model ? contract parity

Command (Ubuntu WSL):

```sh
CARGO_TARGET_DIR=/tmp/untangle-integration-target cargo test --offline --manifest-path contracts/Cargo.toml -p untangle-integration-tests --test parity -- --nocapture
```

Output:

```text
parity sequence 25/25: 40 operations matched
test model_contract_parity_25_by_40 ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 543.90s
```

25 deterministic fast-check seeds (42–66), 40 operations each: issue, accept, reject, cancel, caps, pair limits, clearing, settlement receiver and failed accept_many. Error codes, token statistics, each account's net position and withdrawal credit matched after every operation. Trace inputs and model expectations: fixtures/parity.json. Full output: parity.log.

Settlement receiver calls in this parity test are signed by a sandbox token account to isolate ledger transition parity. Real NEP-141 transfers/resolver refunds and withdrawal callbacks are independently covered by the full sandbox flow; this parity test alone does not prove custody or token behavior.
