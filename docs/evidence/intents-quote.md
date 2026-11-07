# NEAR Intents dry quote

Recorded: 2026-11-07T15:28:11.607Z. Command: `pnpm exec tsx scripts/intents-dry-quote.ts`.

Illustrative USDC route using the numerical size of a simulated tUSD residue. tUSD has no value and cannot be swapped. Documentation example addresses; no funds or signatures.

agent-02.untangle-261106-e1386a.testnet had 97000000 tUSD base units receivable after clearing in [the recorded run](run-agents-42-testnet-2026-11-07T14-03-12-249Z.json). A dry quote used the same numerical amount in USDC on Base, targeting USDC on Ethereum. Quoted output: 96681376 USDC base units. This is a historical quote, not a current price or executed payment.

Request: dry=true. No deposit address returned; no funds, JWT, wallet, signature or transaction. [Full request, response and token metadata](intents-quote.json). Asset IDs came from GET /v0/tokens; the public example address came from the [official OpenAPI](https://1click.chaindefuser.com/docs/v0/openapi.yaml).
