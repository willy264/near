use anyhow::Result;
use near_workspaces::{Account,Contract,types::{NearToken,Gas}};
use serde_json::{json,Value};
use std::collections::BTreeMap;
async fn view(c:&Contract,m:&str,args:Value)->Result<Value>{Ok(c.view(m).args_json(args).await?.json()?)}
fn map_names(v:&mut Value,names:&BTreeMap<String,Account>){match v{Value::String(s)=>{if let Some(a)=names.get(s){*s=a.id().to_string();}},Value::Array(rows)=>for r in rows{map_names(r,names)},Value::Object(rows)=>for r in rows.values_mut(){map_names(r,names)},_=>{}}}
#[tokio::test]
async fn model_contract_parity_25_by_40()->Result<()>{
 let root=std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
 let fixture:Value=serde_json::from_slice(&std::fs::read(root.join("fixtures/parity.json"))?)?;
 let wasm=std::fs::read(root.join("contracts/target/near/untangle/untangle.wasm"))?;
 let worker=near_workspaces::sandbox().await?;
 for (sequence_index,sequence) in fixture["sequences"].as_array().unwrap().iter().enumerate(){
  let c=worker.dev_deploy(&wasm).await?;
  let mut names=BTreeMap::new();for name in ["a","b","c","solver","t"]{names.insert(name.to_string(),worker.dev_create_account().await?);}
  c.call("new").args_json(json!({"owner":c.id(),"tokens":[names["t"].id()],"config":{"max_cycle_len":12,"max_cycles_per_batch":5,"max_memo_bytes":128,"max_batch_issue":20}})).transact().await?.into_result()?;
  for name in ["a","b","c","solver"]{let a=&names[name];a.call(c.id(),"storage_deposit").args_json(json!({"account_id":null})).deposit(NearToken::from_near(4)).transact().await?.into_result()?;a.call(c.id(),"set_debt_cap").args_json(json!({"token":names["t"].id(),"max":"1000"})).deposit(NearToken::from_yoctonear(1)).transact().await?.into_result()?;}
  for (step_index,step) in sequence["steps"].as_array().unwrap().iter().enumerate(){
   let method=step["method"].as_str().unwrap();let mut args=step["args"].clone();map_names(&mut args,&names);
   let deposit=if method=="set_debt_cap"||method=="set_pair_limit"{1}else{0};
   let result=names[step["caller"].as_str().unwrap()].call(c.id(),method).args_json(args).deposit(NearToken::from_yoctonear(deposit)).gas(Gas::from_tgas(100)).transact().await?;
   if let Some(code)=step["error"].as_str(){assert!(result.is_failure(),"seq {sequence_index} step {step_index}: expected {code}");let debug=format!("{:?}",result);assert!(debug.contains(code),"seq {sequence_index} step {step_index}: expected {code}, got {debug}");}else{result.into_result()?;}
   let mut stats=view(&c,"stats",json!({"token":names["t"].id()})).await?;stats["cleared_ratio_bps"]=json!(stats["cleared_ratio_bps"].to_string());
   assert_eq!(stats,step["stats"],"stats mismatch sequence {sequence_index} step {step_index}");
   for expected in step["accounts"].as_array().unwrap(){let a=&names[expected["name"].as_str().unwrap()];let args=json!({"account":a.id(),"token":names["t"].id()});assert_eq!(view(&c,"net_position",args.clone()).await?,expected["net"],"net sequence {sequence_index} step {step_index}");assert_eq!(view(&c,"withdrawable",args).await?,expected["withdrawable"],"credit sequence {sequence_index} step {step_index}");}
  }
  println!("parity sequence {}/25: 40 operations matched",sequence_index+1);
 }
 Ok(())
}
