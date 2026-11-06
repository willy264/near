use near_workspaces::{Account,Contract,AccessKey,types::{NearToken,SecretKey,KeyType,Gas}};
use serde_json::{json,Value};
use anyhow::Result;
async fn call(a:&Account,c:&Contract,m:&str,args:Value,deposit:u128)->Result<Value>{let result=a.call(c.id(),m).args_json(args).deposit(NearToken::from_yoctonear(deposit)).gas(Gas::from_tgas(100)).transact().await?.into_result()?;let bytes=result.raw_bytes()?;if bytes.is_empty(){Ok(Value::Null)}else{Ok(serde_json::from_slice(&bytes)?)} }
async fn view(c:&Contract,m:&str,args:Value)->Result<Value>{Ok(c.view(m).args_json(args).await?.json()?)}
async fn issue(c:&Contract,t:&Contract,creditor:&Account,debtor:&Account,n:u128)->Result<String>{let value=call(creditor,c,"issue",json!({"debtor":debtor.id(),"token":t.id(),"amount":n.to_string(),"memo":null}),0).await?;Ok(value.as_str().unwrap().to_owned())}
async fn accept(c:&Contract,d:&Account,id:&str)->Result<()>{call(d,c,"accept",json!({"id":id}),0).await?;Ok(())}
async fn snapshot(c:&Contract,t:&Contract,accounts:&[&Account])->Result<Value>{let mut rows=vec![];for a in accounts{rows.push(json!({"net":view(c,"net_position",json!({"account":a.id(),"token":t.id()})).await?,"debts":view(c,"list_by_account",json!({"account":a.id(),"from_index":"0","limit":200})).await?,"withdrawable":view(c,"withdrawable",json!({"account":a.id(),"token":t.id()})).await?,"storage":view(c,"storage_balance_of",json!({"account_id":a.id()})).await?}));}Ok(json!({"stats":view(c,"stats",json!({"token":t.id()})).await?,"accounts":rows}))}
async fn pay(t:&Contract,c:&Contract,a:&Account,id:&str,n:u128)->Result<()> {call(a,t,"ft_transfer_call",json!({"receiver_id":c.id(),"amount":n.to_string(),"msg":json!({"obligation_id":id}).to_string(),"memo":null}),1).await?;Ok(())}
#[tokio::test]
async fn sandbox_clearing_settlement_rollback_and_keys()->Result<()> {
 let worker=near_workspaces::sandbox().await?;
 let base=std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../target/near");
 let ledger=worker.dev_deploy(&std::fs::read(base.join("untangle/untangle.wasm"))?).await?;
 let token=worker.dev_deploy(&std::fs::read(base.join("untangle_test_token/untangle_test_token.wasm"))?).await?;
 token.call("new").args_json(json!({})).transact().await?.into_result()?;
 ledger.call("new").args_json(json!({"owner":ledger.id(),"tokens":[token.id()],"config":{"max_cycle_len":12,"max_cycles_per_batch":20,"max_memo_bytes":128,"max_batch_issue":20}})).transact().await?.into_result()?;
 let alice=worker.dev_create_account().await?;let bob=worker.dev_create_account().await?;let carol=worker.dev_create_account().await?;let solver=worker.dev_create_account().await?;
 let accounts=[&alice,&bob,&carol,&solver];
 for a in accounts {call(a,&ledger,"storage_deposit",json!({"account_id":null}),NearToken::from_near(2).as_yoctonear()).await?;call(a,&ledger,"set_debt_cap",json!({"token":token.id(),"max":"10000"}),1).await?;call(a,&token,"storage_deposit",json!({"account_id":null,"registration_only":true}),NearToken::from_near(1).as_yoctonear()).await?;call(a,&token,"faucet",json!({"amount":"1000"}),0).await?;}
 call(&alice,&token,"storage_deposit",json!({"account_id":ledger.id(),"registration_only":true}),NearToken::from_near(1).as_yoctonear()).await?;
 let x=issue(&ledger,&token,&bob,&alice,10).await?;accept(&ledger,&alice,&x).await?;
 let y=issue(&ledger,&token,&carol,&bob,15).await?;accept(&ledger,&bob,&y).await?;
 let z=issue(&ledger,&token,&alice,&carol,20).await?;accept(&ledger,&carol,&z).await?;
 let before=snapshot(&ledger,&token,&accounts).await?;
 let invalid=json!({"batch":{"token":token.id(),"cycles":[{"ids":[x,y,z],"amount":"5"},{"ids":[x,y],"amount":"1"}]}});
 assert!(solver.call(ledger.id(),"submit_clearing").args_json(invalid).gas(Gas::from_tgas(100)).transact().await?.is_failure());assert_eq!(snapshot(&ledger,&token,&accounts).await?,before);
 let pending=issue(&ledger,&token,&alice,&bob,3).await?;let before=snapshot(&ledger,&token,&accounts).await?;
 assert!(bob.call(ledger.id(),"accept_many").args_json(json!({"ids":[pending,"9999"]})).gas(Gas::from_tgas(100)).transact().await?.is_failure());assert_eq!(snapshot(&ledger,&token,&accounts).await?,before);
 let huge=issue(&ledger,&token,&alice,&bob,10001).await?;let before=snapshot(&ledger,&token,&accounts).await?;
 assert!(bob.call(ledger.id(),"accept").args_json(json!({"id":huge})).transact().await?.is_failure());assert_eq!(snapshot(&ledger,&token,&accounts).await?,before);
 let keys=SecretKey::from_random(KeyType::ED25519);bob.batch(bob.id()).add_key(keys.public_key(),AccessKey::function_call_access(ledger.id(),&["issue","issue_many","accept","accept_many","reject","cancel"],Some(NearToken::from_millinear(250)))).transact().await?.into_result()?;
 let mut agent=bob.clone();agent.set_secret_key(keys);accept(&ledger,&agent,&pending).await?;let _=issue(&ledger,&token,&agent,&alice,2).await?;
 for (target,method,args,deposit) in [(&ledger,"set_debt_cap",json!({"token":token.id(),"max":"100"}),1),(&ledger,"withdraw",json!({"token":token.id(),"amount":null}),1),(&ledger,"storage_deposit",json!({"account_id":null}),1),(&token,"ft_transfer_call",json!({"receiver_id":ledger.id(),"amount":"1","msg":"{}","memo":null}),1)] {let r=agent.call(target.id(),method).args_json(args).deposit(NearToken::from_yoctonear(deposit)).transact().await;assert!(r.is_err()||r.unwrap().is_failure(),"restricted key unexpectedly succeeded: {method}");}
 let send_near=agent.transfer_near(alice.id(),NearToken::from_yoctonear(1)).await;
 assert!(send_near.is_err()||send_near.unwrap().is_failure());
 assert!(alice.call(ledger.id(),"ft_on_transfer").args_json(json!({"sender_id":alice.id(),"amount":"1","msg":"{}"})).transact().await?.is_failure());
 let alice_before=view(&token,"ft_balance_of",json!({"account_id":alice.id()})).await?;
 call(&alice,&token,"ft_transfer_call",json!({"receiver_id":ledger.id(),"amount":"3","msg":"invalid json","memo":null}),1).await?;
 assert_eq!(view(&token,"ft_balance_of",json!({"account_id":alice.id()})).await?,alice_before);
 let other=worker.dev_deploy(&std::fs::read(base.join("untangle_test_token/untangle_test_token.wasm"))?).await?;
 other.call("new").args_json(json!({})).transact().await?.into_result()?;
 call(ledger.as_account(),&ledger,"add_token",json!({"token":other.id()}),1).await?;
 for account_id in [alice.id(),ledger.id()]{call(&alice,&other,"storage_deposit",json!({"account_id":account_id,"registration_only":true}),NearToken::from_near(1).as_yoctonear()).await?;}
 call(&alice,&other,"faucet",json!({"amount":"10"}),0).await?;
 pay(&other,&ledger,&alice,&x,5).await?;
 assert_eq!(view(&other,"ft_balance_of",json!({"account_id":alice.id()})).await?,"10");
 let result=call(&solver,&ledger,"submit_clearing",json!({"batch":{"token":token.id(),"cycles":[{"ids":[x,y,z],"amount":"10"}]}}),0).await?;assert_eq!(result["total_reduced"],"30");
 let b0=view(&token,"ft_balance_of",json!({"account_id":bob.id()})).await?;
 pay(&token,&ledger,&alice,&y,2).await?;assert_eq!(view(&token,"ft_balance_of",json!({"account_id":bob.id()})).await?,b0);
 pay(&token,&ledger,&bob,&y,2).await?;assert_eq!(view(&ledger,"get_obligation",json!({"id":y})).await?["remaining"],"3");
 pay(&token,&ledger,&bob,&y,8).await?;assert!(view(&ledger,"get_obligation",json!({"id":y})).await?.is_null());
 assert_eq!(view(&token,"ft_balance_of",json!({"account_id":bob.id()})).await?,"995");
 pay(&token,&ledger,&carol,&z,10).await?;
 call(&carol,&token,"storage_unregister",json!({"force":true}),1).await?;
 call(&carol,&ledger,"withdraw",json!({"token":token.id(),"amount":null}),1).await?;
 assert_eq!(view(&ledger,"withdrawable",json!({"account":carol.id(),"token":token.id()})).await?,"5");
 call(&carol,&token,"storage_deposit",json!({"account_id":null,"registration_only":true}),NearToken::from_near(1).as_yoctonear()).await?;
 call(&carol,&ledger,"withdraw",json!({"token":token.id(),"amount":null}),1).await?;
 assert_eq!(view(&token,"ft_balance_of",json!({"account_id":carol.id()})).await?,"5");
 assert!(alice.call(ledger.id(),"withdraw").args_json(json!({"token":token.id(),"amount":null})).transact().await?.is_failure());
 let mut sum=0u128;for a in accounts{sum+=view(&ledger,"withdrawable",json!({"account":a.id(),"token":token.id()})).await?.as_str().unwrap().parse::<u128>()?;}
 assert_eq!(view(&token,"ft_balance_of",json!({"account_id":ledger.id()})).await?.as_str().unwrap().parse::<u128>()?,sum);
 println!("sandbox: full flow, rollback, partial/excess/exact payments, withdrawal failure restoration, scoped keys, custody verified");Ok(())
}


