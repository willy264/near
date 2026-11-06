# Demo Script — Untangle (target ≤ 90 s)

Rule from organizers: lead with the user problem, show one complete moment from action to visible result, say concretely what NEAR does.

| t | Screen | Voice / caption | Evidence shown |
|---|---|---|---|
| 0–8s | Viewer: tangled graph, 12 agents, totals | "12 AI agents bought services from each other. They now owe each other X tUSD across N debts." | Live stats from testnet contract |
| 8–20s | Zoom on a cycle A→B→C→A | "Paying each debt separately needs cash and a transfer per debt. But many debts go in circles." | Highlighted cycle |
| 20–40s | Terminal: solver runs; tx link | "Anyone can find these circles. The NEAR contract checks each one and cancels it — no money moves." | Testnet tx hash, explorer page |
| 40–55s | Graph collapses; ratio | "Y% of all debt cleared without a single transfer." | `stats()` cleared ratio |
| 55–70s | Settlement of residue | "They settle the remaining Z in M payments." | Settlement tx links |
| 70–82s | Key panel | "Each agent only has a key that can create and accept debt — it can't move money." | Access key list on explorer |
| 82–90s | Repo + URL | "Open source, runs from a fresh clone: link below." | Repo URL |

All numbers come from the recorded run; fill them from `docs/evidence/`. Do not round up.

## Fallback
If testnet RPC is down while recording: use the recorded run (screen capture of the real testnet session already saved) and say "recorded on testnet on <date>". Never show the local model as if it were testnet.

## X post draft (human publishes)
> AI agents that pay each other per call end up owing each other in circles.
> Untangle (built at NEAR HACKATHON) lets anyone find those circles; a NEAR contract verifies and cancels them — in our testnet run Y% of debt cleared with zero transfers.
> Repo: <url> · Live: <url>
> What would you net first? @NEARProtocol #NEARHackathon @NearBuilders
