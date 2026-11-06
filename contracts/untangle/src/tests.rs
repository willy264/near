use super::*;
use near_sdk::PromiseResult;
use near_sdk::test_utils::VMContextBuilder;
use near_sdk::testing_env;
fn id(s: &str) -> AccountId {
    s.parse().unwrap()
}
fn context(s: &str, n: u128) {
    let mut b = VMContextBuilder::new();
    b.current_account_id(id("ledger.testnet"))
        .storage_usage(env::storage_usage())
        .predecessor_account_id(id(s))
        .signer_account_id(id(s))
        .attached_deposit(NearToken::from_yoctonear(n));
    testing_env!(b.build());
}
fn setup() -> Contract {
    context("owner.testnet", 0);
    let mut c = Contract::new(
        id("owner.testnet"),
        vec![id("token.testnet")],
        Config::default(),
    );
    for a in ["alice.testnet", "bob.testnet", "carol.testnet"] {
        context(a, 10u128.pow(25));
        c.storage_deposit(None);
        context(a, 1);
        c.set_debt_cap(id("token.testnet"), U128(10000));
    }
    c
}
fn edge(c: &mut Contract, d: &str, cr: &str, n: u128) -> U64 {
    context(cr, 0);
    let i = c.issue(id(d), id("token.testnet"), U128(n), None);
    context(d, 0);
    c.accept(i);
    i
}
#[test]
fn triangle_preserves_net_and_conserves_totals() {
    let mut c = setup();
    let a = edge(&mut c, "alice.testnet", "bob.testnet", 10);
    let b = edge(&mut c, "bob.testnet", "carol.testnet", 15);
    let d = edge(&mut c, "carol.testnet", "alice.testnet", 20);
    let before = c.net_position(id("alice.testnet"), id("token.testnet"));
    let result = c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![Cycle {
            ids: vec![a, b, d],
            amount: U128(10),
        }],
    });
    assert_eq!(result.total_reduced.0, 30);
    assert_eq!(
        c.net_position(id("alice.testnet"), id("token.testnet"))["net"],
        before["net"]
    );
    assert!(c.get_obligation(a).is_none());
    assert_eq!(c.stats(id("token.testnet"))["outstanding_total"], "15");
}
#[test]
fn settlement_credits_pull_balance_and_refunds_excess() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 10);
    context("token.testnet", 0);
    let r = c.ft_on_transfer(
        id("alice.testnet"),
        U128(17),
        json!({"obligation_id":i}).to_string(),
    );
    assert!(matches!(r, PromiseOrValue::Value(U128(7))));
    assert_eq!(c.withdrawable(id("bob.testnet"), id("token.testnet")).0, 10);
    assert!(c.get_obligation(i).is_none());
}
#[test]
#[should_panic(expected = "ERR_DEBT_CAP")]
fn cap_cannot_fall_below_payable() {
    let mut c = setup();
    edge(&mut c, "alice.testnet", "bob.testnet", 10);
    context("alice.testnet", 1);
    c.set_debt_cap(id("token.testnet"), U128(9));
}
#[test]
fn cancellation_refunds_fixed_fee() {
    let mut c = setup();
    context("alice.testnet", 0);
    let before = c.storage_balance_of(id("alice.testnet"));
    let i = c.issue(id("bob.testnet"), id("token.testnet"), U128(3), None);
    c.cancel(i);
    assert_eq!(before, c.storage_balance_of(id("alice.testnet")));
}

