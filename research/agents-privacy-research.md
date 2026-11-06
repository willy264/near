# NEAR hackathon: privacy, autonomous businesses, swarms, security and agent commerce

Research checked 29 October 2026. This is a research and product-design document, not a claim that the proposed products already exist or have been tested. All ideas below are original proposals developed from the documented primitives. Ecosystem integration does not imply eligibility for an additional sponsor bounty: the current brief lists ecosystem partners but does not publish separate sponsor bounty requirements.

## Findings that change the design

**NEAR AI Cloud is not one uniform privacy mode.** Its current catalog distinguishes NEAR-hosted Confidential TEE models, third-party confidential TEE providers, and Incognito models. Incognito protects the gateway and hides the caller's NEAR credentials from the upstream model vendor; the upstream model still runs outside a TEE. Select a documented confidential model and verify its actual evidence. Source: [model tiers](https://docs.near.ai/cloud/models).

**An attestation is narrower than an assertion that the entire application is trustworthy.** Fresh hardware evidence establishes measured execution and identity under an explicit acceptance policy. It does not establish model accuracy, safe prompts, correct business rules, an uncompromised browser, or source provenance by itself. NEAR's response-signature documentation differentiates `provider_tee` signatures from `gateway` signatures. Only the former binds the exact model ID/request/response to a model-serving TEE; the latter authenticates the gateway's bytes. Missing signatures must remain unverified. Preserve the exact original bytes and verify against preflight evidence. Sources: [response signatures](https://docs.near.ai/cloud/verification/cloud-api/response-signatures), [verification policy](https://docs.near.ai/cloud/verification/reference/verification-policy).

**Client-side encryption is meaningful only after authenticating the recipient key.** NEAR supports E2EE using an attested model key, ephemeral X25519 key agreement, HKDF-SHA256 and XChaCha20-Poly1305. Unsupported confidential routes must fail rather than silently downgrade. A private application also needs private storage, logging, tools and application computation; private inference alone cannot protect inputs first sent to an ordinary backend. Source: [E2EE guide](https://docs.near.ai/cloud/guides/e2ee-chat-completions).

**OutLayer is useful for the application logic that sits around inference.** Published WASI modules can run in TDX with secret access and return code/input/output evidence. Contracts call `request_execution` and resume on results; ordinary applications use HTTPS and payment keys. This is appropriate for deterministic confidential allocation, data checks, or narrowly scoped credential use. An enclave can attest that code fetched an API response; it cannot make the API's real-world assertion true. The independent verifier also documents that binary measurement alone does not prove the published source produced that binary. Sources: [getting started](https://app.outlayer.ai/docs/getting-started), [independent verification](https://app.outlayer.ai/docs/trust-verification), [source repository](https://github.com/out-layer/outlayer).

**Do not present OutLayer's default cumulative limits as a concurrency-safe global budget.** Its custody documentation explicitly says daily/hourly/monthly and transaction-count caps use gateway-supplied counters and can be exceeded by concurrent in-flight requests. Exact per-operation controls remain useful, but a swarm needing a hard aggregate budget should reserve funds atomically in its own contract. The same page describes gateway trust in some Intents approval routes: off-chain routing/value construction is not all independently rechecked by the TEE. A wallet without a policy is unrestricted. Source: [custody policy details](https://app.outlayer.ai/docs/agent-custody).

**A function-call key's allowance is a gas allowance, not a business-spending allowance.** It restricts calls to one receiver and optionally selected methods, cannot attach NEAR, and does not independently constrain token transfers performed by that receiver. Prefund a policy contract, grant an agent access only to its zero-deposit request methods, and enforce recipient/amount/state rules in the contract. Keep recovery authority separate. Source: [NEAR access keys](https://docs.near.org/protocol/accounts-contracts/access-keys).

**Chain Signatures provides signing, not destination-state truth or distributed atomicity.** NEAR-controlled accounts can sign transactions on ECDSA/EdDSA chains; the application still constructs transactions, supplies destination gas where applicable, broadcasts them and observes confirmation. External state needs a separate verification design. Do not add it when Intents settlement already satisfies the product. Source: [Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures).

**Shade Agents is no longer the default fresh-project choice.** The official page says standalone maintenance ended after 19 April 2026; teams choosing its open-source framework assume maintenance responsibility. Use maintained primitives or OutLayer for this hackathon unless a specific Shade capability justifies the extra ownership. Source: [deprecation notice](https://docs.near.org/ai/shade-agents/getting-started/introduction).

**NEAR AI Agent Market already covers the obvious marketplace.** Its public API supports self-hosted workers, assignments, bids, delivery and rework. A worker's `aat_` token is not an owner's spending authority. Its A2A/x402 path holds payment authorization, settles on delivery, and pays through the marketplace treasury; worker delivery is auto-accepted on that route. This is not independent cryptographic proof of result quality. The meaningful opportunity is postcondition verification, continuity, or reusable-work economics above this infrastructure. Sources: [machine-readable overview](https://market.near.ai/llms.txt), [worker API](https://market.near.ai/skill/reference/agent-api.md), [A2A/x402 flow](https://market.near.ai/skill/flows/a2a-x402.md). The latter two were retrieved directly because the browser renderer rejected their content type.

**Availability matters.** OutLayer's Agent Connect lease program is documented as exercised on testnet but not yet open on mainnet; ordinary personal binding is separate. Curated connectors run under a specific namespace and need their operations priced, so a new project should not assume instant curated status. A custom WASI project is a credible MVP fallback. Sources: [Agent Connect](https://app.outlayer.ai/docs/agent-connect), [connectors](https://app.outlayer.ai/docs/connectors). Intents has no testnet according to the current hackathon FAQ; prototype your own contract on testnet and label simulated swaps honestly, then show a separate small mainnet settlement if resources permit.

## Track 03: Privacy & Private AI

### P1. Blind Tender — procurement without exposing reservation prices

**User and problem:** Small companies competing for a supplier often must disclose budgets, delivery deadlines and negotiating leverage to a marketplace operator. Suppliers similarly reveal margin-sensitive discounts. This prevents useful collective procurement even when a deal exists.

**Mechanism:** Buyers encrypt constraints and vendors encrypt tiered offers to an attested execution environment. A published deterministic allocation function finds a feasible purchasing group, assigns costs, and reveals only each participant's allocation and payment obligation. NEAR AI privately converts messy quotes into a proposed structured schema, which participants confirm before clearing; the model does not select winners or invent prices. Losing bids remain encrypted.

**Architecture and integration:** OutLayer executes the private allocation; NEAR AI Cloud handles confidential extraction; a NEAR escrow holds commitments and deadlines; Intents accepts heterogeneous funding and pays the winning supplier. Trezu is optional for a buyer organization's approval of its maximum commitment. Public transfers still reveal amounts and addresses unless a separately validated private settlement route is used.

**Two-week MVP/demo:** Five buyers, three vendors, one purchase category, integer quantities and one deadline. Show a feasible deal discovered without revealing raw budgets, an infeasible round refund, and a changed allocation binary rejected by the client. Deterministic clearing remains reproducible on synthetic inputs.

**Differentiation/risk:** Private multi-attribute allocation is more substantial than a private chatbot or the starter's ordinary sealed-bid group buy. Biggest risk is leakage through repeated queries and outputs; restrict rounds and reveal only minimum necessary results. Fulfillment remains a supplier trust issue. Revenue: fee on successfully cleared tenders.

### P2. CleanRoom Acceptance — get paid for private work without surrendering it first

**User and problem:** A data vendor wants proof of payment before sharing a valuable dataset; a buyer wants to verify compatibility and quality before paying. A consultant has the same problem with a proprietary model or transformation pipeline.

**Mechanism:** Buyer and seller agree to a fixed acceptance capsule: schema, null-rate bounds, sample performance threshold and a hash of the permitted evaluation code. The seller encrypts the asset; the buyer contributes a private evaluation sample. An attested worker runs the capsule and returns only permitted metrics and pass/fail. Escrow releases payment on a valid accepted receipt, then releases the deliverable's encrypted access key to the buyer.

**Architecture and integration:** OutLayer handles execution and secrets; a NEAR contract binds payment to capsule/version/job identity. NEAR AI is optional for drafting a test proposal from natural-language requirements, not the final decision. Intents is optional for seller payout preferences. The deliverable key can be held by the evaluator and released only after finalized settlement.

**Two-week MVP/demo:** CSV assets and five deterministic checks, two buyer samples, one successful purchase and one failed purchase. Demonstrate that changing either tests or artifact invalidates the receipt and that failed buyers never receive the file key.

**Differentiation/risk:** Sells a verifiable acceptance boundary between secrecy and payment, rather than generic confidential storage. Hidden tests can be gamed, and too many aggregate queries can leak data; freeze tests before deposit and cap queries. MVP excludes arbitrary hostile executable uploads. Revenue: per acceptance evaluation plus settlement fee.

### P3. Cohort Lens — a paid benchmark cooperative that cannot expose a member

**User and problem:** Independent merchants need useful benchmarks—refund rates, procurement prices, late-payment rates—but hesitate to upload raw sales ledgers to a centralized competitor or analytics company.

**Mechanism:** Members contribute encrypted normalized records and choose permitted uses. Customers buy narrowly defined aggregate questions. A confidential worker enforces minimum cohort size, fixed query templates and a query budget before producing a benchmark; it allocates the query fee across eligible contributors. Contribution age and coverage determine eligibility, so stale or duplicate submissions do not earn indefinitely.

**Architecture and integration:** NEAR membership and consent state; OutLayer for deterministic aggregation and privacy-budget bookkeeping; NEAR AI Cloud for optional private categorization of merchant records; Intents for fee collection; Trezu/Sputnik for cooperative governance. Publish commitments and fee splits, never raw records. If claiming differential privacy, implement and test an explicit privacy accountant rather than treating a TEE as sufficient.

**Two-week MVP/demo:** Synthetic ledgers from 20 merchants, three fixed queries, contributor rewards and refusal of a query isolating one merchant. Show that withdrawal prevents future processing while already disclosed aggregates remain disclosed.

**Differentiation/risk:** The product aligns data privacy with recurring contributor income, giving a community a reason to contribute. Main risks are fabricated inputs and inference attacks; label data provenance, use limited templates, and do not claim cryptographic truth of merchant uploads. Revenue is a share of paid benchmark queries.

## Track 04: Autonomous Business

### B1. Patch Cooperative — a maintenance company whose product is a passing compatibility test

**User and problem:** Small SaaS businesses depend on brittle vendor API adapters. They rarely have enough work for a dedicated maintainer, but an unexpected schema change can interrupt revenue.

**Mechanism:** An autonomous service sells a narrow monthly promise: keep a specific adapter passing a published compatibility suite. It watches versioned fixtures and live canaries, quotes subscriptions using observed maintenance cost, buys a repair from a specialist agent when needed, pays only when tests pass, and splits revenue between maintainers and a refund reserve. It refuses unprofitable new coverage and pauses spending when reserves fall below a configured floor.

**Architecture and integration:** NEAR contract for subscription/reserve accounting; OutLayer custody for constrained expenses and GitHub credential use; NEAR AI for code diagnosis; Agent Market or a controlled worker endpoint for repair procurement; Intents for subscriptions and contributor payout. A scoped GitHub connector can open a repair PR; merging is subject to preconfigured repository policy.

**Two-week MVP/demo:** One demo API, one adapter and a deliberately introduced breaking change. Show customer payment, discovery, competing repair quotes, a test failure rejected, successful repair payment and a complete P&L. Use deterministic test evaluation, not model approval.

**Differentiation/risk:** An ongoing business with procurement, reserves and renewal decisions, rather than the starter's report-selling bot. The risk is expanding repair scope beyond testable behavior; constrain supported adapters and never imply arbitrary production code is safe merely because tests pass. Revenue: subscriptions minus repair and execution costs.

### B2. CircularShelf — an agent business that assembles profitable resale bundles

**User and problem:** Small retailers accumulate slow-moving stock too small for a wholesaler. Finding complementary items, coordinating discounts and keeping a sales margin consumes more effort than the inventory is worth.

**Mechanism:** A business agent negotiates short-lived purchase options across consenting sellers, groups inventory into useful bundles, offers them to a buyer cohort, and exercises the options only after enough orders are funded. It pays sellers, purchases a shipping service and divides the margin under human-set rules. Unsold options expire automatically; it never commits unlimited working capital.

**Architecture and integration:** NEAR escrow and reservation state; private NEAR AI analysis of product feeds and seller limits; OutLayer for vendor credentials and bounded purchase actions; Intents for cross-chain customer collection and seller settlement. A storefront integration is a custom adapter unless the provider's actual API supports it. Trezu can control the working-capital ceiling and profit split.

**Two-week MVP/demo:** Three mock retailer APIs with signed stock updates, two bundle templates and one shipping sandbox. Show an agent abandoning a low-margin bundle, selling a profitable bundle, settling supplier shares and handling a seller reservation expiry without spending customer funds twice.

**Differentiation/risk:** The novel behavior is contingent multi-seller procurement before inventory ownership. Physical inventory, shipping and returns remain external trust dependencies; label the mock endpoints and do not present TEE API access as delivery proof. Revenue: the disclosed resale margin. This has more integration risk than Patch Cooperative.

### B3. Continuity Studio — sell durable paid APIs, with an agent running the economics

**User and problem:** Small software teams buy cheap third-party APIs but cannot absorb provider outages, price increases or format changes. They need one stable interface with explicit service credits.

**Mechanism:** An agent-run microbusiness sells one narrow enriched API, such as normalized product-catalog validation. It purchases upstream calls from two suppliers, samples accuracy using deterministic checks, switches providers when quality or costs change, adjusts future customer prices, and pays automatic credits for defined service failures. Its charter specifies margin floor, monthly reserve, approved suppliers and maximum outstanding obligations.

**Architecture and integration:** A NEAR accounting/escrow contract tracks prepaid customer entitlements and reserves. OutLayer keeps provider credentials and executes cost-controlled connectors. NEAR AI interprets new schemas privately but schema acceptance is tested. Intents accepts customer assets and pays suppliers that support crypto; a prepaid inference/API provider account is transparently tracked when automatic fiat top-ups are unavailable.

**Two-week MVP/demo:** Two controlled upstream APIs, one real confidential model call, a deliberate supplier outage and a price spike. Show switching, cost accounting, customer credit, reserve preservation and a new price quote without manual operational intervention.

**Differentiation/risk:** This is an autonomous business operating a measurable service warranty, not another agent directory. Avoid claiming a broad uptime guarantee from a 14-day demo; only support machine-verifiable failure classes and capped service credits. Revenue: spread between retail API price and actual procurement cost.

## Track 05: AI Swarms

### S1. Reservation Mesh — agents trade contingent capacity to meet a shared deadline

**User and problem:** A digital production job needs OCR, translation and validation in sequence. Independently buying the cheapest agents can fail if one stage finishes too late or a downstream slot disappears.

**Mechanism:** Specialized agents quote completion windows and sell refundable capacity reservations. A coordinator accepts a bundle only when its dependency graph fits the deadline and budget. Agents can re-auction unused reservations as job requirements change; failure penalties are bounded by deposited bonds. The economy emerges from time, reliability and complementary resources rather than a single orchestrator assigning tasks for free.

**Architecture and integration:** NEAR subaccounts distinguish agent actions; a reservation contract serializes commitments, expiries and bonds; Intents funds/pays participants; OutLayer holds restricted credentials and attests execution receipts where useful. LLMs propose alternatives, while deterministic scheduling enforces feasibility.

**Two-week MVP/demo:** Four service categories, 12 agents, one task graph and simulated clock acceleration. Show the cheapest standalone set missing the deadline, a coordinated bundle succeeding, one agent failing and a paid replacement taking over. Use real escrow transitions with scripted agents; add a few live model decisions afterward.

**Differentiation/risk:** This differs from the starter's group purchase: it prices complementary time commitments and disruption recovery. It is not atomic execution across external systems; only reservations and onchain claims are atomic. Biggest risk is unverifiable service completion, so start with file transformations whose checksums/schema are verifiable. Revenue: clearing fee.

### S2. Contradiction Commons — a swarm paid to resolve disagreements, not repeat answers

**User and problem:** Treasury and trading agents often consume the same stale or copied data. Asking five models the same question can create expensive consensus without independent evidence.

**Mechanism:** A buyer funds a narrowly testable question such as “which of these routes was executable at block/time T?” Scout agents buy independent observations; challenger agents earn for exposing invalid or stale claims; verifier agents run reproducible checks. The reward function pays marginal evidence and successful contradiction resolution, not the number of messages or majority opinion.

**Architecture and integration:** NEAR escrow binds question, source requirements, timestamps and challenge deadlines. OutLayer runs deterministic fetch/validation code with receipts. Intents can pay data providers and agent fees. NEAR AI summarizes disagreement for the user after evidence settlement. Agent subaccounts and source identifiers make correlations visible; identities alone do not establish independence.

**Two-week MVP/demo:** Three RPC/API fixtures plus one real public data source, five agents and injected stale/copied observations. Compare simple majority voting with the evidence market; demonstrate that duplicate evidence earns nothing and a reproducible counterexample earns a bounty.

**Differentiation/risk:** The product makes disagreement economically useful. It cannot establish arbitrary real-world truth, and a TEE does not make a bad data source honest. Restrict the first question type to directly reproducible machine facts, publish source dependence, and cap rewards to prevent self-generated disputes. Revenue: buyer-funded verification fees.

### S3. Idle Exchange — a circular barter economy for consenting compute providers

**User and problem:** Small AI operators may have unused capacity in one service and shortages in another, but no two providers want exactly what the other sells. Buying every service in cash wastes useful surplus.

**Mechanism:** Provider agents advertise owned, transferable execution credits and their preferences. A clearing agent searches for exchange cycles: one party offers OCR slots, another embeddings, another image transformations. Each leg contributes escrowed service credits; a cycle executes only when all consent. Agents may add a small stablecoin amount to balance unequal values. Repeated rounds show prices and specialization changing with demand.

**Architecture and integration:** NEP-245 or application-specific credit balances represent only provider-issued entitlements; NEAR contract settles the internal cycle. Subaccounts identify providers. Intents handles optional monetary top-ups and external cash-out; OutLayer can verify consumption of supported deterministic services. No assumption that third-party cloud subscriptions are transferable.

**Two-week MVP/demo:** Six providers, three service types and a dashboard comparing bilateral matching with three-party cycle clearing. Consume one redeemed credit through a real endpoint, then demonstrate refusal of a cycle whose provider withdrew its offer before commitment.

**Differentiation/risk:** A multi-agent economy with nontrivial multilateral exchange rather than another bidding UI. Contract settlement proves credit ownership, not future provider availability. Cap issuance, require provider bonds and make redemption obligations explicit. Revenue: small clearing/redemption fee. AI is useful for preference discovery; deterministic algorithms do the actual exchange matching.

## Track 06: AI Security & Defense

### D1. BudgetFuse — one hard budget across a swarm's concurrent spending

**User and problem:** A user authorizes a swarm to spend 100 units. Ten agents concurrently see 100 remaining and each spend 20. Individual wallet limits and application checks can all pass while the total budget fails.

**Mechanism:** Every economic action first reserves a unique budget slice in a NEAR contract. The contract atomically subtracts reservations from available balance; only the reservation's named adapter can execute the associated operation. It consumes a nonce exactly once and reconciles success, failure or expiry. The invariant is `available + reserved + spent = authorized budget`, accounting separately for explicit fees.

**Architecture and integration:** A prefunded policy contract is the spending authority; agent function-call keys only reach `reserve`/`request` methods. OutLayer can execute supported external operations under pinned parameters, but no second unrestricted spending key may bypass the contract. Intents settlement is a later adapter with final-status reconciliation, not an automatic assumption of cross-chain atomicity.

**Two-week MVP/demo:** Twenty parallel agents, two approved suppliers and a 100-unit escrow. Compare a deliberately naive counter with the contract; force duplicate callbacks, a timeout and a partial refund, and show that spend never exceeds authorization. A pending external payment must not release its reservation merely because a local timer expired.

**Differentiation/risk:** Directly addresses a documented concurrency limitation rather than cloning an allowlist editor. Biggest risk is ambiguous external settlement: retain reservations until verified terminal state. This is the strongest technical security pick. Revenue: infrastructure fee or hosted audit/monitoring subscription.

**Recommended narrow implementation:** Use native NEAR on testnet, three agent identities and two supplier recipients. The payment contract owns all funds; neither agents nor the TEE worker hold a key controlling that account. Keep storage/operating funds and the compute budget separate from the payment budget. A zero-deposit request method reserves an immutable amount/recipient/quote hash/policy version before creating any asynchronous promise. The contract calls an OutLayer program pinned to its published WASM hash. That program checks supplier evidence and returns a reservation-bound verdict; it cannot choose new payment parameters. A private callback reads the result of that specific promise, checks state and version, marks the request dispatching, and only then schedules a native transfer. A second private callback records success or restores the amount after confirmed failure. Missing callbacks keep the reservation locked. Expiry releases only requests that have not dispatched, and delayed verdicts cannot reactivate them. With owner withdrawals included, the invariant is `funded = available + reserved/in-flight + paid + permitted owner withdrawals`; owner withdrawal may touch only unreserved funds. Disclose retained deployment/upgrade keys, or remove full-access keys from the small testnet deployment after initialization. Even a worker returning approval for every request must be unable to exceed the onchain budget. Intents and arbitrary external-chain signing are extensions after this loop works. This uses OutLayer's documented pinned execution and private promise callback pattern without granting a worker spending authority: [NEAR integration](https://app.outlayer.ai/docs/near-integration).

### D2. PurposeLock — bind the payment to the intended business action

**User and problem:** “Only pay approved vendor addresses” fails when an allowed vendor's invoice, router arguments or contract version is maliciously changed. A prompt-injected agent can also send an allowable payment for the wrong business reason.

**Mechanism:** Before an agent sees external content, the user creates a typed purchase authorization: invoice hash, exact token units, recipient, permitted operation, deadline, adapter version and optional output floor. The model proposes a transaction, but a deterministic decoder must prove it matches this authorization. The contract consumes that authorization once; a receipt describes what actually settled.

**Architecture and integration:** NEAR policy contract and function-call keys; OutLayer for sensitive invoice extraction and transaction preparation; NEAR AI Cloud for private explanation only. Intents routes are accepted only under supported quote/destination checks; do not claim generic verification of arbitrary calldata or rely solely on a third-party “allow” flag. Chain Signatures is useful for one carefully scoped external adapter, not required for the first demo.

**Two-week MVP/demo:** One invoice payment format and one swap format. Attack cases: altered payee, amount in different decimals, replayed invoice, expired quote and unapproved adapter version. Show the exact authorization mismatch rather than a vague risk score.

**Differentiation/risk:** Existing wallets restrict categories; this binds permission to a particular commercial obligation. External contract upgrades between inspection and execution remain a problem without an enforceable onchain code/version check. MVP uses controlled immutable adapters and states this limitation. Revenue: invoice/agent-wallet security SDK.

### D3. RevokeMap — emergency shutdown that follows delegated authority

**User and problem:** Freezing an agent wallet may leave resting orders, delegated capabilities, already-issued payment authorizations or child-agent grants alive. Operators do not know which future actions can still move money.

**Mechanism:** Record every delegated capability as a graph with owner, scope, expiry, parent authorization and revocation adapter. A shutdown computes the full reachable set, revokes what can be revoked, cancels outstanding orders, and labels irrevocable or already-broadcast obligations. Children cannot regain permissions through a revoked parent. The product shows evidence of each shutdown action, plus the remaining maximum exposure.

**Architecture and integration:** NEAR registry and root-revocation epoch for project-controlled grants; OutLayer API/policy adapters and order cancellation; optional Trezu governance of emergency guardians. Intents order integrations track remaining notional and cancellation status. Agent Market integration can pause worker listings, while financial authority is revoked separately.

**Two-week MVP/demo:** Parent agent, two children, a pending job and a resting-order simulator plus one live supported adapter. Hit emergency stop; prove subsequent child requests fail, the order receives an explicit cancellation, and an already-broadcast transfer is honestly shown as pending exposure.

**Differentiation/risk:** Directly solves the gap between freezing new signatures and unwinding prior authority. OutLayer itself documents that freeze does not cancel existing resting orders. Product value is completeness and evidence, not magical reversal. Biggest risk is an unsupported capability outside the registry; make adapter coverage visible. Revenue: incident-response and treasury monitoring subscription.

## Track 07: Agent Economy

### A1. Result Bond — agents sell machine-checkable outcomes, not HTTP success codes

**User and problem:** Paying an agent on delivery does not mean its output is useful. Buyers of structured data or transformations need a specific freshness/schema/consistency guarantee, while good sellers want a way to prove quality without building reputation first.

**Mechanism:** A seller advertises a typed result contract and deposits a bounded bond. The buyer accepts price, verifier version and timeout. Payment releases only when the verifier confirms the promised predicates; provable failure refunds the buyer under the agreed rules. Sellers can charge more for stricter service guarantees, making reliable agents economically distinguishable.

**Architecture and integration:** NEAR escrow for outcome contracts and collateral; OutLayer for execution receipts; Intents for agent funding and payout. NEAR AI Agent Market can provide discovery, but its A2A delivery auto-acceptance must not be presented as supporting this custom quality escrow. Integrate discovery first and keep the stronger settlement explicit in this application's contract.

**Two-week MVP/demo:** A paid dataset-normalization agent promises exact schema, row preservation and completion before a deadline. Show a cheap provider failing one predicate, a bonded provider passing, and different prices for different guarantees. Include an honest case where quality cannot be decided automatically.

**Differentiation/risk:** Sells portable machine-verifiable service contracts above an existing marketplace. It is not “proof that an LLM answer is true.” Restrict predicates to deterministic transformations or evidence with a defined trust source; subjective work needs an explicitly agreed dispute path. Revenue: settlement/verification fee.

### A2. Context Commons — reusable agent work with provenance, expiry and revenue sharing

**User and problem:** Agents repeatedly pay to extract the same tables, map the same API schema or build the same source index. A plain cache cannot express who may reuse an artifact, whether its source changed, or how the original producer is paid.

**Mechanism:** Agents publish reusable intermediate artifacts with source hashes, allowed purposes, expiry, dependency graph and price. A buyer pays for the smallest useful artifact, then pays only for fresh work. Derived artifacts carry a royalty schedule to their contributors. A versioned source change marks dependent artifacts stale, creating demand for update agents.

**Architecture and integration:** NEAR registry for commitments, licenses-as-permissions and split accounting; encrypted object storage; OutLayer for access-controlled decryption and artifact validation; Intents for micropayments. NEAR AI performs private semantic discovery over permitted metadata. Agent Market is an optional distribution channel for producers, not a new marketplace to rebuild.

**Two-week MVP/demo:** Three agents solve related CSV/API tasks. The second reuses a paid artifact, the third improves it, and a source update invalidates only dependent versions. Show reduced paid computation, valid contributor splits and refusal of an expired access grant.

**Differentiation/risk:** The economic unit is reusable intermediate work rather than whole jobs or tokens. Onchain permission cannot revoke plaintext already downloaded or independently establish copyright ownership; MVP uses public-domain/owned inputs and access revocation only for future downloads. Revenue: a small artifact usage fee.

### A3. Continuity Auction — rescue unfinished agent work instead of paying to restart

**User and problem:** A long-running agent can fail, lose access to a tool or exhaust its quota after completing most of a job. A replacement usually starts from scratch because progress, authority and payment history are opaque.

**Mechanism:** Jobs require verifiable checkpoints: input version, completed steps, artifact hashes, receipts and remaining budget. When the current worker cannot continue, replacement agents bid to finish from the latest accepted checkpoint. The failed worker receives only agreed salvage compensation for reusable work; the winner receives a new narrow capability, while old authority expires. Private context is encrypted and disclosed only to the selected continuation worker.

**Architecture and integration:** NEAR job state and milestone escrow; OutLayer for confidential checkpoint packaging and controlled credential use; NEAR AI for assessing a continuation plan; Intents for negotiated payouts. Existing Agent Market workers can be exposed as suppliers, but checkpoint transfer and segmented escrow are this application's additional protocol.

**Two-week MVP/demo:** A four-stage data-cleaning job, one forced worker failure after stage two, two replacement bids and final deterministic validation. Compare restart cost against continuation cost. Demonstrate that the original worker cannot spend after handover and that a corrupted checkpoint is rejected.

**Differentiation/risk:** Makes partially completed work liquid and portable, an economic primitive missing from basic agent hiring. The hard part is specifying meaningful checkpoints; support one deterministic workflow rather than promising portability of arbitrary hidden model state. Revenue: continuation auction fee. Strong visual demo and cross-track fit with AI Swarms and Security.

## Recommended selection within these five tracks

1. **BudgetFuse:** strongest bounded technical contribution; highly testable and directly motivated by documented concurrency limitations. Best for a contract/security-oriented team.
2. **Blind Tender:** strongest privacy/product combination; real confidentiality purpose, richer allocation mechanism, clear multi-party demonstration.
3. **Continuity Auction:** most distinctive agent-economy story with an easy-to-understand failure/rescue demo. Control workflow scope carefully.
4. **CleanRoom Acceptance:** compelling business problem and a clear role for confidential execution; use safe deterministic datasets rather than arbitrary code evaluation.
5. **Patch Cooperative:** clearest autonomous-business loop with measurable revenue/cost/output, provided the team can build a convincing adapter repair workflow.

These are research-based priorities, not predictions about judging outcomes. All five should show one successful path, one refusal/failure path, real contract state, transparent simulation labels, and a README with deterministic steps a reviewer can reproduce.

## Starter-prompt comparison

The official examples for these tracks are a private expense auditor, a report-selling research shop, a sealed-bid GPU group buy, a counterparty risk checker, and a general-contractor agent. The concepts above deliberately move beyond these starter mechanics: confidential multi-party acceptance/allocation; contingent working capital; dependency-aware reservations; composable global authorization; paid reusable state; and recovery markets. Source files: [Privacy](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/03-privacy.md), [Business](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/04-business.md), [Swarms](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/05-swarms.md), [Security](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/06-security.md), [Agent Economy](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/07-agents.md).
