# Creative economies: technical research and 15 original proposals

Research date: 29 October 2026. Scope: tracks 09–13. These are proposed product designs, not claims that the products already exist or that sponsors offer prizes for them. The event lists ecosystem participants; no separate sponsor bounty requirements were confirmed. MVP estimates assume a small team and a deliberately narrow two-week prototype.

## Evidence that changes the designs

**The existing starter ideas are a baseline to exceed.** The official prompts suggest a merchant-town simulation, membership NFT wallet, streak coin, reputation bounty board, and inheritance account. The proposals below deliberately use different loops. The prompts themselves are suggested starting points rather than an exhaustive specification. Sources: [games](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/09-games.md), [NFTs](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/10-nfts.md), [memecoins](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/11-memecoins.md), [social](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/12-social.md), [open](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/13-open.md).

**NEP-245 supplies useful inventory primitives.** Its final specification supports fungible, semi-fungible, and non-fungible assets through one interface, including batch operations. It does not supply a game economy, demand curve, secrecy mechanism, or autonomous agent. A recipe, access-right, or resource economy can use it, but game rules must be implemented separately. [NEP-245](https://github.com/near/NEPs/blob/master/neps/nep-0245.md)

**An NFT is not automatically a wallet.** NEP-171 specifies ownership and transfers; NEP-178 adds transfer approvals; NEP-199 supplies royalty/payout interfaces. None automatically revokes the previous owner's subaccount keys or makes a marketplace obey an arbitrary revenue split. A robust prototype can colocate NFT ownership and spending authority in one controlling contract, with keyless asset vaults accepting instructions only from that contract. If authority checks span asynchronous calls, ownership epochs and pending-operation rules are needed. Never hand owners permanent full-access keys to a vault and assume an NFT transfer revokes them. Sources: [NEP-171](https://github.com/near/NEPs/blob/master/neps/nep-0171.md), [NEP-178](https://github.com/near/NEPs/blob/master/neps/nep-0178.md), [NEP-199](https://github.com/near/NEPs/blob/master/neps/nep-0199.md), [access keys](https://docs.near.org/protocol/accounts-contracts/access-keys).

**An NFT transaction also needs an economic transfer policy.** Decide whether already-authorized obligations follow the asset, whether a sale waits for pending operations, and whether balances are reserved before the sale. Authorization alone does not prevent a seller draining a treasury immediately before settlement. An offer should commit to an ownership epoch, minimum available balance, liabilities, and expiry; the sale transaction should verify those terms. This is our design recommendation, not a built-in NFT feature.

**Gas sponsorship and unattended asset transfers are different.** Function-call keys restrict receiver and methods and cannot attach NEAR; their allowance meters gas, not a business spending budget. Token standards commonly require a one-yocto deposit. A game can use a bounded session method on its own contract, prefund internal balances, and sponsor execution; it should not promise arbitrary wallet spending through a function-call key. NEP-366 supports relayed, user-authorized actions but does not remove authorization requirements. [Access keys](https://docs.near.org/protocol/accounts-contracts/access-keys), [NEP-141](https://github.com/near/NEPs/blob/master/neps/nep-0141.md), [NEP-366](https://github.com/near/NEPs/blob/master/neps/nep-0366.md)

**HOT is a plausible onboarding partner, with an explicit experiment to run.** HOT Kit documents multichain connectors and portfolio/exchange helpers. Its Google connector is marked experimental and the dedicated page is WIP. Wallet authentication asks for a signature; it is not equivalent to permission for unlimited future actions. Budget day one for a real browser test before making Google login essential. A native NEAR wallet plus a restricted game session is the fallback. [HOT Kit](https://docs.hotdao.ai/hot-kit), [authorization](https://docs.hotdao.ai/hot-kit/authorization-flow), [Google WIP](https://docs.hotdao.ai/hot-kit/connect-via-google-wip). Do not confuse the unrelated hot.dev SDK with HOT Labs.

**meme.cooking integration should usually be a companion contract.** The launchpad documents auctions, launch thresholds, optional team allocation and vesting, and a liquidity-pool launch. Its creator documentation does not establish support for arbitrary custom token code, rebases, or mint hooks. The safe design is a conventional launchpad token deposited into a separate immutable mechanic contract via `ft_transfer_call`, with fixed-budget rewards. If dynamic supply is essential, deploy a custom NEP-141 contract and do not claim a launchpad integration without verification. A locked balance is not a supply burn. [Launchpad](https://docs.meme.cooking/), [creation parameters](https://docs.meme.cooking/for-cooks/create-a-token/)

**SputnikDAO and Trezu already solve custody and approvals.** Sputnik supports roles, permissions, proposal types, voting thresholds, and function-call proposals. Its inspected policy structure uses role/proposal categories rather than a generic arbitrary spending-policy language. Trezu documents Requestor, Finance, and Governance roles and separate Finance/Governance thresholds. A custom activity service should prepare proposals or administer a specifically approved, capped program; do not assume a reputation score can bypass treasury approval. [Sputnik repository](https://github.com/near-daos/sputnik-dao-contract), [policy implementation](https://github.com/near-daos/sputnik-dao-contract/blob/main/sputnikdao2/src/policy.rs), [Trezu roles](https://github.com/NEAR-DevHub/trezu-docs/blob/main/governance/members-and-roles.mdx), [voting settings](https://github.com/NEAR-DevHub/trezu-docs/blob/main/governance/voting-settings.mdx)

**Trezu confidentiality has a defined boundary.** Its docs describe confidential treasury execution on a private shard and distinguish private financial content from publicly visible membership and voting. External public-chain payouts can still reveal recipient, token, and amount. Use its documented capabilities without equating every Trezu transaction with anonymity or claiming an independently verified security guarantee. Public treasury mode is sufficient for all three Social Money MVPs below. [Confidential treasuries](https://github.com/NEAR-DevHub/trezu-docs/blob/main/confidential-treasuries.mdx), [payment flow](https://github.com/NEAR-DevHub/trezu-docs/blob/main/payments/single-payment.mdx)

**SVRN is strategic alignment, not a verified SDK dependency.** The site describes a public company building/adopting sovereign technology and managing a NEAR-anchored treasury. No public developer API or usable integration specification was found in the linked material. Products about credible exit, user-controlled data, and independent agents align with its mission, but a submission must not describe a fictional SVRN API. [SVRN](https://svrn.net/)

## Track 09 — Games With Real Economies

### 09A. Blackout Archipelago — the economy becomes the rescue puzzle

**Player and problem.** Strategy players need a game where markets create decisions rather than a token shop attached to an ordinary game. Players operate repair boats between islands. A storm knocks out power; island NPCs have independent budgets, generators, food stock, and obligations.

**Original mechanism.** Winning requires restoring a functioning network, not accumulating the most currency. Delivering batteries to the richest island may be profitable now but strand a poorer island whose water pumps supply everybody. NPCs issue bounded purchase orders and can jointly fund a route, giving players choices between spot sales, guaranteed delivery contracts, and infrastructure investment. Prices, liquidity, and connectivity change the puzzle.

**Architecture and ecosystem fit.** NEP-245 represents batteries, repair parts, and delivery receipts; each NPC gets a bounded ledger/vault and deterministic procurement rules. A NEAR contract handles inventory escrow and delivery rewards. HOT handles connection; session calls keep normal play free of wallet popups. NEAR Intents is an optional funding/withdrawal rail, not a necessary transaction on each boat move. NEAR AI can supply negotiation dialogue, but a deterministic engine decides valid deliveries and budgets.

**Two-week cut and demo.** Three islands, two resources, one boat type, a five-minute storm scenario. Demonstrate that two runs with identical initial resources diverge because players route deliveries differently; show one NPC pooling funds with another and a payment that cannot exceed its purse. Include an accelerated simulation and a replay.

**Risk and differentiation.** The design can become a spreadsheet. Test the actual routing game before adding integrations. The economic externality—one island's solvency supports another's production—is the differentiator from the starter town. Use test credits for gameplay; business potential is premium scenarios/cosmetics rather than promises of earning.

### 09B. Whisper Exchange — information is the scarce resource

**Player and problem.** In a multiplayer investigation, clues usually become public walkthroughs. Here players and NPC investigators buy, license, combine, and resell limited access to clues while trying to solve a case before their investigative budget expires.

**Original mechanism.** A clue's value depends on which other clues the buyer holds. An NPC can hire another investigator to verify a claimed lead; a seller posts a bond attached to an objectively checkable claim about the fictional case. False claims lose the bond after the round reveals the committed solution. Players earn reputation for calibrated disclosures, not volume of trades.

**Architecture and ecosystem fit.** Store the case commitment and escrow on NEAR. Keep unrevealed clue content encrypted offchain; NEP-245 tracks access permits, not plaintext secrets. NEAR AI runs character dialogue; the case engine defines truth. HOT supports connection. NEAR Intents is optional for purchasing a season pass or taking an earned creator fee, not for making the core puzzle depend on swaps.

**Two-week cut and demo.** One hand-authored mystery, six clues, three NPCs, two human roles. A judge purchases a seemingly useful lead, delegates verification, discovers a false claim, and observes the bond result once the case opens. Show identical clues commanding different prices for different inventories.

**Risk and differentiation.** The server can leak secrets; disclose that trust boundary rather than claiming cryptographic fairness from a hash alone. Avoid using paid real-money bonds during the prototype. The differentiator is an economy of complementary information rights rather than a commodity shop or financial prediction market.

### 09C. Dungeon Steward — sell the dungeon, keep its obligations

**Player and problem.** Builder games reward extracting value and abandoning worlds. Players here own small dungeons as operating businesses: NPC workers, maintenance liabilities, visitor safety rules, and an upkeep reserve travel with the dungeon.

**Original mechanism.** Players design a room, lease traps from another player, hire NPC guides, and set an entrance price. Neglected equipment harms reputation and forces refunds from the reserve. A dungeon can be transferred mid-season, but the buyer receives both income and outstanding leases. Players improve operating efficiency and reputation instead of farming newly emitted tokens.

**Architecture and ecosystem fit.** NEP-171 identifies the dungeon; a controller owns its budget and enforces ownership epochs. NEP-245 tracks equipment and consumables. Bounded NPC wallets pay maintenance invoices. HOT supports entry. Trezu/Sputnik can optionally govern a guild's shared dungeon portfolio; omit them for individual ownership. Sponsor integration is useful when a guild vote truly controls a shared budget, not merely a logo.

**Two-week cut and demo.** A top-down six-room dungeon, three equipment types, one lease, automated NPC adventurers. Run it, incur a repair obligation, sell it, then show the seller cannot withdraw money and the buyer must honor the existing lease.

**Risk and differentiation.** Transfer accounting is harder than the game renderer; freeze a sale during unresolved settlement and expose reserved balances. This is a business-simulation game with meaningful inherited obligations, not an NFT marketplace. Strong secondary fit: NFTs That Do Something.

## Track 10 — NFTs That Do Something

### 10A. Repair Passport — a product that carries its own aftercare fund

**User and problem.** Buyers of refurbished laptops or shared appliances cannot easily assess maintenance history or transfer a prepaid service plan. Repairers struggle to collect reliable payment.

**Original mechanism.** Each asset has a transferable NFT, signed service history, and a ring-fenced maintenance reserve. Buying it transfers access to future service entitlements, not unrestricted authority to cash out the reserve. A qualified repairer submits a quote; current owner approval plus completion evidence releases payment. The asset builds a useful history as it changes hands.

**Architecture and ecosystem fit.** NEP-171 plus a custom asset controller and vault; NFT transfer preserves defined liabilities. NEAR Intents can let a buyer top up in one supported asset and pay a repair shop in another. HOT makes ownership claims accessible. A repair cooperative's Trezu treasury can manage issuer guarantees, but is optional for the MVP.

**Two-week cut and demo.** One laptop, two owners, one repairer, synthetic service documents. Fund the service reserve, transfer ownership, reject a withdrawal by the seller, and pay an approved repair invoice. The sale checks that the reserve still matches the advertised amount.

**Risk and differentiation.** Onchain history cannot prove physical condition or legal ownership; repair-shop signatures are attestations, not truth. Start with one participating issuer and a clearly disclosed dispute path. Monetization is a per-issued-passport or repair-settlement fee. It differs from an ordinary product certificate because prepaid obligations and spend restrictions persist with the object.

### 10B. Living License — a software asset that pays its own operating costs

**User and problem.** Small paid APIs and plugins are difficult to sell because code ownership, hosting credit, customers, and revenue streams are fragmented.

**Original mechanism.** An NFT controls a tiny operating service. Subscription revenue first replenishes an operating reserve, then pays maintainers, then pays the current owner. The owner can sell the service without immediately disabling prepaid customer access. Its published operating policy follows the NFT.

**Architecture and ecosystem fit.** A NEAR controller maintains NFT ownership, subscription entitlements, the reserve, and payout ordering. A simple gateway checks paid entitlements. NEAR Intents accepts supported payment assets. A NEAR AI-powered API is a natural demonstration workload; it must keep inference billing under the reserve cap. HOT handles the customer wallet. NEP-199 may describe resale payout splits, but recurring service revenue is enforced by the application's own contract.

**Two-week cut and demo.** A document-formatting API, two subscriptions, one paid compute provider, two owners. Sell the NFT while a request is in flight; the request completes, the operating bill is paid, and only future owner distributions change recipient. Expose shutdown behavior when the reserve is empty.

**Risk and differentiation.** DNS, cloud credentials, code delivery, and secrets do not automatically follow an NFT. The MVP should use a fixed service gateway and transfer only rights its controller actually enforces. The hook is service continuity with transferable economics, not a claim to transfer an entire legal company. Strong secondary fit: Autonomous Business.

### 10C. Booking Baton — a reservation transfers together with its commitments

**User and problem.** Small venues and equipment-rental businesses face cancellations, empty slots, and unofficial resales that separate a booking from its deposit and rules.

**Original mechanism.** A reservation NFT carries a fixed date, permitted attendee capacity, prepaid balance, refundable deposit, and cancellation policy. A holder can nominate a replacement who explicitly accepts the same terms. A transfer quote makes liabilities visible; check-in credentials rotate so the previous holder loses access.

**Architecture and ecosystem fit.** NEP-171 identifies the reservation; custom contract logic handles acceptance, escrow, redemption, and expiry. Gate access queries the latest ownership epoch and marks a one-time credential used. HOT supports mobile connection. NEAR Intents allows a replacement holder to pay the agreed difference in another supported asset. A venue's Trezu treasury can receive revenue, but public custody is adequate for the prototype.

**Two-week cut and demo.** One makerspace room and three slots. Alice transfers a booking to Bob; the deposit remains attached; Alice's QR fails and Bob's succeeds; cancellation pays exactly the documented schedule. Tests cover a simultaneous transfer/check-in attempt.

**Risk and differentiation.** The venue must agree to honor the digital booking; this is not established by token issuance. Do not claim unrestricted transfer if the issuer requires eligibility. Unlike a collectible ticket, the object carries liabilities and an enforceable lifecycle. The commercial model is a booking-service fee for operators.

## Track 11 — Memecoins With Mechanics

All three designs can use a conventional meme.cooking token plus an independent companion contract. The companion controls deposited balances and a disclosed reward budget; it does not pretend to alter a launchpad token's supply. A custom FT is only needed if the final design truly requires mint/burn hooks.

### 11A. Commons Pet — a community mascot with a real operating budget

**User and problem.** Memecoin participation usually reduces to trading and chat. A community can instead collectively care for a mascot whose environment responds to decisions with resource consequences.

**Original mechanism.** The pet needs balanced food, rest, and exploration. Contributions lock tokens into distinct action pools; overfeeding harms health, while neglecting rest blocks exploration. Successful expeditions unlock pre-funded community benefits such as an art commission or public stream. Per-epoch caps and refundable excess limit accepted contributions; they do not by themselves prevent a wealthy participant or a group of related accounts from dominating participation.

**Architecture and ecosystem fit.** A NEAR companion contract accepts NEP-141 deposits, resolves deterministic epochs, and controls a fixed benefit budget. meme.cooking supplies the compatible token; Trezu can approve an initial public-benefit budget. NEAR AI generates flavor text from settled state without deciding rewards. HOT makes participation convenient.

**Two-week cut and demo.** One mascot, three actions, six accelerated epochs. Show greedy feeding causing failure, coordinated balanced care recovering health, and a predetermined benefit becoming claimable. A visible simulator compares a whale, a dispersed community, and inactivity.

**Risk and differentiation.** Account caps alone are not Sybil resistance; use token-weight caps and locked-time rules with explicit limitations. Avoid redistribution advertised as yield. The mechanic is a collective resource-balancing problem, not the official daily-check-in streak coin.

### 11B. Meme Relay — completion requires different people to cooperate

**User and problem.** Meme communities often reward solitary posting or purchased impressions. A relay turns the meme itself into a collaborative artifact and rewards completion instead of engagement farming.

**Original mechanism.** A meme moves through fixed roles—writer, illustrator, translator, remixer—with a different signer at each handoff. Each contributor locks a small token bond and commits an artifact hash before revealing it. Completing a valid chain releases a pre-funded reward across the contributors; an abandoned baton times out, refunds according to known rules, and can be rescued by another participant.

**Architecture and ecosystem fit.** A companion contract stores the finite-state relay, signed handoffs, deadlines, and escrow. Artifact files remain offchain with hashes onchain. meme.cooking is the token rail; HOT is connection; NEAR AI can suggest translations but is not the truth oracle for quality. A sponsor or DAO funds a fixed seasonal reward pot.

**Two-week cut and demo.** Three roles, three participants, one completed relay, one timed-out handoff rescued by a fourth participant. Demonstrate that a single address cannot take adjacent roles and that claims cannot be replayed. Quality is accepted by explicit predecessor/successor acknowledgment in the MVP.

**Risk and differentiation.** Several addresses can belong to one person; optional known community membership reduces but does not solve this. Art quality remains socially judged. The novelty is an auditable collaboration ritual with time-bound obligations, not minting for clicks or speculating on a chart.

### 11C. Schism — a fandom can disagree without losing its shared resources

**User and problem.** Communities split over creative direction and treasury control, but a minority normally must abandon its contribution or fight for control of the entire group.

**Original mechanism.** Token holders lock a participation balance before a proposal cutoff. When two supported story directions conflict, a predefined fork process can split a limited, previously committed project budget between factions. Each faction receives its own mascot narrative and capped spending mandate; the parent coin remains the same. Unallocated treasury and third-party assets are not silently swept into the split.

**Architecture and ecosystem fit.** A companion vault records snapshot commitments, a challenge period, threshold support, and deterministic allocation. meme.cooking supplies the fungible token. Trezu/Sputnik approves the initial forkable grant and governs each faction's subsequent spending. NEAR AI can generate faction lore from public decisions.

**Two-week cut and demo.** One community, one forkable art budget, two factions, two fixed outcomes. Simulate disagreement, trigger the split, verify balances sum exactly to the committed grant, then show a late token transfer cannot claim both factions' allocation.

**Risk and differentiation.** This does not automatically distribute every asset owned by a DAO; only a grant explicitly committed to the mechanic is affected. Snapshot gaming and short-term capital capture require lock periods and conservative support thresholds. The interesting behavior is credible, peaceful exit; the token price is irrelevant. Secondary fit: Social Money.

## Track 12 — Social Money

All proposals use SputnikDAO/Trezu for the existing treasury and its approvals. An optional bounded program escrow is an application extension funded by a real DAO proposal, not a replacement multisig. A first demo can keep every payout behind a standard proposal, making governance compatibility easier to prove.

### 12A. Care Ledger — a community remembers the work money misses

**User and problem.** Volunteer organizations and parent cooperatives undercount organizing, mentoring, translation, and care work because those contributions rarely produce invoices.

**Original mechanism.** Members co-sign specific completed contributions; records are non-transferable and tied to named accounts. The community can apply a published policy that turns verified contribution history into access to scarce benefits—equipment loans, travel support, childcare-session credits—while keeping treasury decisions collective. Reciprocal confirmation and per-pair limits discourage two members endlessly validating one another.

**Architecture and ecosystem fit.** A contribution registry and policy engine generate a benefit recommendation plus its evidence. Sputnik/Trezu receives the corresponding payout or equipment-purchase proposal. Existing Finance members approve it. NEAR AI can privately summarize submitted evidence only if sensitive material stays offchain; the public record can expose a minimal approved claim instead of personal details.

**Two-week cut and demo.** Eight seeded members, three contribution types, one benefit fund. Two real user signatures confirm a contribution; the system produces an explainable proposal; the DAO approves a benefit. Demonstrate duplicate and self-attested claims being rejected.

**Risk and differentiation.** Co-signatures do not prove work happened; the prototype relies on a known membership boundary. Avoid presenting credits as a universal monetary valuation of care. Distinct from the starter bounty board because it recognizes existing reciprocal work and allocates access rather than paying predetermined tasks.

### 12B. Diaspora Invoice Club — collective remittances fund a concrete shared outcome

**User and problem.** Families and hometown associations pool money for a generator, school repair, or water pump, but fragmented transfers make it hard to know whether the full purchase is funded or what each contribution authorized.

**Original mechanism.** Contributors pledge to a specific supplier quote with a deadline and delivery milestones. The community approves the purchase through its treasury; if the threshold fails, contributors receive the documented refund. Funds are released to an approved supplier against explicit milestone acknowledgments rather than routed to an informal coordinator's personal wallet.

**Architecture and ecosystem fit.** A proposal/pledge application is built around a real Trezu/Sputnik treasury. NEAR Intents accepts supported donor assets and settles the supplier's chosen supported asset. HOT improves mobile access. A small escrow program is only used after the DAO explicitly authorizes its terms; the MVP can use a single payment and separate refund flow to reduce complexity.

**Two-week cut and demo.** One project, three contributors, two input assets, one supplier, two milestone attestations. Show a successful threshold and a failed threshold, then trace the executed DAO decision to its receipt and contributor obligations.

**Risk and differentiation.** The app cannot prove physical delivery; named local attestants and a dispute reserve are explicit trust assumptions. Do not promise local bank payouts without an actual off-ramp partner. It is a purpose-bound purchasing cooperative rather than another remittance quote screen. Secondary fit: Real-World Money.

### 12C. Commons Lease — shared ownership that pays for maintenance

**User and problem.** Makerspaces and cooperatives buy shared equipment but struggle to allocate usage fairly and preserve a maintenance reserve.

**Original mechanism.** Members collectively own access to a resource. Booking fees follow a public waterfall: operating costs, maintenance reserve, then a collectively chosen benefit. Maintenance contributions can earn priority access without creating a tradable claim over the entire machine. Booking records show who benefited and why a repair budget is needed.

**Architecture and ecosystem fit.** Trezu/Sputnik retains the treasury and approves spending. A booking contract issues time-bound usage rights using NEP-245; an offchain scheduler prevents impossible overlapping slots. NEAR Intents helps a visiting member pay with a supported asset. HOT handles mobile login. An equipment controller is optional; the prototype should explicitly simulate hardware access.

**Two-week cut and demo.** One 3D printer, four members, six slots, one repair event. Collect bookings, accrue a reserve, approve and pay a repair proposal, and prevent double-booking or claims by an expired credential.

**Risk and differentiation.** Hardware condition and usage telemetry are outside blockchain consensus. Use signed operator records and clearly label simulated telemetry. Distinct from a generic shared budget because access allocation and reserve adequacy are part of the product's ongoing operation. Business model: cooperative administration subscription.

## Track 13 — Open Innovation

These proposals change ownership, exit, or exchange itself. They can overlap other tracks but have a clear reason to use Open Innovation beyond simply adding an agent or token.

### 13A. Exit Rights — a service must fund your ability to leave

**User and problem.** A customer may own an account or data export in theory but still face expensive migration and stranded prepaid credit when a provider changes its terms.

**Original mechanism.** A service subscription reserves a small, explicitly agreed migration allowance. A user can authorize an agent to export a defined portable data format, compare compatible providers under private preferences, import to a replacement, and spend that allowance on the move. The original provider cannot veto release once the published exit conditions are met. This is an executable exit guarantee attached to a service relationship.

**Architecture and ecosystem fit.** A NEAR contract stores the allowance, eligibility, cancellation window, and destination restrictions. The user separately signs the data-access grant. NEAR AI can compare service terms without publishing personal preferences. NEAR Intents moves permitted payments to the replacement provider. SVRN is mission alignment only. A full cross-chain permission revocation system is out of scope.

**Two-week cut and demo.** Two demo note-taking services with the same JSON import/export schema. Change service A's terms; the user approves migration; data moves to B; reserved funds pay B; A's disabled backend does not prevent the contract releasing the allowance. Display separately whether data export succeeded and whether payment settled.

**Risk and differentiation.** An escrow cannot force a hostile provider to export data it never made portable. The prototype requires periodic user-controlled encrypted backups and participating services; it must not imply universal migration. Unlike an autonomous shopping agent, the central product is a enforceable right to leave that survives provider refusal.

### 13B. Memory Endowment — important files carry a budget for staying available

**User and problem.** Research datasets, civic records, and community archives disappear when a grant ends or a maintainer's hosting bill lapses.

**Original mechanism.** A collection has a maintenance endowment, replication policy, and public integrity commitments. Independent archivist agents compete for periodic storage/retrieval jobs. If one replica fails a challenge, a bounded agent hires a replacement and replenishes redundancy. The collection's survival does not depend on the original uploader remembering a subscription.

**Architecture and ecosystem fit.** A NEAR contract records content hashes, budgets, provider commitments, deadlines, and payment authorizations. Agent subaccounts have fixed procurement caps. NEAR Intents can settle providers in different supported assets. NEAR AI is useful for catalog descriptions but unnecessary for integrity checks. Sputnik/Trezu governs policy changes for a community archive. SVRN is relevant to sovereignty, not a technical dependency.

**Two-week cut and demo.** Ten public-domain files, two object-store adapters, one deliberately failed replica. Require retrieval of challenge chunks, verify hashes locally, provision a replacement, and show its capped payment. Use an accelerated schedule and expose remaining runway.

**Risk and differentiation.** Spot checks do not prove permanent availability or that providers are independent; challenge design and provider collusion remain open problems. Avoid financial-yield assumptions: start with a finite spending budget. This is an asset with an ongoing preservation mandate, not merely a file uploader or autonomous business dashboard.

### 13C. Economic Wind Tunnel — test the rules before people depend on them

**User and problem.** Teams designing programmable money, community treasuries, or NPC economies can check that individual contract methods work while missing failures that emerge only after many actors interact. A reward policy might concentrate all resources, leave promised benefits unfunded, or stop useful work when one supplier disappears.

**Original mechanism.** A reproducible experiment runner deploys the actual NEAR contracts and populates them with bounded synthetic participants. Designers introduce resource shocks, concentrated ownership, inactivity, and alternative allocation rules. The tool measures concentration, outstanding obligations versus reserves, useful task completion, and recovery after shocks. When an invariant fails, it minimizes the transaction history into a small executable counterexample and exports the experiment manifest, code hashes, action log, and assumptions. A judge can rerun the failure and compare a revised mechanism against the same initial scenario.

**Architecture and ecosystem fit.** NEAR Sandbox executes real Wasm contracts; `near-workspaces` creates actors, submits transactions, reads state, and controls test setup. A seeded generator produces populations and shocks. Rule-based agents provide the reproducible baseline; NEAR AI can generate bounded synthetic decisions for exploratory runs. Record model inputs, outputs, and resulting actions, then replay the recorded actions rather than claiming an LLM seed makes inference deterministic. Pin contract hashes, sandbox/runtime versions, initial state, dependency fixtures, and the logical schedule. A signed manifest identifies who endorsed the experiment; a signature does not prove the assumptions correct. OutLayer receipts are an optional future attested-run extension, subject to verifying exactly what its execution record covers.

**Why NEAR is substantive.** This is a testing instrument for NEAR executable economies, not a generic chart with a wallet attached. Running the deployed contract code preserves the actual authorization checks, asynchronous receipt/callback behavior, token transfer semantics, and economic state transitions that an independent spreadsheet model could omit. NEP-141/245 adapters let a designer inspect fungible balances and mixed inventories. The simulator adds scenario generation, economic metrics, paired experiments, and failure minimization on top of the existing sandbox; it does not claim to invent local blockchain testing.

**Two-week cut and demo.** Support one small resource-allocation economy, two policy versions, 20 synthetic participants, and three shocks. Show a superficially fair reward rule exhausting the repair reserve; export the shortest valid failing trace found by the reducer; rerun it from a clean sandbox; change the rule; rerun both the fixed action trace and fresh agent trials. The interface links each chart event to the transaction that caused it. Supply one command to reproduce the comparison and a signed manifest for the shared artifact.

**Risk and differentiation.** These experiments expose consequences under explicit assumptions; they do not predict human demand, prove an economy sustainable, or establish that LLM agents represent real people. Replaying fixed actions tests execution; rerunning agents against changed rules tests adaptation and can produce different actions. Clock-sensitive contracts need controlled logical schedules, and raw block hashes need not match across runs. Cross-chain counterparties, price feeds, and solver behavior remain labeled fixtures unless genuinely integrated. Failed scenarios are useful evidence, not an audit certificate. The differentiator is executable, shareable evidence about mechanism design rather than an investment dashboard or a generic agent security scanner.

**Verified tooling basis.** The official Sandbox runs a local NEAR node. Workspaces documents local contract deployment, actor creation, state patching/import, and time-related fast-forwarding; fast-forward does not accelerate transactions already in flight. Large state imports can encounter RPC limits, so the MVP should deploy its own small fixtures instead of promising an unrestricted mainnet fork. [NEAR Sandbox](https://github.com/near/near-sandbox), [NEAR Workspaces](https://github.com/near/near-workspaces-js)

## Best candidates from these five tracks

1. **Repair Passport:** immediately understandable user value and unusually meaningful NFT behavior. Best if a real repair shop can validate the workflow; transfer-race safety matters.
2. **Blackout Archipelago:** strongest visual demonstration and most direct fulfillment of the game-loop brief. The game must be enjoyable before elaborate sponsor integration.
3. **Economic Wind Tunnel:** strongest developer-tool proposal: make an economic failure reproducible against actual contracts, then compare a revised mechanism. Keep scenario assumptions explicit and distinguish action replay from fresh AI trials.
4. **Exit Rights:** strongest sovereignty narrative and a credible Open Innovation thesis. Limit scope to an explicit interoperable service pair and user-controlled backups.
5. **Diaspora Invoice Club:** strong locally relevant product and natural Trezu/Intents combination. Physical verification and off-ramp assumptions must stay explicit.

Sponsor integration quality should be judged by a removal test: if taking out the integration does not break a core user capability, it is optional. A game need not swap cross-chain on every move; a governance app should actually create and execute a treasury proposal; a launchpad token does not automatically supply custom token economics; sovereignty language alone is not an SDK integration.
