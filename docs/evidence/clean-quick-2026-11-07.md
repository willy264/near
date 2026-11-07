# Clean quick judge rehearsal — 2026-11-07

Independent Codex review of committed `b25d354` in new Linux Ext4 clone `/tmp/untangle-clean-quick-b25d354`. Node 26.13.0 and pnpm 12.16.1 were prerequisites; Rust was excluded from PATH. No `.env`, `.keys`, or pre-existing node_modules. Dependency package cache was available.

Commands:
```sh
git clone --no-hardlinks /mnt/c/Users/HP/Documents/people/hackathons/near /tmp/untangle-clean-quick-b25d354
cd /tmp/untangle-clean-quick-b25d354
git checkout b25d354
test ! -e .env && test ! -d .keys
test -z "$(git status --porcelain)"
bash scripts/judge.sh --quick
test -z "$(git status --porcelain)"
git status --short --ignored
```

**PASS, exit 0, 49 seconds.** Eleven TypeScript tests passed (client 2, shared 4, simulator 1, solver 4), web/root typechecks passed, and 12 fixtures matched. The local agents seed-42 run completed. Exact output is in [clean-quick-2026-11-07.log](clean-quick-2026-11-07.log).

```text
SIMULATED: cleared 295 of 735 tUSD (test token) (40.13%) with 0 transfers; 81 payments settled the rest; 11 creditor withdrawals.
Evidence: .runs/evidence/run-agents-42-local-2026-11-07T15-23-05-065Z.md
Elapsed: 49 seconds
After: clean
!! .runs/
!! node_modules/
!! packages/client/node_modules/
!! packages/shared/node_modules/
!! packages/sim/node_modules/
!! packages/solver/node_modules/
```

Both before and after `git status --porcelain` were empty. Local simulation outputs went only under ignored `.runs/`; installation created ignored node_modules directories. No committed fixtures or published evidence changed. Static review confirms `saveRun` defaults local runs to `.runs`, while `scripts/kill-test.ts` explicitly passes `publish=true` when intentionally publishing evidence. The under-two-minute target is demonstrated for this cached Linux run, not guaranteed for cold downloads or Windows-mounted filesystems.
