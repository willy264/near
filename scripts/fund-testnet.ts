// Faucet funding flow verified in near/docs snippets/faucet.jsx on 2026-11-06.
// Transfer the documented 5 test NEAR; retain the temporary account and its local key.
import {randomBytes} from 'node:crypto';
import {actions} from 'near-api-js';
import {account,keys,project,transaction,verifyNetwork,YOCTO,evidence} from '../packages/client/src/index.ts';
await verifyNetwork();
const id=`docs-${randomBytes(16).toString('hex')}.testnet`;
const key=keys(id);
const response=await fetch('https://helper.testnet.near.org/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({newAccountId:id,newAccountPublicKey:key.public_key})});
if(!response.ok)throw Error(`Faucet rejected request: ${response.status} ${await response.text()}`);
evidence('faucet',{account:id,response:await response.text(),timestamp:new Date().toISOString()});
await transaction(account(id),project().parent,[actions.transfer(5n*YOCTO)],'faucet-fund-parent');
console.log('Faucet: transferred 5 test NEAR to project parent. Temporary account retained.');
