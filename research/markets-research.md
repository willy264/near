# NEAR Hackathon: markets, investment research, and real-world payments

Research snapshot: 29 October 2026. Prepared for the broader hackathon research report. Product concepts below are original proposals and implementation judgments, not claims that the ideas are globally unique or that their commercial demand has been validated.

## Scope and brief

Assigned tracks: Unstoppable DeFi, Investment Thesis, Real-World Money. Read the live hackathon site, the saved authoritative HACKATHON.md, official starter prompts, and the primary technology sources linked below. The starter prompts propose a DCA vault, an Intents-volume thesis dashboard, and freelancer invoicing; the concepts here deliberately add mechanisms beyond those baselines.

The organizers' ecosystem list is not a published sponsor-bounty schedule. Q-011 explicitly says integrations are hints, not requirements. There are 13 main tracks, not 13 sponsor tracks. No separate sponsor reward, stacking rule, or sponsor-specific judging criterion was verified. Sponsor mappings below therefore mean meaningful ecosystem integration opportunities, not verified prize eligibility. Source: [live HACKATHON.md](https://nearhackathon.com/HACKATHON.md).

## Verified technical model

### NEAR Intents: distinguish the layers

- **1Click** is the application integration layer: discover current token IDs, request a quote, deposit or sign the generated intent, then monitor execution. It coordinates intent creation, market makers, and execution. The usual application should start here.
- **Verifier (`intents.near`)** holds a token ledger. Users authorize changes to ledger balances, and bundles can settle atomically within that ledger. A developer needing custom matching and many-party settlement can work below 1Click.
- **Bridges and withdrawals** move the resulting assets out to other chains. Atomic ledger settlement does not make every external-chain operation atomic. The verifier docs expressly warn that originating cross-contract calls do not necessarily finish in submission order.
- The live verifier has **no testnet deployment**. Use a local/sandbox implementation for failure testing and an explicitly labeled, tiny mainnet integration demonstration after funding/transaction authorization.

