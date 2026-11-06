use near_contract_standards::fungible_token::{
    FungibleToken,
    core::FungibleTokenCore,
    events::FtMint,
    metadata::{FT_METADATA_SPEC, FungibleTokenMetadata, FungibleTokenMetadataProvider},
    resolver::FungibleTokenResolver,
};
use near_contract_standards::storage_management::{
    StorageBalance, StorageBalanceBounds, StorageManagement,
};
use near_sdk::json_types::U128;
use near_sdk::{AccountId, PanicOnDefault, PromiseOrValue, env, near, require};
#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct TestToken {
    token: FungibleToken,
}
#[near]
impl TestToken {
    #[init]
    pub fn new() -> Self {
        Self {
            token: FungibleToken::new(b"t"),
        }
    }
    pub fn faucet(&mut self, amount: U128) {
        require!(
            amount.0 > 0 && amount.0 <= 1_000_000_000,
            "ERR_FAUCET_LIMIT"
        );
        let caller = env::predecessor_account_id();
        require!(
            self.token.storage_balance_of(caller.clone()).is_some(),
            "ERR_STORAGE"
        );
        self.token.internal_deposit(&caller, amount.0);
        FtMint {
            owner_id: &caller,
            amount,
            memo: Some("TEST ONLY - no value"),
        }
        .emit();
    }
}
#[near]
impl FungibleTokenCore for TestToken {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        self.token.ft_transfer(receiver_id, amount, memo)
    }
    #[payable]
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128> {
        self.token.ft_transfer_call(receiver_id, amount, memo, msg)
    }
    fn ft_total_supply(&self) -> U128 {
        self.token.ft_total_supply()
    }
    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        self.token.ft_balance_of(account_id)
    }
}
#[near]
impl FungibleTokenResolver for TestToken {
    #[private]
    fn ft_resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) -> U128 {
        self.token
            .internal_ft_resolve_transfer(&sender_id, receiver_id, amount)
            .0
            .into()
    }
}
#[near]
impl StorageManagement for TestToken {
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        self.token.storage_deposit(account_id, registration_only)
    }
    #[payable]
    fn storage_withdraw(&mut self, amount: Option<near_sdk::NearToken>) -> StorageBalance {
        self.token.storage_withdraw(amount)
    }
    #[payable]
    fn storage_unregister(&mut self, force: Option<bool>) -> bool {
        self.token.internal_storage_unregister(force).is_some()
    }
    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        self.token.storage_balance_bounds()
    }
    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.token.storage_balance_of(account_id)
    }
}
#[near]
impl FungibleTokenMetadataProvider for TestToken {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.into(),
            name: "Untangle Test USD (TEST ONLY – no value)".into(),
            symbol: "tUSD".into(),
            icon: None,
            reference: None,
            reference_hash: None,
            decimals: 6,
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::{NearToken, test_utils::VMContextBuilder, testing_env};
    fn setup() -> TestToken {
        let mut b = VMContextBuilder::new();
        b.predecessor_account_id("alice.testnet".parse().unwrap())
            .attached_deposit(NearToken::from_near(1));
        testing_env!(b.build());
        let mut t = TestToken::new();
        t.storage_deposit(None, None);
        t
    }
    #[test]
    fn mint_and_metadata() {
        let mut t = setup();
        t.faucet(U128(1_000_000_000));
        assert_eq!(t.ft_total_supply().0, 1_000_000_000);
        assert_eq!(t.ft_metadata().decimals, 6);
        assert!(t.ft_metadata().name.contains("TEST ONLY"));
    }
    #[test]
    #[should_panic(expected = "ERR_FAUCET_LIMIT")]
    fn capped() {
        let mut t = setup();
        t.faucet(U128(1_000_000_001));
    }
}
