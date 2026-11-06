import {LedgerModel,STORAGE_FEE,stringify} from '../../shared/src/model.ts';
import {fixtureSchema,runEvidenceSchema,type ScenarioConfig,type RunEvidence} from '../../shared/src/schemas.ts';
import {planClearing} from '../../solver/src/index.ts';
export const TOKEN='tusd.local';
const UNIT=1_000_000n;
export const ROLES=['data-feed','scraper','summarizer','translator','inference-reseller','auditor'];
// Buyer role, supplier role, purchase probability in basis points, price range in whole test tUSD.
export const DEMAND:[number,number,number,number,number][]=[[2,1,6500,3,10],[2,4,6500,2,9],[3,4,7000,3,11],[1,0,7500,2,8],[4,5,5000,4,12],[4,0,6500,3,10],[5,2,6000,4,11],[5,3,5000,3,12],[0,5,6000,3,10]];
export const FIRMS=['farm co-op','packaging maker','food processor','transport company','wholesaler','retailer one','retailer two','equipment repair shop'];
const FIRM_DEMAND:[number,number,number,number,number][]=[[2,0,8000,8,20],[2,1,7000,3,9],[4,2,8000,8,18],[5,4,8500,5,13],[6,4,8500,5,13],[0,3,5000,3,9],[1,3,5000,3,9],[2,3,5000,3,9],[3,7,6000,4,10],[7,5,5000,3,8],[7,6,5000,3,8],[0,7,5000,3,8],[1,7,5000,3,8]];
export function rng(seed:number){let state=seed>>>0;return ()=>{state=(state+0x6D2B79F5)>>>0;let x=state;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return (x^(x>>>14))>>>0;};}
export type Trade={buyer:number;seller:number;amount:bigint;round:number};
export function trades(parameters:ScenarioConfig):Trade[]{const next=rng(parameters.seed),out:Trade[]=[];const n=parameters.scenario==='firms'?8:12;
 for(let round=0;round<parameters.rounds;round++){
  if(parameters.scenario==='agents')for(const [buyer,seller,prob,min,max] of DEMAND)for(let copy=0;copy<2;copy++){if(next()%10000<prob)out.push({buyer:buyer*2+copy,seller:seller*2+next()%2,amount:BigInt(min+next()%(max-min+1))*UNIT,round});}
  else if(parameters.scenario==='firms')for(const [buyer,seller,prob,min,max] of FIRM_DEMAND){if(next()%10000<prob)out.push({buyer,seller,amount:BigInt(min+next()%(max-min+1))*UNIT,round});}
  else for(let attempt=0;attempt<18;attempt++){if(next()%10000>=6500)continue;const buyer=next()%n;let seller=next()%(n-1);if(seller>=buyer)seller++;const ordered=parameters.scenario==='supply-chain';out.push({buyer:ordered?Math.min(buyer,seller):buyer,seller:ordered?Math.max(buyer,seller):seller,amount:BigInt(2+next()%11)*UNIT,round});}
 }
 return out;
}
export function runLocal(parameters:ScenarioConfig):RunEvidence{
 const start=performance.now(),m=new LedgerModel([TOKEN]);const names=Array.from({length:parameters.scenario==='firms'?8:12},(_,i)=>`${parameters.scenario==='firms'?'firm':'agent'}-${String(i+1).padStart(2,'0')}.local`);
 const funds=new Map<string,bigint>();for(const a of [...names,'solver.local']){m.storageDeposit(a,STORAGE_FEE*1000n);m.setDebtCap(a,TOKEN,250n*UNIT);funds.set(a,1000n*UNIT);}
 let accepted=0n,rejected=0n,payments=0n,withdrawals=0n;
 for(const trade of trades(parameters)){const creditor=names[trade.seller],debtor=names[trade.buyer];const id=m.issue(creditor,debtor,TOKEN,trade.amount,`SIMULATED ${parameters.scenario} round ${trade.round+1}`);try{m.accept(debtor,id);accepted++;}catch(e){if((e as Error).message!=='ERR_DEBT_CAP')throw e;m.reject(debtor,id);rejected++;}m.assertInvariants();}
 const snapshot=()=>fixtureSchema.parse(JSON.parse(stringify({schemaVersion:1,simulated:true,token:TOKEN,tokenLabel:'tUSD (test token)',parameters,obligations:m.obligations(),stats:m.stats(TOKEN)})));
 const stages:RunEvidence['stages']=[{name:'trading',fixture:snapshot()}];
 const nets=names.map(a=>m.netPosition(a,TOKEN).net);
 const batches=planClearing(m.listOpen(TOKEN),TOKEN,m.config);
 for(const batch of batches){m.submitClearing('solver.local',batch);m.assertInvariants();}
 if(stringify(nets)!==stringify(names.map(a=>m.netPosition(a,TOKEN).net)))throw Error('I1');
 stages.push({name:'clearing',fixture:snapshot()});
 for(const o of m.listOpen(TOKEN)){if(funds.get(o.debtor)!<o.remaining)throw Error('Insufficient simulated token balance');funds.set(o.debtor,funds.get(o.debtor)!-o.remaining);m.settle(o.debtor,TOKEN,o.remaining,o.id);payments++;m.assertInvariants();}
 for(const name of names){const n=m.withdrawable(name,TOKEN);if(n>0n){m.withdraw(name,TOKEN);funds.set(name,funds.get(name)!+n);withdrawals++;}m.assertInvariants();}
 if([...funds.values()].reduce((a,b)=>a+b,0n)!==BigInt(names.length+1)*1000n*UNIT)throw Error('Simulated token supply changed');
 stages.push({name:'settlement',fixture:snapshot()});
 return runEvidenceSchema.parse(JSON.parse(stringify({schemaVersion:1,simulated:true,tokenLabel:'tUSD (test token)',parameters,stages,batches,acceptedCount:accepted,rejectedCount:rejected,payments,withdrawals,elapsedMs:performance.now()-start,transactions:[]})));
}
export function displayAmount(raw:string){const n=BigInt(raw),whole=n/UNIT,fraction=String(n%UNIT).padStart(6,'0').replace(/0+$/,'');return `${whole}${fraction?'.'+fraction:''}`;}
