import {writeFileSync,mkdirSync} from 'node:fs';
import {runLocal,DEMAND,ROLES,displayAmount} from '../packages/sim/src/local.ts';
import {saveRun} from '../packages/sim/src/evidence.ts';
mkdirSync('packages/sim/scenarios',{recursive:true});
writeFileSync('packages/sim/scenarios/agents.json',JSON.stringify({schemaVersion:1,simulated:true,roles:ROLES,columns:['buyerRole','supplierRole','probabilityBps','minWholeTestTusd','maxWholeTestTusd'],demand:DEMAND},null,2));
const rows=[];
for(const scenario of ['agents','random','supply-chain','firms'] as const)for(const seed of [42,7,1234]){
 const run=runLocal({schemaVersion:1,scenario,seed,rounds:10,mode:'local'});const path=saveRun(run),s=run.stages.at(-1)!.fixture.stats;
 const row={scenario,seed,accepted:s.accepted_total,cleared:s.cleared_total,ratioBps:s.cleared_ratio_bps,obligations:run.acceptedCount,payments:run.payments,withdrawals:run.withdrawals,cycles:run.batches.reduce((n,b)=>n+b.cycles.length,0),elapsedMs:run.elapsedMs,evidence:path};rows.push(row);console.log(JSON.stringify(row));
 writeFileSync(`fixtures/expected-${scenario}-${seed}.json`,JSON.stringify({schemaVersion:1,parameters:run.parameters,stats:s,acceptedCount:run.acceptedCount,rejectedCount:run.rejectedCount,payments:run.payments,withdrawals:run.withdrawals},null,2));
}
writeFileSync('docs/evidence/kill-test.json',JSON.stringify({schemaVersion:1,parameters:{rounds:10,mode:'local',simulated:true},rows},null,2));
writeFileSync('docs/evidence/kill-test.md',`# Kill test: simulated local runs\n\nAll scenarios and seeds use 10 rounds. tUSD is a test token. No network or transactions are used. Demand matrix was fixed before measuring these results.\n\n| Scenario | Seed | Accepted tUSD | Cleared % | Cycles | Payments / obligations | Evidence |\n|---|---:|---:|---:|---:|---:|---|\n${rows.map(r=>`| ${r.scenario} | ${r.seed} | ${displayAmount(r.accepted)} | ${Number(r.ratioBps)/100} | ${r.cycles} | ${r.payments} / ${r.obligations} | [run](${r.evidence}.md) |`).join('\n')}\n\nPayment counts exclude separate creditor withdrawals. Raw amounts, timings, replay snapshots and all parameters are in the linked JSON files.\n`);