macro_rules! issue_rejection {
    ($name:ident,$err:literal,$debtor:literal,$token:literal,$amount:expr,$memo:expr) => {
        #[test]
        #[should_panic(expected=$err)]
        fn $name() {
            let mut c = setup();
            context("alice.testnet", 0);
            c.issue(id($debtor), id($token), U128($amount), $memo);
        }
    };
}
issue_rejection!(
    self_debt,
    "ERR_SELF_DEBT",
    "alice.testnet",
    "token.testnet",
    1,
    None
);
issue_rejection!(
    zero_issue,
    "ERR_AMOUNT_ZERO",
    "bob.testnet",
    "token.testnet",
    0,
    None
);
issue_rejection!(
    unknown_token,
    "ERR_TOKEN_NOT_ACCEPTED",
    "bob.testnet",
    "other.testnet",
    1,
    None
);
issue_rejection!(
    long_memo,
    "ERR_MEMO",
    "bob.testnet",
    "token.testnet",
    1,
    Some("x".repeat(129))
);
#[test]
#[should_panic(expected = "ERR_STORAGE")]
fn unregistered_issuer() {
    let mut c = setup();
    context("nobody.testnet", 0);
    c.issue(id("bob.testnet"), id("token.testnet"), U128(1), None);
}
#[test]
#[should_panic(expected = "ERR_NOT_DEBTOR")]
fn wrong_acceptor() {
    let mut c = setup();
    context("alice.testnet", 0);
    let i = c.issue(id("bob.testnet"), id("token.testnet"), U128(1), None);
    c.accept(i);
}
#[test]
#[should_panic(expected = "ERR_STATUS")]
fn accept_twice() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 1);
    c.accept(i);
}
#[test]
#[should_panic(expected = "ERR_DEBT_CAP")]
fn over_cap() {
    let mut c = setup();
    edge(&mut c, "alice.testnet", "bob.testnet", 10001);
}
#[test]
#[should_panic(expected = "ERR_PAIR_LIMIT")]
fn pair_limit() {
    let mut c = setup();
    context("bob.testnet", 1);
    c.set_pair_limit(id("alice.testnet"), id("token.testnet"), Some(U128(1)));
    edge(&mut c, "alice.testnet", "bob.testnet", 2);
}
#[test]
#[should_panic(expected = "ERR_STATUS")]
fn reject_accepted() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 1);
    c.reject(i);
}
#[test]
#[should_panic(expected = "ERR_STATUS")]
fn cancel_accepted() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 1);
    context("bob.testnet", 0);
    c.cancel(i);
}
fn ring(c: &mut Contract) -> Vec<U64> {
    vec![
        edge(c, "alice.testnet", "bob.testnet", 10),
        edge(c, "bob.testnet", "carol.testnet", 10),
        edge(c, "carol.testnet", "alice.testnet", 10),
    ]
}
fn clear(c: &mut Contract, ids: Vec<U64>, n: u128) {
    c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![Cycle {
            ids,
            amount: U128(n),
        }],
    });
}
#[test]
#[should_panic(expected = "ERR_BROKEN_LINK")]
fn reversed_cycle() {
    let mut c = setup();
    let mut ids = ring(&mut c);
    ids.reverse();
    clear(&mut c, ids, 1);
}
#[test]
#[should_panic(expected = "ERR_BROKEN_LINK")]
fn open_path() {
    let mut c = setup();
    let ids = ring(&mut c);
    clear(&mut c, ids[..2].to_vec(), 1);
}
#[test]
#[should_panic(expected = "ERR_DUP_ID")]
fn duplicate_edge() {
    let mut c = setup();
    let ids = ring(&mut c);
    clear(&mut c, vec![ids[0], ids[0]], 1);
}
#[test]
#[should_panic(expected = "ERR_CYCLE_LEN")]
fn length_one() {
    let mut c = setup();
    let ids = ring(&mut c);
    clear(&mut c, vec![ids[0]], 1);
}
#[test]
#[should_panic(expected = "ERR_CYCLE_LEN")]
fn length_exceeds_config() {
    let mut c = setup();
    let ids = ring(&mut c);
    c.config.max_cycle_len = 2;
    clear(&mut c, ids, 1);
}
#[test]
#[should_panic(expected = "ERR_AMOUNT_ZERO")]
fn zero_clear() {
    let mut c = setup();
    let ids = ring(&mut c);
    clear(&mut c, ids, 0);
}
#[test]
#[should_panic(expected = "ERR_OVER_REMAINING")]
fn over_remaining() {
    let mut c = setup();
    let ids = ring(&mut c);
    clear(&mut c, ids, 11);
}
#[test]
#[should_panic(expected = "ERR_NOT_FOUND")]
fn missing_edge() {
    let mut c = setup();
    clear(&mut c, vec![U64(55), U64(56)], 1);
}
#[test]
#[should_panic(expected = "ERR_NOT_ACCEPTED")]
fn unaccepted_edge() {
    let mut c = setup();
    context("alice.testnet", 0);
    let i = c.issue(id("bob.testnet"), id("token.testnet"), U128(2), None);
    clear(&mut c, vec![i, U64(55)], 1);
}
#[test]
#[should_panic(expected = "ERR_BATCH_SIZE")]
fn empty_batch() {
    let mut c = setup();
    c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![],
    });
}
#[test]
#[should_panic(expected = "ERR_BATCH_SIZE")]
fn oversized_batch() {
    let mut c = setup();
    let ids = ring(&mut c);
    c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![
            Cycle {
                ids,
                amount: U128(1)
            };
            21
        ],
    });
}
#[test]
fn repeated_edges_within_remaining() {
    let mut c = setup();
    let ids = ring(&mut c);
    let r = c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![
            Cycle {
                ids,
                amount: U128(5)
            };
            2
        ],
    });
    assert_eq!(r.total_reduced.0, 30);
    assert_eq!(r.closed.len(), 3);
    assert_eq!(
        c.solver_leaderboard(id("token.testnet"), 10)[0]["cleared"],
        "30"
    );
}
#[test]
#[should_panic(expected = "ERR_OVER_REMAINING")]
fn cumulative_overconsumption() {
    let mut c = setup();
    let ids = ring(&mut c);
    c.submit_clearing(ClearingBatch {
        token: id("token.testnet"),
        cycles: vec![
            Cycle {
                ids,
                amount: U128(6)
            };
            2
        ],
    });
}
#[test]
fn two_cycle_and_partial() {
    let mut c = setup();
    let a = edge(&mut c, "alice.testnet", "bob.testnet", 8);
    let b = edge(&mut c, "bob.testnet", "alice.testnet", 10);
    clear(&mut c, vec![a, b], 3);
    assert_eq!(c.get_obligation(a).unwrap().remaining.0, 5);
    assert_eq!(c.get_obligation(b).unwrap().remaining.0, 7);
}
#[test]
fn figure_eight() {
    let mut c = setup();
    let ids = vec![
        edge(&mut c, "alice.testnet", "bob.testnet", 5),
        edge(&mut c, "bob.testnet", "alice.testnet", 5),
        edge(&mut c, "alice.testnet", "carol.testnet", 5),
        edge(&mut c, "carol.testnet", "alice.testnet", 5),
    ];
    clear(&mut c, ids, 5);
    assert_eq!(c.stats(id("token.testnet"))["cleared_total"], "20");
}
#[test]
fn bad_settlement_returns_all() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 10);
    context("token.testnet", 0);
    for (sender, msg) in [
        ("alice.testnet", "broken".into()),
        ("carol.testnet", json!({"obligation_id":i}).to_string()),
    ] {
        assert!(matches!(
            c.ft_on_transfer(id(sender), U128(9), msg),
            PromiseOrValue::Value(U128(9))
        ));
    }
    assert_eq!(c.get_obligation(i).unwrap().remaining.0, 10);
}
#[test]
#[should_panic(expected = "ERR_TOKEN_NOT_ACCEPTED")]
fn untrusted_token() {
    let mut c = setup();
    context("evil.testnet", 0);
    let _ = c.ft_on_transfer(id("alice.testnet"), U128(1), "{}".into());
}
#[test]
fn reject_refunds() {
    let mut c = setup();
    context("alice.testnet", 0);
    let before = c.storage_balance_of(id("alice.testnet"));
    let i = c.issue(id("bob.testnet"), id("token.testnet"), U128(2), None);
    context("bob.testnet", 0);
    c.reject(i);
    assert_eq!(c.storage_balance_of(id("alice.testnet")), before);
}

