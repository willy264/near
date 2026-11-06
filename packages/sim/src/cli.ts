import {Command} from 'commander';
import {scenarioConfigSchema} from '../../shared/src/schemas.ts';
import {runLocal,displayAmount} from './local.ts';
import {saveRun} from './evidence.ts';
const cli=new Command();
cli.name('sim');
cli.command('run').option('--scenario <name>','agents, random, supply-chain or firms','agents').option('--seed <integer>','seed','42').option('--rounds <integer>','rounds','10').option('--mode <mode>','local or testnet','local').action(options=>{const p=scenarioConfigSchema.parse({schemaVersion:1,...options,seed:Number(options.seed),rounds:Number(options.rounds)});if(p.mode!=='local')throw Error('Testnet simulator not implemented yet; use local');const run=runLocal(p),s=run.stages.at(-1)!.fixture.stats;const path=saveRun(run);console.log(`SIMULATED: cleared ${displayAmount(s.cleared_total)} of ${displayAmount(s.accepted_total)} tUSD (test token) (${Number(s.cleared_ratio_bps)/100}%) with 0 transfers; ${run.payments} payments settled the rest; ${run.withdrawals} creditor withdrawals.`);console.log(`Evidence: docs/evidence/${path}.md`);});
await cli.parseAsync();

