# 00 — Executive Brief: NEAR HACKATHON (Nov 2026)

Accessed: 2026-11-02 (≈00:05 UTC). Researcher: HDE research phase. No project idea is selected in this phase.

## Event identity — VERIFIED
- **Name:** NEAR HACKATHON ("Build what's next"), official site https://nearhackathon.com (UTM params in the given URL are irrelevant; canonical URL confirmed).
- **Organizer:** NEAR ecosystem (NEAR Protocol / NEAR AI). Announced on X by @NEARProtocol on 2026-10-19 (status 2112257967818997891), amplified from @ilblackdragon. The exact legal entity running it is **UNKNOWN** — no Terms & Conditions page was found.
- **Format:** Online, no sign-up, no platform (no Devpost/DoraHacks). One custom form / JSON API.
- **Status right now:** LIVE. Development opened 2026-11-01 00:00 UTC. Submission window is open.

## Critical dates (all UTC) — VERIFIED
| Milestone | Time | Lagos (WAT, UTC+1) |
|---|---|---|
| Code counts from (announcement) | 2026-10-19 | — |
| Hackathon / submissions open | 2026-11-01 00:00 | 01:00 Nov 1 |
| **Development ends = submission deadline** | **2026-11-14 23:59** | **00:59 Nov 15** |
| Judging | 2026-11-16 → 11-18 | |
| Results announced by | 2026-11-18 23:59 | |
| Keep hosted demo up until | ≥ 11-18, ideally 11-25 | |

**≈12.9 days of build time remain** as of this brief.

## Money — VERIFIED
$250K total, fixed in USD, paid in NEAR, single payment within 30 days, no vesting.
- 1 × Grand Prize $55K (across all tracks)
- 13 tracks × ($10K / $3K / $2K) = $195K

## Hard constraints (summary; full table in 01)
1. Public repo by deadline; repo stays public through judging; add LICENSE.
2. Public X post: says "built at NEAR HACKATHON", tags @NEARProtocol + #NEARHackathon, video or screenshots attached (video **required** if judges can't open a hosted demo).
3. One submission per project; **cannot be edited**; each repo URL accepted once; max 2 submissions per email/person (projects must be independent and cross-reference each other in READMEs).
4. Only work done from 2026-10-19 → 2026-11-14 is judged. Pre-existing code must be separated (branch or tags `pre-hackathon` / `hackathon-submission` + README diff link).
5. A mainnet NEAR account is needed for payout. No mandatory sponsor integrations (Q-011).

## How judging works — VERIFIED (mechanism), UNKNOWN (rubric/weights)
- **Stage 1:** Claude Code and Codex screen *every* project: does it run, does it do what the README says. They produce a structured report and a preliminary score. Low AI score alone cannot reject (Q-017).
- **Stage 2:** Human jury decides: Illia Polosukhin (NEAR), Eddy Lazzarin (a16z crypto), Mert Mumtaz (Helius), Avichal Garg (Electric Capital), Kain Warwick (Synthetix & Infinex), Haseeb Qureshi (Dragonfly), Stepan Gershuni (cyber•Fund).
- **No official rubric or weights published.** The site points to past NEAR criteria as "a good guide": technical implementation, design, impact, originality, sustainability.
- Several tracks carry explicit "judged on" statements (see 03).

## The 10 most strategically important findings
1. **The AI screener is the first gate.** README must work as a test script for a machine: "do X → see Y", one-command setup, no secrets needed. This is the single largest controllable lever. (VERIFIED)
2. **Organizers published a starter prompt per track** that every AI-assisted team will paste. The literal starter ideas (DCA vault, counterparty check, general-contractor agent, crypto invoicing, group-buying swarm, streak coin, etc.) are high-collision. (VERIFIED prompts exist; collision is INFERRED)
3. **NEAR Intents has no testnet** and none is planned. Anything that touches 1Click must run on mainnet with tiny amounts or `dry: true` quotes. Judges need a no-funds dry-run path. (VERIFIED)
4. **Multi-track selection is allowed** on one submission; Open Innovation explicitly invites stacking. Whether one project can collect more than one prize is **UNKNOWN**.
5. **Grand prize ($55K) is 5.5× a track win** and is chosen across all 13 tracks — it rewards the single most impressive overall project, not a niche win. (INFERRED)
6. **Agent Economy and AI Security are visibly crowded already** (AgentGuard, CEOClaw agent-economy, Bot Desk, Clearance crash-tests, BrainDAO intents agent) before day 2. (VERIFIED repos; density INFERRED)
7. **Several tracks say what they reward:** thesis = evidence not conviction; games = game loop not token, bonus if chain is invisible; memecoins = mechanic not chart; social = don't rebuild multisig; realworld = usable by a normal company tomorrow. (VERIFIED)
8. **Judges are mostly crypto investors and infra founders**, not hackathon generalists. Expect sharp questions on "why onchain", real demand, and defensibility. (INFERRED from affiliations)
9. **Existing products on other chains are allowed** — only the new NEAR integration is judged (Q-002). Teams with prior code can port. (VERIFIED)
10. **The submission is one-shot and unforgiving**: no edits, repo dedupe, `website` field is a spam trap that auto-rejects, AI agents may submit via API only after human confirms the payload. (VERIFIED)

## Five highest-impact unknowns (detail in 11)
1. Official rubric / weights per track.
2. Can one project win in multiple tracks and/or the grand prize plus a track prize?
3. Eligibility restrictions (country/sanctions, age, KYC for payout) — no T&Cs found.
4. Real competition density per track (no public submission gallery found).
5. Our own team: size, skills, budget for mainnet test funds, existing code.

## Research completion status
**Partial-but-decision-ready.** Rules, tracks, prizes, dates, submission mechanics, judging mechanism and all 13 track prompts are verified from primary sources. Gaps: no official rubric exists to extract; historical winner data is thin (official result pages failed to load); competitor scan is search-based only (GitHub search API was unavailable — no linked account); judge research relies on public affiliations, not fresh source reads; sponsor docs were checked at overview level only.

## Next decisions for the strategy engine
1. Collect team facts (Q in 11) — they change track feasibility more than any remaining research.
2. Shortlist 3–4 tracks using 02 + 09; avoid the literal starter idea in any track.
3. Run the access checks in 08 (NEAR AI Cloud key, 1Click dry quote, testnet account) on day 1 before committing.
