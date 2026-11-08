# Full judge after allocator remediation

Command:

```text
wsl -d Ubuntu -- bash .tools/full-judge-alloc.sh
```

Result: exit 0.

- Toolchain: rustc 1.99.1, cargo 1.99.1, Node 26.13.0, pnpm 12.16.1.
- Contract unit tests: 48 `untangle` passed and 2 `untangle-test-token` passed.
- Sandbox integration: the full clearing/settlement/rollback/scoped-key flow passed.
- Model parity: 25 sequences × 40 operations passed; elapsed 542.55 seconds.
- TypeScript: client 2, shared 4, sim 1, solver 7 passed; typecheck passed.
- Fixtures: 12 deterministic local scenario/seed fixtures matched.
- Live testnet view: `accepted=1388000502`, `cleared=560000402`, `outstanding=0` base units before the gas rerun completed.

The full output was observed in the session; this file records the command and its actual checkpoint results. The prior sandbox and parity evidence remains valid for the unchanged contract logic; this run confirms the no-default-features dependency graph builds and executes the same tests.
