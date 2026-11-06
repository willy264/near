import {Account,FailoverRpcProvider,JsonRpcProvider,KeyPair,actions} from 'near-api-js';
import {readFileSync,writeFileSync,mkdirSync,existsSync,appendFileSync} from 'node:fs';
export const RPCS=['https://test.rpc.fastnear.com','https://near-testnet.drpc.org'];
export const provider=new FailoverRpcProvider(RPCS.map(url=>new JsonRpcProvider({url})));
export const AGENT_METHODS=['issue','issue_many','accept','accept_many','reject','cancel'];
export const YOCTO=10n**24n;
export function testnetId(id:string){if(!id.endsWith('.testnet')||id.includes('..'))throw Error('TESTNET_ONLY');return id;}
export async function verifyNetwork(){if(await provider.getNetworkId()!=='testnet')throw Error('TESTNET_ONLY');}
export function keys(id:string,role='operator'){testnetId(id);mkdirSync('.keys',{recursive:true});const path=`.keys/${id}.${role}.json`;if(!existsSync(path)){const k=KeyPair.fromRandom('ed25519');writeFileSync(path,JSON.stringify({account_id:id,public_key:k.getPublicKey().toString(),private_key:k.toString()}),{mode:0o600});}return JSON.parse(readFileSync(path,'utf8'));}
export function account(id:string,role='operator'){const k=keys(id,role);return new Account(testnetId(id),provider,k.private_key);}
export function project(){return JSON.parse(readFileSync('.keys/project.json','utf8'));}
export function evidence(name:string,value:unknown){mkdirSync('docs/evidence',{recursive:true});appendFileSync(`docs/evidence/${name}.jsonl`,JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v)+'\n');}
export async function transaction(who:Account,receiver:string,txActions:Parameters<Account['signAndSendTransaction']>[0]['actions'],label:string,role='operator'){
 await verifyNetwork();testnetId(who.accountId);testnetId(receiver);
 const result=await who.signAndSendTransaction({receiverId:receiver,actions:txActions,waitUntil:'FINAL',throwOnFailure:false});
 const gas=result.receipts_outcome.reduce((sum,r)=>sum+BigInt(r.outcome.gas_burnt),BigInt(result.transaction_outcome.outcome.gas_burnt));
 evidence('transactions',{label,signer:who.accountId,keyRole:role,receiver,hash:result.transaction.hash,gas:gas.toString(),status:result.status,receipts:result.receipts_outcome,timestamp:new Date().toISOString()});
 if(typeof result.status==='object'&&'Failure'in result.status)throw Error(JSON.stringify({hash:result.transaction.hash,failure:result.status.Failure}));
 return result;
}
export async function call(who:Account,receiver:string,method:string,args:object,deposit=0n,gas=100n*10n**12n,role='operator'){
 const result=await transaction(who,receiver,[actions.functionCall(method,args,gas,deposit)],method,role);
 const value=typeof result.status==='object'&&'SuccessValue'in result.status?Buffer.from(result.status.SuccessValue,'base64').toString():'';
 return {value:value?JSON.parse(value):null,hash:result.transaction.hash,result};
}
export async function view<T extends object|string|number|boolean>(contractId:string,method:string,args:Record<string,unknown>){testnetId(contractId);return provider.callFunction<T>({contractId,method,args});}
export async function exists(id:string){try{await provider.providers[0].viewAccount({accountId:testnetId(id)});return true;}catch(e){if(/does not exist|UNKNOWN_ACCOUNT|UnknownAccount/i.test(String(e)))return false;throw e;}}


