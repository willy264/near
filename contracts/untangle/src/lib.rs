pub mod errors;
use near_sdk::json_types::{U64, U128};
use near_sdk::serde_json::{self, json};
use near_sdk::store::{IterableMap, IterableSet, LookupMap};
use near_sdk::{
    AccountId, BorshStorageKey, Gas, NearToken, PanicOnDefault, Promise, PromiseOrValue,
    assert_one_yocto, env, near, require,
};
use std::collections::{BTreeMap, BTreeSet};

pub const OBLIGATION_STORAGE_FEE: u128 = 40_000_000_000_000_000_000_000;
pub const REGISTRATION_MIN: u128 = 40_000_000_000_000_000_000_000;
#[derive(BorshStorageKey)]
#[near(serializers=[borsh])]
enum Key {
    Obligations,
    Accounts,
    Tokens,
    Stats,
    Solvers,
    Pairs,
    Storage,
    Open,
    ByAccount,
    OpenSet(AccountId),
    AccountSet(AccountId),
    BucketCount,
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Debug, PartialEq)]
pub enum Status {
    Issued,
    Accepted,
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Debug)]
pub struct Obligation {
    pub id: U64,
    pub creditor: AccountId,
    pub debtor: AccountId,
    pub token: AccountId,
    pub amount: U128,
    pub remaining: U128,
    pub status: Status,
    pub memo: String,
    pub created_ms: U64,
    pub storage_payer: AccountId,
    pub storage_fee: U128,
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Default, Debug)]
pub struct TokenStats {
    pub accepted_total: U128,
    pub cleared_total: U128,
    pub settled_total: U128,
    pub outstanding_total: U128,
    pub open_count: U64,
    pub closed_by_clearing: U64,
    pub closed_by_payment: U64,
    pub clearing_batches: U64,
    pub cycles_cleared: U64,
    pub payments: U64,
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Debug)]
pub struct Config {
    pub max_cycle_len: u8,
    pub max_cycles_per_batch: u16,
    pub max_memo_bytes: u16,
    pub max_batch_issue: u16,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            max_cycle_len: 12,
            max_cycles_per_batch: 20,
            max_memo_bytes: 128,
            max_batch_issue: 20,
        }
    }
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Default)]
struct Account {
    payable: u128,
    receivable: u128,
    cap: Option<u128>,
    withdrawable: u128,
}
#[near(serializers=[json,borsh])]
#[derive(Clone, Default)]
struct Pair {
    exposure: u128,
    limit: Option<u128>,
}
#[near(serializers=[json])]
pub struct IssueArgs {
    pub debtor: AccountId,
    pub token: AccountId,
    pub amount: U128,
    pub memo: Option<String>,
}
#[near(serializers=[json])]
#[derive(Clone)]
pub struct Cycle {
    pub ids: Vec<U64>,
    pub amount: U128,
}
#[near(serializers=[json])]
pub struct ClearingBatch {
    pub token: AccountId,
    pub cycles: Vec<Cycle>,
}
#[near(serializers=[json])]
pub struct ClearingResult {
    pub total_reduced: U128,
    pub cycles: u32,
    pub closed: Vec<U64>,
}
#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    next_id: u64,
    obligations: IterableMap<u64, Obligation>,
    accounts: LookupMap<(AccountId, AccountId), Account>,
    tokens: IterableSet<AccountId>,
    stats: LookupMap<AccountId, TokenStats>,
    solvers: IterableMap<(AccountId, AccountId), u128>,
    pairs: LookupMap<(AccountId, AccountId, AccountId), Pair>,
    storage: LookupMap<AccountId, u128>,
    open: LookupMap<AccountId, IterableSet<u64>>,
    by_account: LookupMap<AccountId, IterableSet<u64>>,
    bucket_count: LookupMap<AccountId, u32>,
    config: Config,
}
fn add(a: u128, b: u128) -> u128 {
    a.checked_add(b).expect("ERR_OVERFLOW")
}
fn sub(a: u128, b: u128) -> u128 {
    a.checked_sub(b).expect("ERR_INSUFFICIENT")
}
fn event(name: &str, data: serde_json::Value) {
    env::log_str(&format!(
        "EVENT_JSON:{}",
        json!({"standard":"untangle","version":"1.0.0","event":name,"data":[data]})
    ));
}
impl Contract {
    fn token(&self, t: &AccountId) {
        require!(self.tokens.contains(t), "ERR_TOKEN_NOT_ACCEPTED");
    }
    fn account(&self, a: &AccountId, t: &AccountId) -> Account {
        {
            require!(self.storage.contains_key(a), "ERR_STORAGE");
            self.accounts
                .get(&(a.clone(), t.clone()))
                .cloned()
                .unwrap_or_default()
        }
    }
    fn save(&mut self, a: &AccountId, t: &AccountId, v: Account) {
        if !self.accounts.contains_key(&(a.clone(), t.clone())) {
            let count = self.bucket_count.get(a).copied().unwrap_or(0);
            if count > 0 {
                let free = self.storage.get(a).copied().expect("ERR_STORAGE");
                require!(free >= REGISTRATION_MIN, "ERR_STORAGE");
                self.storage.insert(a.clone(), free - REGISTRATION_MIN);
            }
            self.bucket_count
                .insert(a.clone(), count.checked_add(1).expect("ERR_OVERFLOW"));
        }
        self.accounts.insert((a.clone(), t.clone()), v);
    }
    fn pair_key(o: &Obligation) -> (AccountId, AccountId, AccountId) {
        (o.creditor.clone(), o.debtor.clone(), o.token.clone())
    }
    fn delete(&mut self, o: &Obligation) {
        self.obligations.remove(&o.id.0);
        if let Some(set) = self.open.get_mut(&o.token) {
            set.remove(&o.id.0);
        }
        for account in [&o.creditor, &o.debtor] {
            let empty = if let Some(set) = self.by_account.get_mut(account) {
                set.remove(&o.id.0);
                set.flush();
                set.is_empty()
            } else {
                false
            };
            if empty {
                self.by_account.remove(account);
            }
        }
        let balance = self
            .storage
            .get(&o.storage_payer)
            .copied()
            .expect("ERR_STORAGE");
        self.storage
            .insert(o.storage_payer.clone(), add(balance, o.storage_fee.0));
    }
    fn reduce(&mut self, o: &mut Obligation, n: u128) {
        o.remaining.0 = sub(o.remaining.0, n);
        let mut d = self.account(&o.debtor, &o.token);
        let mut c = self.account(&o.creditor, &o.token);
        d.payable = sub(d.payable, n);
        c.receivable = sub(c.receivable, n);
        self.save(&o.debtor, &o.token, d);
        self.save(&o.creditor, &o.token, c);
        let k = Self::pair_key(o);
        let mut p = self.pairs.get(&k).cloned().unwrap_or_default();
        p.exposure = sub(p.exposure, n);
        if p.exposure == 0 && p.limit.is_none() {
            self.pairs.remove(&k);
        } else {
            self.pairs.insert(k, p);
        }
    }
    fn validate_config(c: &Config) {
        require!(
            (2..=16).contains(&c.max_cycle_len)
                && (1..=40).contains(&c.max_cycles_per_batch)
                && (1..=40).contains(&c.max_batch_issue)
                && c.max_memo_bytes <= 128,
            "ERR_CONFIG"
        );
    }
    fn owner(&self) {
        assert_one_yocto();
        require!(env::predecessor_account_id() == self.owner, "ERR_OWNER");
    }
}
#[near]
impl Contract {
    #[init]
    pub fn new(owner: AccountId, tokens: Vec<AccountId>, config: Config) -> Self {
        Self::validate_config(&config);
        require!(!tokens.is_empty(), "ERR_TOKEN_NOT_ACCEPTED");
        let mut s = Self {
            owner,
            next_id: 0,
            obligations: IterableMap::new(Key::Obligations),
            accounts: LookupMap::new(Key::Accounts),
            tokens: IterableSet::new(Key::Tokens),
            stats: LookupMap::new(Key::Stats),
            solvers: IterableMap::new(Key::Solvers),
            pairs: LookupMap::new(Key::Pairs),
            storage: LookupMap::new(Key::Storage),
            open: LookupMap::new(Key::Open),
            by_account: LookupMap::new(Key::ByAccount),
            bucket_count: LookupMap::new(Key::BucketCount),
            config,
        };
        for t in tokens {
            s.tokens.insert(t);
        }
        s
    }
    #[payable]
    pub fn add_token(&mut self, token: AccountId) {
        self.owner();
        self.tokens.insert(token);
    }
    #[payable]
    pub fn set_config(&mut self, config: Config) {
        self.owner();
        Self::validate_config(&config);
        self.config = config;
    }
    #[payable]
    pub fn storage_deposit(&mut self, account_id: Option<AccountId>) -> serde_json::Value {
        let who = account_id.unwrap_or_else(env::predecessor_account_id);
        let n = env::attached_deposit().as_yoctonear();
        require!(n > 0, "ERR_STORAGE");
        let old = self.storage.get(&who).copied();
        let locked = if old.is_some() { 0 } else { REGISTRATION_MIN };
        require!(n >= locked, "ERR_STORAGE");
        self.storage
            .insert(who.clone(), add(old.unwrap_or(0), n - locked));
        self.storage_balance_of(who).unwrap()
    }
    pub fn storage_balance_bounds(&self) -> serde_json::Value {
        json!({"min":U128(REGISTRATION_MIN),"max":null})
    }
    pub fn storage_balance_of(&self, account_id: AccountId) -> Option<serde_json::Value> {
        self.storage
            .get(&account_id)
            .map(|free| json!({"total":U128(add(*free,REGISTRATION_MIN)),"available":U128(*free)}))
    }
    #[payable]
    pub fn storage_withdraw(&mut self, amount: Option<U128>) -> Promise {
        assert_one_yocto();
        let caller = env::predecessor_account_id();
        let free = self.storage.get(&caller).copied().expect("ERR_STORAGE");
        let n = amount.map(|x| x.0).unwrap_or(free);
        self.storage.insert(caller.clone(), sub(free, n));
        Promise::new(caller).transfer(NearToken::from_yoctonear(n))
    }
    #[payable]
    pub fn set_debt_cap(&mut self, token: AccountId, max: U128) {
        assert_one_yocto();
        self.token(&token);
        let who = env::predecessor_account_id();
        let mut a = self.account(&who, &token);
        require!(max.0 >= a.payable, "ERR_DEBT_CAP");
        a.cap = Some(max.0);
        self.save(&who, &token, a);
        event(
            "debt_cap_set",
            json!({"account":who,"token":token,"max":max}),
        );
    }
    #[payable]
    pub fn set_pair_limit(&mut self, debtor: AccountId, token: AccountId, max: Option<U128>) {
        assert_one_yocto();
        self.token(&token);
        let c = env::predecessor_account_id();
        self.account(&c, &token);
        let k = (c.clone(), debtor.clone(), token.clone());
        let mut p = self.pairs.get(&k).cloned().unwrap_or_default();
        let free = self.storage.get(&c).copied().expect("ERR_STORAGE");
        if p.limit.is_none() && max.is_some() {
            require!(free >= OBLIGATION_STORAGE_FEE, "ERR_STORAGE");
            self.storage
                .insert(c.clone(), free - OBLIGATION_STORAGE_FEE);
        } else if p.limit.is_some() && max.is_none() {
            self.storage
                .insert(c.clone(), add(free, OBLIGATION_STORAGE_FEE));
        }
        p.limit = max.map(|x| x.0);
        if p.exposure == 0 && p.limit.is_none() {
            self.pairs.remove(&k);
        } else {
            self.pairs.insert(k, p);
        }
        event(
            "pair_limit_set",
            json!({"creditor":c,"debtor":debtor,"token":token,"max":max}),
        );
    }
    pub fn issue(
        &mut self,
        debtor: AccountId,
        token: AccountId,
        amount: U128,
        memo: Option<String>,
    ) -> U64 {
        let creditor = env::predecessor_account_id();
        require!(creditor != debtor, "ERR_SELF_DEBT");
        require!(amount.0 > 0, "ERR_AMOUNT_ZERO");
        self.token(&token);
        let memo = memo.unwrap_or_default();
        require!(
            memo.len() <= self.config.max_memo_bytes as usize,
            "ERR_MEMO"
        );
        let free = self.storage.get(&creditor).copied().expect("ERR_STORAGE");
        require!(free >= OBLIGATION_STORAGE_FEE, "ERR_STORAGE");
        let id = self.next_id;
        self.next_id = self.next_id.checked_add(1).expect("ERR_OVERFLOW");
        let o = Obligation {
            id: U64(id),
            creditor: creditor.clone(),
            debtor,
            token: token.clone(),
            amount,
            remaining: amount,
            status: Status::Issued,
            memo,
            created_ms: U64(env::block_timestamp_ms()),
            storage_payer: creditor.clone(),
            storage_fee: U128(OBLIGATION_STORAGE_FEE),
        };
        event("obligation_issued", json!(o));
        for account in [&o.creditor, &o.debtor] {
            if !self.by_account.contains_key(account) {
                self.by_account.insert(
                    account.clone(),
                    IterableSet::new(Key::AccountSet(account.clone())),
                );
            }
            self.by_account.get_mut(account).unwrap().insert(id);
        }
        self.obligations.insert(id, o);
        self.storage.insert(creditor, free - OBLIGATION_STORAGE_FEE);
        U64(id)
    }
    pub fn issue_many(&mut self, items: Vec<IssueArgs>) -> Vec<U64> {
        require!(
            !items.is_empty() && items.len() <= self.config.max_batch_issue as usize,
            "ERR_BATCH_SIZE"
        );
        items
            .into_iter()
            .map(|i| self.issue(i.debtor, i.token, i.amount, i.memo))
            .collect()
    }
    pub fn accept(&mut self, id: U64) {
        let mut o = self.obligations.get(&id.0).cloned().expect("ERR_NOT_FOUND");
        require!(env::predecessor_account_id() == o.debtor, "ERR_NOT_DEBTOR");
        require!(o.status == Status::Issued, "ERR_STATUS");
        let mut d = self.account(&o.debtor, &o.token);
        let cap = d.cap.expect("ERR_NO_DEBT_CAP");
        require!(add(d.payable, o.amount.0) <= cap, "ERR_DEBT_CAP");
        let k = Self::pair_key(&o);
        let mut p = self.pairs.get(&k).cloned().unwrap_or_default();
        let exposure = add(p.exposure, o.amount.0);
        if let Some(l) = p.limit {
            require!(exposure <= l, "ERR_PAIR_LIMIT");
        }
        let mut c = self.account(&o.creditor, &o.token);
        d.payable = add(d.payable, o.amount.0);
        c.receivable = add(c.receivable, o.amount.0);
        p.exposure = exposure;
        self.save(&o.debtor, &o.token, d);
        self.save(&o.creditor, &o.token, c);
        self.pairs.insert(k, p);
        o.status = Status::Accepted;
        if !self.open.contains_key(&o.token) {
            self.open.insert(
                o.token.clone(),
                IterableSet::new(Key::OpenSet(o.token.clone())),
            );
        }
        self.open.get_mut(&o.token).unwrap().insert(id.0);
        self.obligations.insert(id.0, o.clone());
        let mut s = self.stats.get(&o.token).cloned().unwrap_or_default();
        s.accepted_total.0 = add(s.accepted_total.0, o.amount.0);
        s.outstanding_total.0 = add(s.outstanding_total.0, o.amount.0);
        s.open_count.0 = s.open_count.0.checked_add(1).unwrap();
        self.stats.insert(o.token.clone(), s);
        event("obligation_accepted", json!(o));
    }
    pub fn accept_many(&mut self, ids: Vec<U64>) {
        require!(
            !ids.is_empty() && ids.len() <= self.config.max_batch_issue as usize,
            "ERR_BATCH_SIZE"
        );
        for id in ids {
            self.accept(id);
        }
    }
    pub fn reject(&mut self, id: U64) {
        let o = self.obligations.get(&id.0).cloned().expect("ERR_NOT_FOUND");
        require!(env::predecessor_account_id() == o.debtor, "ERR_NOT_DEBTOR");
        require!(o.status == Status::Issued, "ERR_STATUS");
        self.delete(&o);
        event("obligation_rejected", json!(o));
    }
    pub fn cancel(&mut self, id: U64) {
        let o = self.obligations.get(&id.0).cloned().expect("ERR_NOT_FOUND");
        require!(
            env::predecessor_account_id() == o.creditor,
            "ERR_NOT_CREDITOR"
        );
        require!(o.status == Status::Issued, "ERR_STATUS");
        self.delete(&o);
        event("obligation_cancelled", json!(o));
    }
    pub fn submit_clearing(&mut self, batch: ClearingBatch) -> ClearingResult {
        self.token(&batch.token);
        require!(
            !batch.cycles.is_empty()
                && batch.cycles.len() <= self.config.max_cycles_per_batch as usize,
            "ERR_BATCH_SIZE"
        );
        let mut left = BTreeMap::new();
        for (index, cycle) in batch.cycles.iter().enumerate() {
            let fail = |code: &str, id: u64| -> ! {
                env::panic_str(&format!("{code} cycle={index} id={id}"))
            };
            if cycle.ids.len() < 2 || cycle.ids.len() > self.config.max_cycle_len as usize {
                fail("ERR_CYCLE_LEN", 0)
            }
            if cycle.amount.0 == 0 {
                fail("ERR_AMOUNT_ZERO", 0)
            }
            let mut seen = BTreeSet::new();
            let mut edges = Vec::new();
            for id in &cycle.ids {
                if !seen.insert(id.0) {
                    fail("ERR_DUP_ID", id.0)
                }
                let o = self
                    .obligations
                    .get(&id.0)
                    .unwrap_or_else(|| fail("ERR_NOT_FOUND", id.0));
                if o.status != Status::Accepted {
                    fail("ERR_NOT_ACCEPTED", id.0)
                }
                if o.token != batch.token {
                    fail("ERR_TOKEN_MISMATCH", id.0)
                }
                edges.push(o);
                let v = left.entry(id.0).or_insert(o.remaining.0);
                if cycle.amount.0 > *v {
                    fail("ERR_OVER_REMAINING", id.0)
                }
                *v -= cycle.amount.0;
            }
            for i in 0..edges.len() {
                if edges[i].creditor != edges[(i + 1) % edges.len()].debtor {
                    fail("ERR_BROKEN_LINK", edges[i].id.0)
                }
            }
        }
        let solver = env::predecessor_account_id();
        let solver_key = (batch.token.clone(), solver.clone());
        if !self.solvers.contains_key(&solver_key) {
            let free = self.storage.get(&solver).copied().expect("ERR_STORAGE");
            require!(free >= OBLIGATION_STORAGE_FEE, "ERR_STORAGE");
            self.storage
                .insert(solver.clone(), free - OBLIGATION_STORAGE_FEE);
        }
        let mut total = 0;
        let mut closed = vec![];
        for (id, n) in left {
            let mut o = self.obligations.get(&id).unwrap().clone();
            let reduction = sub(o.remaining.0, n);
            total = add(total, reduction);
            self.reduce(&mut o, reduction);
            if n == 0 {
                closed.push(U64(id));
                self.delete(&o);
            } else {
                self.obligations.insert(id, o);
            }
        }
        let mut s = self.stats.get(&batch.token).cloned().unwrap_or_default();
        s.cleared_total.0 = add(s.cleared_total.0, total);
        s.outstanding_total.0 = sub(s.outstanding_total.0, total);
        s.open_count.0 -= closed.len() as u64;
        s.closed_by_clearing.0 += closed.len() as u64;
        s.cycles_cleared.0 += batch.cycles.len() as u64;
        s.clearing_batches.0 += 1;
        self.stats.insert(batch.token.clone(), s);
        let solver = env::predecessor_account_id();
        let k = (batch.token.clone(), solver.clone());
        let score = add(self.solvers.get(&k).copied().unwrap_or(0), total);
        self.solvers.insert(k, score);
        event(
            "cycles_cleared",
            json!({"solver":solver,"token":batch.token,"cycles":batch.cycles,"total_reduced":U128(total),"closed_ids":closed}),
        );
        ClearingResult {
            total_reduced: U128(total),
            cycles: batch.cycles.len() as u32,
            closed,
        }
    }
    pub fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let token = env::predecessor_account_id();
        self.token(&token);
        #[derive(near_sdk::serde::Deserialize)]
        #[serde(crate = "near_sdk::serde")]
        struct Msg {
            obligation_id: U64,
        }
        let Ok(m) = serde_json::from_str::<Msg>(&msg) else {
            return PromiseOrValue::Value(amount);
        };
        let Some(mut o) = self.obligations.get(&m.obligation_id.0).cloned() else {
            return PromiseOrValue::Value(amount);
        };
        if o.status != Status::Accepted
            || o.token != token
            || o.debtor != sender_id
            || amount.0 == 0
        {
            return PromiseOrValue::Value(amount);
        }
        let paid = amount.0.min(o.remaining.0);
        self.reduce(&mut o, paid);
        let mut c = self.account(&o.creditor, &token);
        c.withdrawable = add(c.withdrawable, paid);
        self.save(&o.creditor, &token, c);
        let mut s = self.stats.get(&token).cloned().unwrap_or_default();
        s.settled_total.0 = add(s.settled_total.0, paid);
        s.outstanding_total.0 = sub(s.outstanding_total.0, paid);
        s.payments.0 += 1;
        if o.remaining.0 == 0 {
            self.delete(&o);
            s.open_count.0 -= 1;
            s.closed_by_payment.0 += 1;
        } else {
            self.obligations.insert(o.id.0, o.clone());
        }
        self.stats.insert(token.clone(), s);
        event(
            "obligation_settled",
            json!({"id":o.id,"payer":sender_id,"creditor":o.creditor,"token":token,"paid":U128(paid),"remaining":o.remaining}),
        );
        PromiseOrValue::Value(U128(amount.0 - paid))
    }
    #[payable]
    pub fn withdraw(&mut self, token: AccountId, amount: Option<U128>) -> Promise {
        assert_one_yocto();
        self.token(&token);
        let who = env::predecessor_account_id();
        let mut a = self.account(&who, &token);
        let n = amount.map(|v| v.0).unwrap_or(a.withdrawable);
        require!(n > 0 && n <= a.withdrawable, "ERR_INSUFFICIENT");
        a.withdrawable -= n;
        self.save(&who, &token, a);
        Promise::new(token.clone())
            .function_call(
                "ft_transfer",
                json!({"receiver_id":who,"amount":U128(n)})
                    .to_string()
                    .into_bytes(),
                NearToken::from_yoctonear(1),
                Gas::from_tgas(20),
            )
            .then(
                Promise::new(env::current_account_id()).function_call(
                    "on_withdraw",
                    json!({"account":who,"token":token,"amount":U128(n)})
                        .to_string()
                        .into_bytes(),
                    NearToken::from_yoctonear(0),
                    Gas::from_tgas(20),
                ),
            )
    }
    #[private]
    pub fn on_withdraw(&mut self, account: AccountId, token: AccountId, amount: U128) -> bool {
        require!(env::promise_results_count() == 1, "ERR_CALLBACK");
        // A successful transfer with oversized return data is still a successful transfer.
        // Restoring credit for TooLong would permit a double withdrawal.
        let ok = !matches!(
            env::promise_result_checked(0, 32),
            Err(near_sdk::PromiseError::Failed)
        );
        if !ok {
            let mut a = self.account(&account, &token);
            a.withdrawable = add(a.withdrawable, amount.0);
            self.save(&account, &token, a);
        }
        event(
            if ok { "withdrawn" } else { "withdraw_failed" },
            json!({"account":account,"token":token,"amount":amount}),
        );
        ok
    }
    pub fn get_obligation(&self, id: U64) -> Option<Obligation> {
        self.obligations.get(&id.0).cloned()
    }
    pub fn get_config(&self) -> Config {
        self.config.clone()
    }
    pub fn get_tokens(&self) -> Vec<AccountId> {
        self.tokens.iter().cloned().collect()
    }
    pub fn list_open(&self, token: AccountId, from_index: U64, limit: u16) -> Vec<Obligation> {
        require!(limit <= 200, "ERR_BATCH_SIZE");
        self.open
            .get(&token)
            .into_iter()
            .flat_map(|s| s.iter())
            .skip(from_index.0 as usize)
            .take(limit as usize)
            .filter_map(|id| self.obligations.get(id).cloned())
            .collect()
    }
    pub fn list_by_account(
        &self,
        account: AccountId,
        from_index: U64,
        limit: u16,
    ) -> Vec<Obligation> {
        require!(limit <= 200, "ERR_BATCH_SIZE");
        self.by_account
            .get(&account)
            .into_iter()
            .flat_map(|s| s.iter())
            .skip(from_index.0 as usize)
            .take(limit as usize)
            .filter_map(|id| self.obligations.get(id).cloned())
            .collect()
    }
    pub fn net_position(&self, account: AccountId, token: AccountId) -> serde_json::Value {
        let a = self
            .accounts
            .get(&(account, token))
            .cloned()
            .unwrap_or_default();
        let net = if a.receivable >= a.payable {
            (a.receivable - a.payable).to_string()
        } else {
            format!("-{}", a.payable - a.receivable)
        };
        json!({"receivable":U128(a.receivable),"payable":U128(a.payable),"net":net})
    }
    pub fn debt_status(&self, account: AccountId, token: AccountId) -> serde_json::Value {
        let a = self
            .accounts
            .get(&(account, token))
            .cloned()
            .unwrap_or_default();
        json!({"cap":a.cap.map(U128),"payable":U128(a.payable),"headroom":U128(a.cap.unwrap_or(0).saturating_sub(a.payable))})
    }
    pub fn withdrawable(&self, account: AccountId, token: AccountId) -> U128 {
        U128(
            self.accounts
                .get(&(account, token))
                .map(|a| a.withdrawable)
                .unwrap_or(0),
        )
    }
    pub fn stats(&self, token: AccountId) -> serde_json::Value {
        let s = self.stats.get(&token).cloned().unwrap_or_default();
        let mut v = json!(s);
        let bps = if s.accepted_total.0 == 0 {
            0
        } else {
            let denominator = s.accepted_total.0;
            let mut lo = 0u128;
            let mut hi = 10000u128;
            while lo < hi {
                let mid = (lo + hi + 1) / 2;
                let threshold =
                    (denominator / 10000) * mid + ((denominator % 10000) * mid + 9999) / 10000;
                if s.cleared_total.0 >= threshold {
                    lo = mid;
                } else {
                    hi = mid - 1;
                }
            }
            lo
        };
        v["cleared_ratio_bps"] = json!(bps);
        v
    }
    pub fn solver_leaderboard(&self, token: AccountId, limit: u16) -> Vec<serde_json::Value> {
        require!(limit <= 200, "ERR_BATCH_SIZE");
        let mut scores: Vec<_> = self
            .solvers
            .iter()
            .filter(|((t, _), _)| t == &token)
            .map(|((_, s), n)| (s.clone(), *n))
            .collect();
        scores.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
        scores
            .into_iter()
            .take(limit as usize)
            .map(|(s, n)| json!({"solver":s,"cleared":U128(n)}))
            .collect()
    }
}
#[cfg(test)]
mod tests;
