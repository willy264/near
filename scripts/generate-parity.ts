import fc from 'fast-check';
import {writeFileSync} from 'node:fs';
import {LedgerModel,STORAGE_FEE,stringify} from '../packages/shared/src/model.ts';
import {planClearing} from '../packages/solver/src/index.ts';
const names=['a','b','c'];
const sequences=[];
for(let sequence=0;sequence<25;sequence++){
 const m=new LedgerModel(['t']);for(const a of [...names,'solver']){m.storageDeposit(a,STORAGE_FEE*100n);m.setDebtCap(a,'t',1000n);}
 const random=fc.sample(fc.integer({min:0,max:100000}),{seed:42+sequence,numRuns:300});let cursor=0;const pick=(n:number)=>random[cursor++%random.length]%n;
 const steps=[];
 for(let step=0;step<40;step++){
  let method:string,caller:string,args:Record<string,unknown>,run:()=>unknown;
  if(step<6){const index=Math.floor(step/2),debtor=names[index],creditor=names[(index+1)%3];if(step%2===0){method='issue';caller=creditor;args={debtor,token:'t',amount:'10',memo:''};run=()=>m.issue(creditor,debtor,'t',10n);}else{method='accept';caller=debtor;args={id:String(index)};run=()=>m.accept(debtor,String(index));}}
  else if(step===6){method='submit_clearing';caller='solver';const batch={token:'t',cycles:[{ids:['0','1','2'],amount:5n}]};args={batch:JSON.parse(stringify(batch))};run=()=>m.submitClearing(caller,batch);}
  else{
   const choice=pick(9),all=m.obligations(),o=all.length?all[pick(all.length)]:null;caller=names[pick(3)];
   if(choice===0||!o){method='issue';const debtor=names[pick(3)],amount=BigInt(pick(25));args={debtor,token:'t',amount:String(amount),memo:''};run=()=>m.issue(caller,debtor,'t',amount);}
   else if(choice===1){method='accept';if(pick(2))caller=o.debtor;args={id:o.id};run=()=>m.accept(caller,o.id);}
   else if(choice===2){method='reject';if(pick(2))caller=o.debtor;args={id:o.id};run=()=>m.reject(caller,o.id);}
   else if(choice===3){method='cancel';if(pick(2))caller=o.creditor;args={id:o.id};run=()=>m.cancel(caller,o.id);}
   else if(choice===4){method='set_debt_cap';const max=BigInt(pick(40));args={token:'t',max:String(max)};run=()=>m.setDebtCap(caller,'t',max);}
   else if(choice===5){method='submit_clearing';caller='solver';const batch=planClearing(m.listOpen('t'),'t')[0]??{token:'t',cycles:[{ids:[o.id,o.id],amount:1n}]};args={batch:JSON.parse(stringify(batch))};run=()=>m.submitClearing(caller,batch);}
   else if(choice===6){method='ft_on_transfer';const sender=pick(2)?o.debtor:caller,amount=BigInt(pick(30));caller='t';args={sender_id:sender,amount:String(amount),msg:JSON.stringify({obligation_id:o.id})};run=()=>m.settle(sender,'t',amount,o.id);}
   else if(choice===7){method='accept_many';caller=o.debtor;args={ids:[o.id,'99999']};run=()=>m.acceptMany(caller,[o.id,'99999']);}
   else{method='set_pair_limit';const debtor=names[pick(3)],max=pick(2)?BigInt(pick(30)):null;args={debtor,token:'t',max:max===null?null:String(max)};run=()=>m.setPairLimit(caller,debtor,'t',max);}
  }
  let error:string|null=null;try{run();}catch(e){error=(e as Error).message;}
  m.assertInvariants();
  steps.push({method,caller,args,error,stats:m.stats('t'),accounts:names.map(a=>({name:a,net:m.netPosition(a,'t'),withdrawable:m.withdrawable(a,'t')}))});
 }
 sequences.push({seed:42+sequence,steps});
}
writeFileSync('fixtures/parity.json',stringify({schemaVersion:1,sequences}));
console.log('Generated 25 seeded model sequences x 40 operations for sandbox parity.');
