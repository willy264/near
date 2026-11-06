# 02 — Track & Prize Matrix

Accessed 2026-11-02. All 13 tracks pay $10K / $3K / $2K. One $55K grand prize across all tracks. No separate sponsor bounties were found (the "Ecosystem" partners are listed as tools, not prize sponsors — VERIFIED absence on S1/S2; partner-run side bounties elsewhere are UNKNOWN).

Prize stacking: a project may select every track it fits (VERIFIED). Whether it can **win** more than one track, or grand + track, is **UNKNOWN**.

Columns: *Judged-on* = explicit official statement. *Starter* = the example idea in the official prompt (high collision risk). *Collision* and *Feasibility* are our INFERRED estimates (L/M/H), not facts.

| id | Track | Official brief (short) | Hints (not required) | Explicit judged-on | Starter idea (avoid literal copy) | Key docs | Hard deps | Collision risk | 2-week feasibility |
|---|---|---|---|---|---|---|---|---|---|
| defi | Unstoppable DeFi | Exchanges, perps, lending, vaults, trading agents settling cross-chain via Intents | Trading, Intents, Chain Signatures | — | Cross-chain DCA vault with 1Click quotes, dry-run, Chain Sig stretch | 1Click quickstart, Chain Signatures, Rhea, Agent API, Aurora Intents | Intents mainnet-only | H | M (mainnet funds, financial risk) |
| thesis | Investment Thesis | Long-term NEAR thesis backed by onchain analytics, dashboards, re-runnable models | Onchain data, dashboards, research | "Judged on the evidence, not the conviction"; "score depends on evidence someone else can reproduce" | Intents volume vs price as leading indicator | NEAR BigQuery public dataset, Intents Explorer API (needs JWT) | BigQuery billing; Explorer JWT | L–M | H (data work, little contract risk) |
| privacy | Privacy & Private AI | Confidential compute, private finance, AI protecting sensitive data | Private AI, TEE, NEAR AI Cloud | — | Private expense auditor with TEE attestation "Verified" panel | NEAR AI Cloud quickstart + verification, verification example repo | NEAR AI Cloud API key & credits | M | H |
| business | Autonomous Business | AI-native business: treasury, sales, procurement, Intents payments, revenue share; humans set constraints | AI agents, Intents, Chain Signatures | — | One-agent research shop with config.yaml rules, OutLayer custody, public ledger | AI & NEAR docs, OutLayer, 1Click, Agent API, PingPay Agent Pay (x402) | Payment rails; agent custody | M–H | M |
| swarms | AI Swarms | Coordination markets, bidding, collective purchasing, intent settlement between agents | Multi-agent, Intents, sub-accounts | — | Group-buying GPU swarm, sealed bids, 20 buyers/5 sellers sim | Intents concepts, NEAR MCP server, Top Level Accounts, Agent API | Sub-accounts on testnet | M | M–H |
| security | AI Security & Defense | Spending limits, policy engines, sandboxed wallets, reputation, scam detection | Agent security, function-call keys, TEE attestation | — | Counterparty check (allow/warn/block) + prompt-injection attack demo | Access keys, OutLayer, NEAR AI Cloud verification | — | **H** (visible entries already) | H |
| agents | Agent Economy | Agents that earn, spend, negotiate, hire agents, pay for APIs/compute/data | Agent commerce, Intents, Chain Signatures | — | General-contractor agent hiring via Agent Market, counter-offer, receipts | Agent Market jobs, NEAR MCP, 1Click | Agent Market programmatic API (verify) | **H** (visible entries already) | M |
| realworld | Real-World Money | Payroll, invoicing, remittances, merchant payments, stablecoin rails | Stablecoins, Intents, meta-transactions | "Something a normal company could use tomorrow" | Crypto invoicing for freelancers, gasless via relayer, CSV export | 1Click, meta-tx relayer tutorial, NEP-141 | Intents mainnet-only for real payments | M–H | M |
| games | Games With Real Economies | NPCs with wallets, player markets, self-evolving economies | Agent NPCs, social login, Intents, NEP-245 | "Judged on the game loop, not the token — bonus if players never notice the chain" | Market-town game, NEP-245 items, merchant agents, fast-forward sim | NEP-245, near-dapp skill | Game design + art time | L–M | M |
| nfts | NFTs That Do Something | NFTs as accounts: hold money, earn royalties, carry credentials/access | Dynamic NFTs, NEP-171, sub-accounts | — | Membership NFT carrying its own sub-account wallet; transfer threat model | NEP-171, access keys, TLA contracts (no SDK, live on mainnet) | Contract-heavy; TLA has no SDK | L–M | M (hard security edge cases) |
| memecoins | Memecoins With Mechanics | Memes that do something: reactive supply, rule-bound treasuries, rituals | Memecoins, token mechanics, NEP-141 | "Judged on the mechanic, not the chart" | Streak coin with daily check-ins, mint/burn, no admin key | NEP-141, meme.cooking, contracts skill | Sybil resistance | M | H (small contract) |
| social | Social Money | Shared budgets, programmable rewards, collective ownership, reputation access on Sputnik DAO & Trezu | Sputnik DAO, Trezu, named accounts | "Don't rebuild the multisig — build what communities do with it" | Bounty board with earned-trust approval tiers | Sputnik DAO contract, Trezu docs/repo, near.social, TLA | Must integrate an existing DAO/Trezu | L–M | M |
| open | Open Innovation | Ideas that don't fit a category; money × intelligence × ownership | Experimental, chain abstraction | "Something we haven't seen" | Inheritance account via Chain Signatures + guardians | Chain Signatures, docs | — | M (stack-on track) | varies |

## Notes per track that change decisions
- **thesis** is the only non-product track. It rewards reproducible analysis, which maps directly onto the AI screener ("does it run, does it do what the README says"). Requires BigQuery queries (user pays query cost; filter on `block_date`). Judges include investors (a16z, Dragonfly, Electric Capital, cyber•Fund) — the natural audience for a thesis (INFERRED).
- **security / agents** — the starter prompts align with ideas already public on GitHub before day 2 (see 06). Entering here requires a clearly different mechanism.
- **games / memecoins / social / realworld** each state their bar explicitly; a project that meets the stated bar visibly in the demo has an easy story for judges.
- **open** is explicitly stackable with any other track — select it whenever the idea is unusual.
- **nfts** has a strong primitive (TLA: a rented name is both an NEP-171 NFT and a real account) with no SDK yet → fewer teams will manage it (INFERRED), but higher build risk.

## Prize economics (INFERRED)
- Expected-value per track is equal ($15K top-3 pool each). Picking a less-crowded track raises odds without lowering the prize.
- The grand prize is a separate lottery decided across all entries; it likely goes to a project that is both polished and ambitious, regardless of track.