#[test]
#[should_panic(expected = "ERR_NO_DEBT_CAP")]
fn missing_cap() {
    let mut c = setup();
    context("fresh.testnet", REGISTRATION_MIN);
    c.storage_deposit(None);
    context("alice.testnet", 0);
    let i = c.issue(id("fresh.testnet"), id("token.testnet"), U128(1), None);
    context("fresh.testnet", 0);
    c.accept(i);
}
#[test]
#[should_panic(expected = "ERR_STORAGE")]
fn insufficient_free_storage() {
    let mut c = setup();
    context("fresh.testnet", REGISTRATION_MIN);
    c.storage_deposit(None);
    context("fresh.testnet", 0);
    c.issue(id("bob.testnet"), id("token.testnet"), U128(1), None);
}
#[test]
#[should_panic(expected = "ERR_TOKEN_MISMATCH")]
fn mixed_token_cycle() {
    let mut c = setup();
    context("owner.testnet", 1);
    c.add_token(id("other.testnet"));
    context("alice.testnet", 1);
    c.set_debt_cap(id("other.testnet"), U128(100));
    context("bob.testnet", 0);
    let a = c.issue(id("alice.testnet"), id("other.testnet"), U128(5), None);
    context("alice.testnet", 0);
    c.accept(a);
    let b = edge(&mut c, "bob.testnet", "alice.testnet", 5);
    clear(&mut c, vec![a, b], 1);
}
#[test]
fn callback_restores_failed_withdrawal() {
    use near_sdk::{RuntimeFeesConfig, test_vm_config};
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 10);
    context("token.testnet", 0);
    let _ = c.ft_on_transfer(
        id("alice.testnet"),
        U128(10),
        json!({"obligation_id":i}).to_string(),
    );
    context("bob.testnet", 1);
    let _ = c.withdraw(id("token.testnet"), Some(U128(4)));
    assert_eq!(c.withdrawable(id("bob.testnet"), id("token.testnet")).0, 6);
    let mut b = VMContextBuilder::new();
    b.current_account_id(id("ledger.testnet"))
        .predecessor_account_id(id("ledger.testnet"));
    testing_env!(
        b.build(),
        test_vm_config(),
        RuntimeFeesConfig::test(),
        Default::default(),
        vec![PromiseResult::Failed]
    );
    assert!(!c.on_withdraw(id("bob.testnet"), id("token.testnet"), U128(4)));
    assert_eq!(c.withdrawable(id("bob.testnet"), id("token.testnet")).0, 10);
    assert!(c.get_obligation(i).is_none());
}
#[test]
fn randomized_successful_operations_conserve() {
    let mut c = setup();
    let mut seed = 42u64;
    for _ in 0..60 {
        seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let n = (seed % 50 + 1) as u128;
        let ids = vec![
            edge(&mut c, "alice.testnet", "bob.testnet", n),
            edge(&mut c, "bob.testnet", "carol.testnet", n),
            edge(&mut c, "carol.testnet", "alice.testnet", n),
        ];
        let before: Vec<_> = ["alice.testnet", "bob.testnet", "carol.testnet"]
            .map(|a| c.net_position(id(a), id("token.testnet"))["net"].clone())
            .into();
        clear(&mut c, ids, n);
        let after: Vec<_> = ["alice.testnet", "bob.testnet", "carol.testnet"]
            .map(|a| c.net_position(id(a), id("token.testnet"))["net"].clone())
            .into();
        assert_eq!(before, after);
        let s = c.stats.get(&id("token.testnet")).unwrap();
        assert_eq!(
            s.accepted_total.0,
            s.cleared_total.0 + s.settled_total.0 + s.outstanding_total.0
        );
        assert_eq!(
            s.outstanding_total.0,
            c.obligations
                .values()
                .filter(|o| o.status == Status::Accepted)
                .map(|o| o.remaining.0)
                .sum()
        );
        assert!(c.obligations.values().all(|o| o.remaining.0 > 0));
    }
}
#[test]
fn measured_worst_case_storage() {
    context("owner.testnet", 0);
    let mut c = Contract::new(
        id("owner.testnet"),
        vec![id(&"t".repeat(64))],
        Config::default(),
    );
    let creditor = "c".repeat(64);
    let debtor = "d".repeat(64);
    for a in [&creditor, &debtor] {
        context(a, 10u128.pow(25));
        c.storage_deposit(None);
        context(a, 1);
        c.set_debt_cap(id(&"t".repeat(64)), U128(100));
    }
    c.accounts.flush();
    c.storage.flush();
    c.tokens.flush();
    c.obligations.flush();
    c.pairs.flush();
    c.stats.flush();
    c.open.flush();
    c.by_account.flush();
    c.bucket_count.flush();
    let before = env::storage_usage();
    context(&creditor, 0);
    let i = c.issue(
        id(&debtor),
        id(&"t".repeat(64)),
        U128(1),
        Some("m".repeat(128)),
    );
    context(&debtor, 0);
    c.accept(i);
    c.accounts.flush();
    c.storage.flush();
    c.obligations.flush();
    c.pairs.flush();
    c.stats.flush();
    c.open.get_mut(&id(&"t".repeat(64))).unwrap().flush();
    c.open.flush();
    for a in [&creditor, &debtor] {
        c.by_account.get_mut(&id(a)).unwrap().flush();
    }
    c.by_account.flush();
    c.bucket_count.flush();
    let bytes = env::storage_usage()
        .checked_sub(before)
        .expect("storage must grow");
    println!(
        "worst_case_obligation_bytes={bytes}; fee={OBLIGATION_STORAGE_FEE}; byte_cost={}",
        env::storage_byte_cost().as_yoctonear()
    );
    assert!(
        OBLIGATION_STORAGE_FEE
            >= bytes as u128 * env::storage_byte_cost().as_yoctonear() * 120 / 100
    );
}

