import {actions,PublicKey,baseEncode} from 'near-api-js';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {account,keys,project,call,view,provider,AGENT_METHODS,YOCTO,transaction,evidence,verifyNetwork} from '../packages/client/src/index.ts';
await verifyNetwork();const p=project();const ids=[`agent-01.${p.parent}`,`agent-02.${p.parent}`,p.solver];
for(const id of ids){const a=account(id);if(!await view(p.ledger,'storage_balance_of',{account_id:id}))await call(a,p.ledger,'storage_deposit',{account_id:null},2n*YOCTO/5n);await call(a,p.ledger,'set_debt_cap',{token:p.token,max:'1000000000'},1n);if(!await view(p.token,'storage_balance_of',{account_id:id}))await call(a,p.token,'storage_deposit',{account_id:null,registration_only:true},YOCTO/100n);if(id!==p.solver){const k=keys(id,'agent');const existing=await a.getAccessKeyList();if(!existing.keys.some(v=>v.public_key===k.public_key))await transaction(a,id,[actions.addFunctionCallAccessKey(PublicKey.fromString(k.public_key),p.ledger,AGENT_METHODS,YOCTO/4n)],'add-agent-key');}}
const a=account(ids[0],'agent');const b=account(ids[1],'agent');
const issued=await call(a,p.ledger,'issue',{debtor:ids[1],token:p.token,amount:'100',memo:'TEST ONLY: scoped key proof'},0n,50n*10n**12n,'agent');
const accepted=await call(b,p.ledger,'accept',{id:issued.value},0n,50n*10n**12n,'agent');
const failures=[];
for(const [label,receiver,txActions] of [
 ['set_debt_cap',p.ledger,[actions.functionCall('set_debt_cap',{token:p.token,max:'1000'},30n*10n**12n,1n)]],
 ['withdraw',p.ledger,[actions.functionCall('withdraw',{token:p.token,amount:null},30n*10n**12n,1n)]],
 ['storage_deposit',p.ledger,[actions.functionCall('storage_deposit',{account_id:null},30n*10n**12n,1n)]],
 ['ft_transfer_call',p.token,[actions.functionCall('ft_transfer_call',{receiver_id:p.ledger,amount:'1',msg:JSON.stringify({obligation_id:issued.value}),memo:null},30n*10n**12n,1n)]],
 ['transfer_near',ids[0],[actions.transfer(1n)]]
] as const){
 let hash:string|null=null;let error:string|null=null;
 try{const signed=await b.createSignedTransaction({receiverId:receiver,actions:[...txActions]});hash=baseEncode(createHash('sha256').update(signed.transaction.encode()).digest());const r=await provider.providers[0].sendTransaction(signed);if(typeof r.status==='object'&&'Failure'in r.status)error=JSON.stringify(r.status);}
 catch(e){error=e instanceof Error?e.message:String(e);}
 if(!error)throw Error(`SECURITY FAILURE: ${label} succeeded`);
 const row={label,signedTransactionHash:hash,includedOnChain:false,error,keyRole:'agent',signer:b.accountId};failures.push(row);evidence('key-failures',row);console.log(JSON.stringify(row));
}
// Clean up the proof debt with an operator payment, then withdraw.
await call(account(ids[1]),p.token,'faucet',{amount:'100'},0n);
await call(account(ids[1]),p.token,'ft_transfer_call',{receiver_id:p.ledger,amount:'100',msg:JSON.stringify({obligation_id:issued.value}),memo:null},1n);
await call(account(ids[0]),p.ledger,'withdraw',{token:p.token,amount:null},1n);
writeFileSync('docs/evidence/keys.md',`# Testnet scoped-key proof\n\nTEST ONLY. Ledger: ${p.ledger}\n\nIssue: ${issued.hash}\nAccept: ${accepted.hash}\n\nAll five forbidden actions were rejected. Signed hashes below identify attempted transactions, not included transactions; the protocol rejects these before receipts, so explorer entries are not expected.\n\n\`\`\`json\n${JSON.stringify(failures,null,2)}\n\`\`\`\n`);
console.log('Scoped keys: issue/accept succeeded; 5 forbidden actions rejected; operator settled and withdrew.');