Sources: [Verifier introduction](https://docs.near-intents.org/integration/verifier-contract/introduction), [intent execution and ordering](https://docs.near-intents.org/integration/verifier-contract/intent-types-and-execution), [1Click request lifecycle](https://docs.near-intents.org/integration/distribution-channels/1click-api/quickstart/making-a-request).

Useful affordances that change product design:

- `EXACT_OUTPUT` quotes solve the business problem “recipient must receive this much,” with input-side slippage and refund handling. `EXACT_INPUT` instead fixes what the payer spends.
- `ANY_INPUT` is a standing accumulation/sweep mechanism, but currently requires Intents balances and sweeps after a **$1,000 threshold**. It is unsuitable as the foundation for a $5 hackathon payment demo.
- Limit orders can rest, partially fill, and cancel asynchronously. Cancellation can race a last fill; the final payout status matters more than the matching status.
- Earn represents external yield positions with supported receipt assets through the ordinary quote flow. It is not a universal arbitrary-contract executor or a principal guarantee. Verify both listing and a successful quote at integration time.
- Confidential swaps now have documented request modes. Their public-chain privacy claim does not remove provider, bridge, wallet, network, or timing threat-model questions.

Sources: [swap types](https://docs.near-intents.org/integration/distribution-channels/1click-api/swap-types), [limit orders](https://docs.near-intents.org/integration/distribution-channels/1click-api/orders), [Earn](https://docs.near-intents.org/integration/distribution-channels/1click-api/earn), [confidential swaps](https://docs.near-intents.org/integration/distribution-channels/1click-api/quickstart/confidential-swaps).

**Fee discrepancy to preserve, not hide:** hackathon Q-006 says 0.2% without JWT. Current Intents fee docs say an additional 0.25% for unauthenticated non-ANY_INPUT quotes, and authenticated defaults of 0.20% normally or 0.01% for stablecoin/same-asset routes, subject to configuration. These are separate from the tiny on-chain protocol fee and other execution costs. Budget from live quotes rather than hard-coding the brief's number. [Current fee documentation](https://docs.near-intents.org/resources/fees).

### Chain Signatures: control is different from knowledge

A NEAR account/contract can request MPC signatures for foreign-chain transactions, with distinct derived accounts by path. The current docs cover both Secp256k1 and Ed25519. The application still builds the correct transaction, manages nonce/UTXO and destination gas, broadcasts it, and establishes whether it actually finalized. The docs explicitly describe this as an outbound mechanism: it does not itself prove external-chain state. Use per-chain derivation paths and domain-bound messages. This makes it valuable for policy-controlled treasury accounts, but adding it to an ordinary user-approved 1Click swap creates unnecessary complexity. [Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures).

### Rhea: real lending and trading integration, with dependencies

Rhea has NEAR trading contracts and cross-chain lending accounts. Its current aggregation SDK supports quote/swap execution and MCA deposits/withdrawals; it requires an API key. Its NEAR swap SDK builds transactions for a wallet to sign and retains the `@ref-finance/ref-sdk` package name. The official guide calls that SDK third-party and flags token storage registration. Supported chain does not imply supported pair or amount. [Rhea SDK](https://guide.rhea.finance/developers-1/rhea-sdk).

The MCA design binds existing wallets to a NEAR contract account, verifies signed business messages, supports application calls and relayer gas payment, and can batch actions with optional block intervals. The paper describes management-DAO upgrades affecting MCA accounts; do not call this an immutable, administrator-free custody model. For a two-week project, prefer a narrow existing-account adapter to rebuilding MCA. [MCA technical paper](https://guide.rhea.finance/docs/rhea-finance-cross-chain-lending-litepaper).

The published lending risk model includes liquidation and bad debt. Margin trading has different liquidation behavior from ordinary lending. The docs also expose administrative pause/freeze mechanisms. Thus, “unstoppable” is a track aspiration, not permission to claim that every Rhea integration is unpausable. Sources: [lending risks](https://guide.rhea.finance/near-chain-guides/lending-and-borrowing/audits-and-risks), [margin trading](https://guide.rhea.finance/near-chain-guides/margin-trading), [incident controls](https://guide.rhea.finance/developers/incident-response-plan-and-escalation-procedures).

### Aurora: use when existing Solidity is an advantage

Aurora is an EVM implemented as a NEAR smart contract. Solidity tooling and EVM wallet integrations are the reason to use it. NEAR-to-Aurora calls have an implicit EVM sender derived from the predecessor NEAR account; this is distinct from a Chain Signatures derived address. A NEAR contract can call Aurora contracts without inventing an on-chain secret. Suitable for reusing a Solidity escrow or vault implementation, not a necessary extra chain for every project. Sources: [Aurora Engine](https://doc.aurora.dev/dev-reference/aurora-engine/), [NEAR-to-Aurora XCC](https://doc.aurora.dev/crosschain/xcc/near-to-aurora/introduction/).

### HOT and HEX: related, but not interchangeable APIs

HOT Kit covers wallet connections and portfolio access across multiple chain families; its Google login is marked experimental. HOT Omni Balance is an on-chain NEAR ledger with signed transfer, token-difference, and withdrawal operations. Underlying bridges have their own security assumptions. Token identifiers and signature formats should come from the SDK, not manual concatenation. Sources: [HOT Kit](https://docs.hotdao.ai/hot-kit), [HOT Omni Balance](https://docs.hotdao.ai/hot-omni-balance), [Omni token addressing](https://docs.hotdao.ai/omni-tokens/calculate-token-omni-address).

The hackathon's HEX documentation link currently lands on **GONKA OTC Market**, not a generic exchange integration guide. It documents Fund/Fill messages for `escrow.fi.tg`, partial fills, expiry, optional taker allowlists, and a REST order index. This is a concrete fit for agent procurement of GNK inventory or conditional OTC execution, but do not assume it proves support for arbitrary assets or an open generic swap SDK. [HEX OTC integration](https://hot-labs.gitbook.io/hex/concepts-and-systems/interactive-blocks).

### GoMining: useful data, read-only agent interface

GoMining exposes miners, rewards, balances, marketplace data and account analytics through MCP. **Every documented MCP tool is read-only.** Agents can analyze rewards and retrieve deposit addresses or conversion quotes; they cannot upgrade miners, execute conversions, buy miners, or withdraw through this interface. A product must explicitly separate analysis from user-approved platform actions and from independently controlled on-chain funds. [GoMining MCP reference](https://docs.gomining.com/en/product/ai/mcp-server).

### Analytics: measure the right population

The Intents Explorer API covers **1Click transactions**, not all Intents settlement. It requires a partner JWT and currently limits a partner to one request every five seconds. Public settlement data and 1Click API data have different coverage. [Explorer API](https://docs.near-intents.org/integration/distribution-channels/1click-api/explorer/introduction).

NEAR BigQuery provides historical transactions, receipts, execution outcomes, and account changes; partition queries by `block_date`. The docs warn that **NEAR Lake's old S3 ingestion stopped on 24 March 2026**, although the BigQuery dataset remains available. Inspect freshness and the current pipeline rather than silently building a “live” thesis from an old feed. Relayers, account abstraction and many-party transactions also make transaction signer count a poor proxy for people. [BigQuery](https://docs.near.org/data-infrastructure/big-query).

## Track 01: Unstoppable DeFi — three build candidates

### D1. Margin Lifeboat — a borrower-owned rescue policy

**User and problem.** A borrower has a healthy overall portfolio but collateral in one lending venue deteriorates while repayment money sits on another chain. Existing liquidation bots optimize liquidation; the borrower needs a precommitted way to preserve the position without giving a bot general spending authority.

**Creative mechanism.** The user creates a rescue envelope: eligible debt position, maximum rescue budget, target health threshold, maximum acceptable conversion loss, expiry, and a hard rule that rescue funds may only repay that debt. The controller moves a small buffer before the danger point; if warning worsens, it requests an exact-output debt-token quote and executes repayment. Decisions expose the cost of rescue versus a scenario estimate of liquidation loss. A human can revoke unused authority.

**Architecture.** Rhea position adapter → deterministic health/price policy → isolated NEAR account or policy contract → 1Click exact-output conversion → observed incoming funds → Rhea repayment callback → verify debt decrease. Initially keep the reserve on NEAR; a later Chain Signatures adapter can replenish it from a preauthorized external account. Guard both price freshness and destination identity. An LLM may explain decisions, but never determine the unsigned transaction recipient.

**Meaningful integrations.** Core: Rhea lending plus NEAR Intents. Optional: Chain Signatures for remote reserve control; OutLayer as an execution environment only after its actual constraints are verified. Aurora is unnecessary unless the team already owns a relevant Solidity component.

**Two-week MVP / demo.** Repayment only: one collateral/debt pair, one budget, one destination. No borrowing, collateral withdrawal, position migration or general trading authority. Replay a clearly labeled adverse price scenario beside a live read-only Rhea position, show the rejected over-budget action, then execute one tiny authorized repayment against an independently verified test position or a local fork where mainnet economics make that impractical. Keep the 1Click integration evidence separate from simulated stress. Demonstrate that calling the policy with an arbitrary recipient fails.

**Biggest risk.** Cross-chain latency can exceed time to liquidation; this is not liquidation insurance. Start with an early-warning threshold and reserve already near the debt. Pauses, stale feeds and depleted liquidity must stop rather than silently continue.

**Difference from existing products.** Rhea supplies lending, MCA access and liquidation tooling. The new layer is a borrower-defined, restricted repayment policy with latency-aware reserves and demonstrated failure behavior. It is not a new lending market or a generic portfolio chatbot. Adjacent track: AI Security & Defense. Complexity: medium/high. Revenue hypothesis: subscription for monitoring and a disclosed capped execution fee.

### D2. DueDate Vault — optimize for liabilities, not headline APY

**User and problem.** A small DAO or business has payroll in ten days and hosting bills in three, across different recipient chains. A yield optimizer can leave the treasury apparently profitable but unable to meet its obligations on time.

**Creative mechanism.** Every funded obligation is a deadline/asset/recipient constraint. The vault assigns cash into immediate, near-term and discretionary buckets, keeps a liquidity buffer, and moves only genuinely surplus funds into supported yield positions. The product measures “obligations funded under stress,” not maximum yield. Its distinctive feature is reverse scheduling: start from a required arrival date and work backward through redemption delay, bridge latency and conversion tolerance.

**Architecture.** NEAR obligations registry + deterministic cash-flow scheduler + one Rhea supply/withdraw adapter or one supported Earn receipt asset + 1Click exact-output delivery. The reserve account permits only approved destinations and amounts. Add callback/state transitions for redemption and settlement; a receipt token does not imply immediate liquidity. In the MVP, users approve each transaction while the policy checks it.

**Meaningful integrations.** Core: NEAR contract, Intents, and exactly one yield provider. Rhea is the natural listed ecosystem fit. Optional: Trezu approval workflow for treasury operators; Chain Signatures for autonomous foreign-chain accounts. Do not integrate both Rhea and several external yield protocols merely to increase the logo count.

**Two-week MVP / demo.** Three scheduled obligations, one lending source, two destination chains, one stress replay. A judge moves payroll earlier; the system exits the discretionary position, raises the reserve, and shows exactly which obligations remain fundable. Show one real receipt/withdraw lifecycle where supported and one tiny transfer, with all simulations labeled.

**Biggest risk.** Withdrawal liquidity and settlement latency are stochastic; no arrival guarantee. Use conservative margins, explicit “at risk” states, and a fully funded near-term bucket. Cannot promise principal protection.

**Difference from existing products.** Rhea supplies yield and lending; 1Click Earn supplies access to some receipt assets. The new product is liability matching and reserve discipline, not another APY dashboard. Compared with the official DCA starter, it optimizes meeting obligations rather than accumulation of a target asset. Adjacent tracks: Autonomous Business, Real-World Money. Complexity: medium. Revenue hypothesis: treasury SaaS subscription.

### D3. Inventory Commons — cooperative netting for small solvers

**User and problem.** A smaller market maker may have the right total capital but wrong inventory distribution across supported assets. Repeatedly rebalancing through public routes consumes spreads and bridge fees; each solver competes using less effective liquidity.

**Creative mechanism.** Solvers publish signed inventory-exchange constraints in short rounds: assets offered, minimum assets wanted, deadline and maximum size. A matcher finds cycles among already deposited balances; each participant signs the exact resulting balance change. Settle a complete funded cycle atomically in the verifier; send only residual imbalances to outside liquidity. A participant never receives a discretionary claim over another solver's funds.

**Architecture.** Off-chain inventory graph/optimizer → `token_diff` intents → simulation → bundled verifier settlement → optional withdrawals after settlement. All required assets must already exist in the common ledger; the ring does not create liquidity. Bound nonce/deadline and check the actual current contract format. A public relayer can execute valid bundles; a malicious matcher cannot alter signed limits.

**Meaningful integrations.** Core: lower-level NEAR Intents. Optional: Rhea for residual NEAR liquidity, HOT for a separately scoped Omni Balance version. Start with one ledger; do not claim a transaction can atomically span both HOT and verifier ledgers without additional machinery. HEX is a possible later OTC inventory source if its supported GNK market is relevant.

**Two-week MVP / demo.** Three or four controlled solver agents, three assets, funded balances and a deterministic matching algorithm. Compare gross rebalancing volume and fees against independent executable quotes at the same timestamp. Settle one cycle; show a stale signature causes a bundle rejection instead of partial asset loss. Visualize actual balance deltas, not agent chat.

**Biggest risk.** Finding counterparties and preserving inventory privacy. Seed both sides only for the demonstration and label it. A simulation saving is not evidence of production demand. Keep bridge transfers outside the atomic guarantee.

**Difference from existing products.** Intents already coordinates user/solver swaps. This product is a solver-to-solver capital-efficiency layer that makes their residual inventory reusable. It should be evaluated on inventory requirements, match rate and executable cost, not claimed AI intelligence. Adjacent track: AI Swarms if agents actually negotiate and transact. Complexity: high but strong technical demo. Revenue hypothesis: small fee on verified completed rebalances.

## Track 02: Investment Thesis — three evidence-first candidates

### T1. Value Capture Microscope — does Intents success accrue to NEAR?

**Question.** Under what conditions does growth in cross-chain settlement create durable NEAR token demand, and under what conditions do applications, solvers and other assets capture most of the economics?

**Creative mechanism.** A decomposition model separates gross user volume, settlement transaction fees, NEAR burned/paid where observable, contract storage locked, relayer funding requirements, solver spread, application charges, and external bridge costs. Toggle assumptions such as batch size, fee pricing, and non-NEAR payment acceptance. Show the growth level required for each proposed value-capture channel to become material, rather than multiplying swap volume by an invented protocol take rate.

**Architecture / data.** Reproducible SQL over NEAR transactions and receipts; samples of verifier events; current protocol configuration; authenticated 1Click historical records for that product's coverage only; downloadable scenario assumptions and raw-data manifests. Use observed settlement transactions to estimate gas instead of treating every internal balance transfer as an L1 transaction. Storage lock is a stock, not recurring revenue or permanent burn.

**Meaningful integrations.** Intents Explorer plus NEAR data infrastructure. Rhea/HOT/Aurora are comparative case studies for where revenue accrues; they need not be imported as app dependencies. A thesis should remain credible if a sponsor-adjacent assumption fails.

**Two-week MVP / demo.** One bounded historical window, one contract family, reproducible charts, bull/base/bear scenarios and an explicit falsification threshold. A judge changes adoption tenfold and sees that some value-capture components barely move. The report can support NEAR while still honestly showing its weakest link.

**Biggest risk.** Incomplete fee attribution and inaccessible private flows. Publish coverage, unknown residuals and confidence intervals. Do not substitute NEAR price correlation for a causal claim.

**Difference from existing example.** The official starter tests whether Intents volume predicts network use. This tests the harder bridge from ecosystem success to token-holder economics. Complexity: medium; strong fit for a small analytical team. Product hypothesis: transparent protocol-economics research tooling, not trading advice.

### T2. Settlement Weather — measure reliability as an investment moat

**Question.** Is NEAR's chain abstraction becoming sufficiently reliable and liquid that applications can build businesses on it, including when markets are stressed?

**Creative mechanism.** Treat cross-chain settlement as a transport network. Track route-level success, refund share, time-to-final-delivery distributions, quote availability, quote-to-fill drift, minimum viable payment sizes, and concentration of observable dependencies. Construct a “can businesses rely on this corridor?” score with visible components instead of a single unexplained ranking.

**Architecture / data.** Read-only `dry:true` quote probes at small/medium/large sizes across a handful of corridors; historical 1Click records where fields permit; publicly observable finality and transaction timestamps; local replay of historical stress. Separate time-to-quote, origin finality, solver processing and destination finality whenever observable. A quote that succeeds is not proof a funded swap will succeed.

**Meaningful integrations.** Intents APIs are central. HOT/HEX/Rhea can offer carefully labeled route comparisons only if comparable quote/data access exists. Cross-provider privacy or missing fields may prevent apples-to-apples measurement; keep those gaps visible.

**Two-week MVP / demo.** Three corridors, three transaction sizes, a seven-day quote sample, one reproducible failure taxonomy, and a historical dataset for longer context if available. Show a corridor that has attractive nominal pricing but poor tail latency. Explain which product classes can tolerate the tail and which cannot.

**Biggest risk.** Short collection window and selection bias: funded swaps differ from quote probes; only 1Click is represented in Explorer. Do not call seven days a long-term track record. Make a long-term thesis conditional on evidence that could be accumulated later.

**Difference from existing dashboards.** Settlement quality and application suitability become falsifiable drivers of adoption, beyond raw TVL, volume and token price. Complexity: medium. Product hypothesis: observability subscription for wallets/payment businesses.

### T3. Demand Archaeology — distinguish economic adoption from activity

**Question.** Is NEAR gaining repeat, economically useful workflows, or does visible growth come from a few subsidized applications, relayers or repeatedly recycled funds?

**Creative mechanism.** Build workflow cohorts, not presumed human identities. Label measurable event patterns such as repeat external inflow → app use → payment, one-off bridge arrival, recurrent treasury disbursement, circular same-asset transfers, and contract-only automation. Track retention, recipient diversity, value survival after incentives, and sensitivity when top applications are removed. Never equate an account or signer with a person.

**Architecture / data.** Receipt-aware flow graph using NEAR public datasets and a maintained contract label registry. Publish heuristic rules and counterexamples; compare results under conservative and liberal entity-clustering assumptions. Preserve a raw account-level view alongside inferred clusters. Identify relayer transactions and avoid counting them as a single consumer.

**Meaningful integrations.** NEAR data, selected Intents/Rhea/Aurora/HOT contracts and their event schemas. Optional user-authorized GoMining reward data as a small example of externally sourced revenue reaching NEAR—not as representative ecosystem evidence. No GoMining account data without consent.

**Two-week MVP / demo.** Two application families, a fixed historical window, cohort charts, transparent exclusion rules, one-click rebuild and a counterargument panel. A judge changes the wash-like-flow heuristic and sees how much of the thesis survives. Explicitly label whether a trend is economic value, transaction activity or inferred repeat use.

**Biggest risk.** Missing cross-chain attribution and false positives. Randomize addresses or cluster uncertainty rather than publishing claims about specific people. No causal conclusions about incentives without an identification strategy and suitable data.

**Difference from existing starter.** The starter charts active accounts and volume; this audits what those metrics mean in an account-abstracted, relayer-heavy economy. Complexity: medium/high. Product hypothesis: ecosystem diligence and growth-quality reporting.

## Track 08: Real-World Money — three operating products

### R1. SettleGraph — settle a business network's invoices with less movement

**User and problem.** A small agency, its contractors and suppliers can all owe one another money while cash sits in different stablecoins and chains. Paying every invoice independently makes everyone fund unnecessary transfers.

**Creative mechanism.** Businesses approve invoice obligations privately and sign a specific netting proposal. Example: A owes B $100, B owes C $80, C owes A $60. They can approve A paying $40, with B and C each receiving $20. The original $240 of gross transfer obligations is discharged with $40 of net transfers. This is a reduction in movement for that example, not a universal claim about working capital saved.

**Architecture.** Encrypted/off-chain invoice records → obligation hashes and signed consents → deterministic netting solver → escrow funded for the agreed net balances → atomic internal clearing → recipient-selected Intents withdrawals. Atomic clearing uses one canonical asset in one contract ledger. Every signature binds the complete proposal, including invoice IDs, participants, balance changes, network, token contract, fees, nonce and expiry. Clearing checks all funding and consent, atomically consumes the invoice IDs and updates all internal credits; overlapping or replayed proposals cannot discharge an invoice twice. Parties explicitly accept the resulting internal credit as the discharge event. Cross-chain withdrawals occur afterward and are tracked separately; they are not part of the atomic guarantee. Store machine-readable receipts mapping every original invoice to its discharge.

**Meaningful integrations.** Core: NEAR settlement contract and Intents. Optional: NEAR AI Cloud for confidential invoice extraction, while arithmetic stays deterministic; Trezu for an organization's approval; HOT for wallet onboarding. No need for a new loan protocol or token.

**Two-week MVP / demo.** Three firms, six synthetic invoices, two incoming chains, one clearing currency, accounting CSV export. Show the circular-obligation example, reject an altered invoice, remove one consent and recompute, then complete a tiny funded clearing. Reconcile balances down to smallest units.

**Biggest risk.** Commercial/legal validity of netting and collecting enough counterparties. MVP terms require each party to approve discharge of its own obligations; contract execution alone does not make unknown invoices legitimate. Start with a cooperative agency ecosystem.

**Difference from ordinary invoicing.** Its useful action is multilateral obligation cancellation plus auditable reconciliation. The official starter accepts a payment in any token; this reduces how much needs to be transferred before choosing rails. Adjacent tracks: Social Money, Privacy. Complexity: medium/high. Revenue hypothesis: fee capped as a fraction of measured transfer costs saved, or accounting SaaS.

### R2. ReturnRail — crypto checkout that can handle returns

**User and problem.** Merchants need partial refunds, deposits, cancellations and accounting. A one-way swap button leaves those normal commercial operations to manual wallet management.

**Creative mechanism.** A purchase records the commercial liability in the merchant's chosen stable unit and creates a non-transferable refund claim bound to the buyer. A fully backed offer reserves the maximum contractual refund liability plus bounded fee/slippage overhead; holding only a fraction of that amount must be labeled partially backed. When a merchant approves a returned line item, the associated claim is locked for one active payout attempt, consumed only on verified completion, and the buyer chooses an eligible receiving chain. Approved unresolved refunds stay reserved even after the return window expires. The original payment token need not be the refund token; the policy states the unit of account, coverage and permitted execution costs before checkout.

**Architecture.** NEAR purchase/claim/reserve contract + line-item accounting + 1Click inbound payment and exact-output refund + relayed user interactions. Bind the refund claimant to an authenticated identity at checkout, with signed address changes; never infer ownership solely from the origin transaction sender, which may be an exchange. Track the commercial refund obligation separately from each 1Click attempt. A 1Click `REFUNDED` status means that attempt's input returned to its configured refund address; it does not mean the buyer received the commercial refund. Unlock a retry only after the reserved input's return is verified, and mark the obligation paid only after verified delivery to its bound beneficiary. Unknown outcomes retain the lock. For the demo, fund the maximum permitted refund plus bounded costs and reject a quote exceeding that funded envelope.

**Meaningful integrations.** Core: Intents and NEAR. Optional: HOT Kit for familiar wallets; Aurora if extending a merchant's existing Solidity escrow; confidential routing for selected payment privacy needs after reviewing its threat model. Avoid turning receipts into tradable speculative NFTs.

**Two-week MVP / demo.** Buy two items from one mock storefront using an external-chain asset. Return one item and receive an authorized stable-value refund on a different supported chain; demonstrate a replayed refund claim fails. Export invoice, payment and refund records into one reconciliation view.

**Biggest risk.** A reserve cannot solve dishonest merchants or infinite chargebacks. Specify who authorizes a return, expiry, reserve release and disputes. Release only liabilities that have expired without an approved or unresolved claim; never release an approved refund merely because its return window ended. Partial backing cannot support an unconditional refund promise. Tokens can lose their peg; the product should not promise a risk-free fiat value. The main innovation is operational reversibility, not reversing blockchain history.

**Difference from existing example.** The starter stops when a freelancer receives funds. ReturnRail handles the next 30 days of normal commerce. Complexity: medium; particularly strong demo-to-product ratio. Revenue hypothesis: merchant payment fee plus subscription for reconciliation.

### R3. Payroll Continuity — payroll with a funded fallback claim

**User and problem.** A distributed employer wants workers paid on time even if a chosen payout route is unavailable. The hard problem is preventing a retry from paying the employee twice while still offering a useful fallback.

**Creative mechanism.** Before payday, the employer funds each employee's canonical claim in a NEAR payroll reserve. The employee selects a destination route. The system locks one unique claim while an external payment is in progress; after verified failure/refund, the same claim unlocks for another route or direct NEAR collection. If no route has started, the employee can choose the funded claim immediately. An unknown timeout never unlocks a second payment.

**Architecture.** Payroll commitment/claims contract → one active attempt per claim → exact-output route quote → funded dispatch → finality/refund verification → consumed or retryable state. Narrow the MVP to one outbound route and a direct NEAR collection fallback. A named, trusted status-verifier service submits authenticated observations from 1Click and checks the corresponding destination delivery or returned input; the contract trusts this service's settlement assertions, and the README must say so. Chain Signatures alone supplies no remote-state proof. A later version can strengthen this boundary with independently verified chain evidence. Employee enrollment, stablecoin storage and relayer costs are prepared before payday. The demo can keep salary details in encrypted storage; a privacy label requires protecting payment metadata too, not merely encrypting a CSV.

**Meaningful integrations.** Core: NEAR, Intents, meta transactions. Optional: Trezu payroll approval, HOT employee onboarding, Chain Signatures only if the employer intentionally manages external reserve accounts. The narrow MVP needs no new lending or fiat off-ramp.

**Two-week MVP / demo.** Five synthetic employees, one payroll batch, one outbound route and the direct NEAR fallback, one forced failure fixture plus one real small transfer. Show an unknown status blocks duplicate payment; verified returned input enables the fallback; the accounting total remains conserved. Do not claim funds arrived during a simulated outage without a real corresponding receipt. Demonstrate a status-verifier outage leaving the claim locked rather than authorizing another payment.

**Biggest risk.** Reliably verifying external completion/refund and keeping the reserve funded. There is an explicit liveness versus duplicate-payment tradeoff: unresolved external state or verifier downtime can lock a claim, and preserving the no-duplicate invariant takes priority over an automatic retry. The funded claim is subject to the contract and disclosed verifier assumptions; it is not an unconditional arrival-time guarantee. Native fiat payroll still requires separate banking and compliance integrations.

**Difference from generic payroll.** The new layer is employee-owned claims and explicit failure recovery with no double-disbursement. It is a focused payroll operations tool rather than a batch transfer screen. Adjacent track: AI Security & Defense only if an actual agent policy implementation is included. Complexity: medium/high. Revenue hypothesis: per-employee payroll subscription.

## Additional sponsor combination worth keeping in reserve

**HashRunway: make mining rewards understandable as operating cash flow.** A small mining cooperative reads actual historical miner rewards through GoMining's read-only MCP, estimates a conservative spending envelope, and records agreed expenses in DueDate Vault. Members manually transfer funds they control into the treasury; thereafter NEAR policy handles approved payments. The creative layer is separating volatile production income, maintenance reserves and obligations. GoMining cannot autonomously withdraw or upgrade through the documented MCP. The idea becomes an Autonomous Business/Real-World Money crossover only when a real controlled-treasury action follows the analysis. Treat estimated future rewards as uncertain, never as guaranteed collateral.

## Recommended priorities from these nine

1. **ReturnRail:** strongest blend of immediately understandable pain, overlooked product mechanics, manageable scope, and a compelling two-minute demonstration.
2. **SettleGraph:** most distinctive commercial use of programmable settlement; stronger if the team can recruit a real small business network.
3. **Value Capture Microscope:** strongest research-track concept because it tests the uncomfortable question central to a long-term investment thesis.
4. **Margin Lifeboat:** strongest listed-partner combination, but it needs disciplined scope and no claim that a two-week controller protects against every liquidation.
5. **Inventory Commons:** technically ambitious and elegant, best for an experienced team comfortable with signed intents and settlement invariants.

This ranking is a research judgment, not an organizer scoring model. No user interviews, private API access, funded transactions, or production integrations were performed during this research.