#[test]
#[should_panic(expected = "ERR_NOT_FOUND")]
fn accept_many_rejects_missing_last_id() {
    let mut c = setup();
    context("alice.testnet", 0);
    let a = c.issue(id("bob.testnet"), id("token.testnet"), U128(3), None);
    context("bob.testnet", 0);
    c.accept_many(vec![a, U64(999)]);
}
#[test]
fn issue_many_then_accept_many() {
    let mut c = setup();
    context("alice.testnet", 0);
    let ids = c.issue_many(
        (0..3)
            .map(|_| IssueArgs {
                debtor: id("bob.testnet"),
                token: id("token.testnet"),
                amount: U128(2),
                memo: None,
            })
            .collect(),
    );
    context("bob.testnet", 0);
    c.accept_many(ids);
    assert_eq!(c.stats(id("token.testnet"))["outstanding_total"], "6");
    assert_eq!(c.list_open(id("token.testnet"), U64(1), 1).len(), 1);
}
#[test]
fn successful_callback_does_not_restore_credit() {
    use near_sdk::{RuntimeFeesConfig, test_vm_config};
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 7);
    context("token.testnet", 0);
    let _ = c.ft_on_transfer(
        id("alice.testnet"),
        U128(7),
        json!({"obligation_id":i}).to_string(),
    );
    context("bob.testnet", 1);
    let _ = c.withdraw(id("token.testnet"), None);
    let mut b = VMContextBuilder::new();
    b.current_account_id(id("ledger.testnet"))
        .predecessor_account_id(id("ledger.testnet"));
    testing_env!(
        b.build(),
        test_vm_config(),
        RuntimeFeesConfig::test(),
        Default::default(),
        vec![PromiseResult::Successful(vec![])]
    );
    assert!(c.on_withdraw(id("bob.testnet"), id("token.testnet"), U128(7)));
    assert_eq!(c.withdrawable(id("bob.testnet"), id("token.testnet")).0, 0);
}
#[test]
#[should_panic]
fn withdraw_requires_one_yocto() {
    let mut c = setup();
    context("bob.testnet", 0);
    let _ = c.withdraw(id("token.testnet"), None);
}
#[test]
fn partial_payment_retains_debt() {
    let mut c = setup();
    let i = edge(&mut c, "alice.testnet", "bob.testnet", 10);
    context("token.testnet", 0);
    assert!(matches!(
        c.ft_on_transfer(
            id("alice.testnet"),
            U128(3),
            json!({"obligation_id":i}).to_string()
        ),
        PromiseOrValue::Value(U128(0))
    ));
    assert_eq!(c.get_obligation(i).unwrap().remaining.0, 7);
    assert_eq!(c.stats(id("token.testnet"))["settled_total"], "3");
}
#[test]
fn bps_handles_u128_max() {
    let mut c = setup();
    let t = id("token.testnet");
    let mut s = TokenStats::default();
    s.accepted_total = U128(u128::MAX);
    s.cleared_total = U128(u128::MAX / 2);
    c.stats.insert(t.clone(), s);
    assert_eq!(c.stats(t)["cleared_ratio_bps"], 4999);
}

