import {account,project,view,call} from '../packages/client/src/index.ts';
const p=project();
const open=await view<{id:string;debtor:string;creditor:string;remaining:string;memo:string}[]>(p.ledger,'list_open',{token:p.token,from_index:'0',limit:200}) ?? [];
if(open.some(o=>o.memo!=='G'.repeat(128)||o.remaining!=='1'))throw Error('Unexpected non-benchmark obligations; refusing cleanup');
const left=open.filter(o=>o.creditor===`agent-01.${p.parent}`),right=open.filter(o=>o.creditor===`agent-02.${p.parent}`);
if(left.length!==right.length || left.length+right.length!==open.length)throw Error('Benchmark graph is not balanced');
for(let i=0;i<left.length;i+=10)await call(account(p.solver),p.ledger,'submit_clearing',{batch:{token:p.token,cycles:left.slice(i,i+10).map((o,j)=>({ids:[o.id,right[i+j].id],amount:'1'}))}},0n,180n*10n**12n);
console.log(`Cleaned ${open.length} benchmark obligations in validated 2-cycles.`);


