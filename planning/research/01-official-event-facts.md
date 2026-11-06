# 01 — Official Event Facts & Rules

Accessed 2026-11-02. Primary sources: nearhackathon.com (S1), nearhackathon.com/HACKATHON.md (S2, "read again before submitting, rules may change"), nearai/near-hackathon-prompt-examples (S3). Authority order when sources conflict: **S2 (live HACKATHON.md) > S1 > S3 > third parties.**

## Identity
| Fact | Value | Status | Source |
|---|---|---|---|
| Name | NEAR HACKATHON | VERIFIED | S1 |
| Theme line | "The era of programmable money starts here… Autonomous payments. Intelligent agents." | VERIFIED | S1 |
| Meta description | Privacy, intents, AI and digital ownership | VERIFIED | S1 |
| Organizer | NEAR Protocol / NEAR AI (repo under `nearai` GitHub org) | VERIFIED (brand) / UNKNOWN (legal entity) | S1, S3 |
| Announcement | 2026-10-19, x.com/NEARProtocol/status/2112257967818997891 | VERIFIED | S2 Q-001 |
| Format | Online, solo or team, no registration | VERIFIED | S1 |

## Schedule (UTC)
| Event | Value | Status |
|---|---|---|
| Starts / submissions open | 2026-11-01T00:00:00Z | VERIFIED |
| Development ends / deadline | 2026-11-14T23:59:00Z | VERIFIED |
| Judging | 2026-11-16 to 11-18 | VERIFIED |
| Results by | 2026-11-18T23:59:00Z | VERIFIED |
| Submission API outside window | returns 403 | VERIFIED |

## Hard-constraints table
| # | Requirement | Exact source text (abridged) | Operational implication | Compliance status |
|---|---|---|---|---|
| H1 | Public repo | "Make the repository public before development ends" (S2) | Repo can be private while building; flip public before 23:59 UTC Nov 14 | Not started |
| H2 | Repo stays public | "Repo stays public through judging; add a LICENSE file" (Q-014) | Don't archive/privatize before Nov 18 | Not started |
| H3 | Demo post on X | Says built at NEAR HACKATHON, tags @NEARProtocol and #NEARHackathon, video or screenshots (S2) | Human must post it; agent may only draft | Not started |
| H4 | Video if no hosted demo | "screenshots are not enough when judges cannot open the demo" (Q-012) | Record video unless a hosted demo is live | Not started |
| H5 | Code window | Code from 2026-10-19 to 2026-11-14 counts; earlier commits are baseline (Q-001) | Commit history matters | — |
| H6 | Pre-existing work | Old project as-is: no. New feature in window: yes, separated via branch or tags `pre-hackathon` / `hackathon-submission` + README diff link (Q-003/004) | If reusing code, tag first | — |
| H7 | Port from other chain | Allowed; only NEAR integration built in window is judged; disclose in README (Q-002) | — | — |
| H8 | Libraries / AI code | All allowed incl. AI-generated code; list in README; own old libs count as baseline (Q-005) | README "Built with" + "AI assistance" section | — |
| H9 | Mandatory integrations | "None. Hints are hints. Own contract on NEAR that fits the track is enough." (Q-011) | Freedom; but track fit must be obvious | — |
| H10 | Testnet | Testnet-only projects eligible in all tracks (Q-010) | Testnet first | — |
| H11 | Intents | No testnet exists or is planned; use mainnet, separate dev accounts, tiny amounts, `dry: true` quotes (Q-007) | Budget a few USD of mainnet funds; build dry-run mode | — |
| H12 | One submission per project | Cannot be edited; second submit of same repo rejected (409) | Submit only when everything is final | — |
| H13 | Submission limits per person | ≤2 projects per person/email; must be independent and each README names the other (Q-015) | — | — |
| H14 | Payout account | Mainnet named (`x.near`) or 64-char implicit account; team creates it; never invented by agent | Create before submitting | Not started |
| H15 | Description | 20–2,000 chars: problem, product, how NEAR fits | Draft early | — |
| H16 | Consent | Must agree to contact notice verbatim | Human only | — |
| H17 | Spam trap | `website` field must be empty when using the API | Never fill it via API | — |
| H18 | Secrets | No keys in repo history (S3 SUBMITTING.md) | Scan history before going public | — |
| H19 | IP | Team keeps all rights; organizers get non-exclusive promo rights (Q-013) | Any license, MIT fine | — |
| H20 | Hosted demo uptime | Keep up to 2026-11-18, ideally 11-25 (Q-012) | Plan hosting cost | — |

## Submission contract (API) — VERIFIED (S2)
`POST https://nearhackathon.com/api/applications`, JSON, ≤12,000 bytes, exactly these fields:
`requestId` (UUID, reused on retry), `projectName` (2–80), `leadName` (2–80), `email` (≤160), `size` (`1`, `2 - 4`, `4 - 6`, `6 - 8`, `8+`), `tracks` (array of ids), `nearAddress` (lowercase regex), `projectUrl` (≤300, unique), `demoUrl` (≤300), `idea` (20–2000), `consent` (true).
Responses: 201 saved · 400 field error (fix, same requestId) · 403 window closed (don't retry) · 409 duplicate repo / email limit · 413 too large · 503 retry same requestId.
Agent rules: print full payload, wait for human "yes" before sending; never post to X, make repo public, push, sign transactions or deploy to mainnet without confirmation.

Track ids: `defi, thesis, privacy, business, swarms, security, agents, realworld, games, nfts, memecoins, social, open`.

## Eligibility — mostly UNKNOWN
- S1 FAQ: "Developers, designers and people with ideas for the NEAR ecosystem." No country, age, sanctions or KYC language found. **UNKNOWN** whether payout requires KYC or excludes jurisdictions. Ask in Discord before relying on a payout.
- Team size: any (form offers 1 to 8+). VERIFIED.

## Support channels
NEAR Discord (discord.gg/nearprotocol), Telegram (t.me/nearbuilderschat), X @NEARProtocol, NEAR DevHub YouTube (track-prompt walkthroughs). NEAR AI credits: buy at cloud.near.ai or claim $10 by joining NEAR Builders (Q-000).

## Discrepancies noted
- 1Click unauthenticated fee: S2 Q-006 says **0.2%**; NEAR Intents quickstart says an **extra 0.25%**. Irrelevant for prototypes; register a JWT at partners.near-intents.org to avoid it.
- Third-party press calls it "NEAR AI Hackathon" (CEOClaw README) — the official name is just NEAR HACKATHON.