#[test]
fn registration_and_pair_limit_storage_are_funded() {
    let mut c = setup();
    context("alice.testnet", 1);
    let before = c.storage_balance_of(id("alice.testnet")).unwrap()["available"]
        .as_str()
        .unwrap()
        .parse::<u128>()
        .unwrap();
    c.set_pair_limit(id("bob.testnet"), id("token.testnet"), Some(U128(20)));
    let during = c.storage_balance_of(id("alice.testnet")).unwrap()["available"]
        .as_str()
        .unwrap()
        .parse::<u128>()
        .unwrap();
    assert_eq!(before - during, OBLIGATION_STORAGE_FEE);
    c.set_pair_limit(id("bob.testnet"), id("token.testnet"), None);
    assert_eq!(
        c.storage_balance_of(id("alice.testnet")).unwrap()["available"],
        before.to_string()
    );
}

#[test]
fn random_operation_sequence_checks_all_accounting() {
    let mut c = setup();
    let names = ["alice.testnet", "bob.testnet", "carol.testnet"];
    let token = id("token.testnet");
    let mut seed = 1234u64;
    for step in 0..150 {
        seed = seed
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        let open: Vec<_> = c.obligations.values().cloned().collect();
        match seed % 5 {
            0 | 1 => {
                let d = (seed as usize) % 3;
                let cr = (d + 1 + (step % 2)) % 3;
                context(names[cr], 0);
                let i = c.issue(
                    id(names[d]),
                    token.clone(),
                    U128((seed % 25 + 1) as u128),
                    None,
                );
                if seed % 5 == 0 {
                    context(names[d], 0);
                    c.accept(i);
                }
            }
            2 => {
                if let Some(o) = open.iter().find(|o| o.status == Status::Issued) {
                    context(o.debtor.as_str(), 0);
                    c.reject(o.id);
                }
            }
            3 => {
                if let Some(o) = open.iter().find(|o| o.status == Status::Accepted) {
                    context("token.testnet", 0);
                    let _ = c.ft_on_transfer(
                        o.debtor.clone(),
                        U128((seed % 30 + 1) as u128),
                        json!({"obligation_id":o.id}).to_string(),
                    );
                }
            }
            _ => {
                if let Some(o) = open.iter().find(|o| o.status == Status::Issued) {
                    context(o.creditor.as_str(), 0);
                    c.cancel(o.id);
                }
            }
        }
        let s = c.stats.get(&token).cloned().unwrap_or_default();
        let total: u128 = c
            .obligations
            .values()
            .filter(|o| o.status == Status::Accepted)
            .map(|o| o.remaining.0)
            .sum();
        assert_eq!(s.outstanding_total.0, total);
        assert_eq!(
            s.accepted_total.0,
            s.cleared_total.0 + s.settled_total.0 + total
        );
        let mut pay = 0;
        let mut recv = 0;
        for name in names {
            let a = c.account(&id(name), &token);
            pay += a.payable;
            recv += a.receivable;
            assert!(a.payable <= a.cap.unwrap());
        }
        assert_eq!(pay, total);
        assert_eq!(recv, total);
        assert!(c.obligations.values().all(|o| o.remaining.0 > 0));
    }
}

