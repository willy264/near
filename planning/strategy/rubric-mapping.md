# Rubric → Feature → Evidence Traceability

Criteria = the officially suggested guide (no published rubric). Weights internal.

| Criterion | Feature | Observable behavior | Test / evidence | Demo moment | Submission artifact |
|---|---|---|---|---|---|
| AI screen (gate) | `judge.sh`, fixtures, RPC read | Fresh clone passes with no keys; checkpoints match README | CI badge; fresh-clone log in `docs/evidence/` | — | README "For AI judges" |
| Technical implementation | Contract cycle verification + settlement + scoped keys | Invalid cycles rejected; valid batch clears; FCK can't move tokens | Contract tests; property test; testnet tx hashes | Clearing tx link | README Architecture + evidence |
| Originality | Agent-native netting with permissionless solvers | Anyone can submit cycles; contract verifies in O(len) | Prior-art section | "Anyone can be the solver" line | README "How this differs" |
| Impact | Cleared ratio from contract stats | Graph collapses; % cleared without transfers | `stats()` read; sim seed + params | The number on screen | X post first lines |
| Design / UX | Live graph viewer + dry-run | Judge clicks dry-run, sees what clears | Screenshot/video | Graph collapsing | Hosted URL |
| Sustainability | Solver leaderboard (stretch: solver fee); works for agents and businesses | Two scenarios run on same contract | Scenario 2 evidence | 5-second business scenario | README "Who runs it after" |
| Track: swarms | 12 agents, sub-accounts, emergent debt network | Agents trade, network clears | Sim logs | Opening shot | Tracks field |
| Track: agents | Agents buy/sell services on credit | Obligations per service call | Sim logs | Agent row in UI | README |
| Track: realworld | Fictional SME scenario + CSV export (stretch) | Invoices netted | Scenario 2 log | Short cut | README |
| Hints named | Sub-accounts, function-call keys, NEP-141, (stretch) NEAR Intents dry quote | — | README "NEAR features used" | — | README |
