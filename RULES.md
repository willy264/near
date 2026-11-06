# Untangle rules

Testnet only. tUSD is a simulated test token with no value. Agents are scripted.

A debt points from debtor to creditor. Creditor issues; debtor alone accepts or rejects. Creditor can cancel only before acceptance. Amounts are positive integer base units, externally decimal strings; IDs are decimal strings. Memo size is bounded in bytes.

An operator prepays storage and sets the debtor's per-token aggregate cap. Agent keys permit issue, issue_many, accept, accept_many, reject and cancel only. No cap means no acceptance. Creditor pair limits optionally further constrain exposure. Caps cannot be lowered below payable.

Storage registration locks a minimum. Issue charges a fixed fee to the creditor; deletion refunds that exact stored fee. Constants require a flushed worst-case storage measurement plus at least 20% margin before deployment.

Clearing accepts bounded batches of closed cycles with distinct IDs per cycle, accepted same-token edges and positive amounts. Each creditor must equal the next debtor. Reuse across cycles is allowed only within cumulative remaining balances. Every edge reduction counts toward cleared volume. Entire invalid receipts roll back. Clearing moves no tokens and preserves each account's receivables minus payables.

Payment authenticates the token contract and original debtor, reduces the accepted debt by at most its remaining amount, and credits an internal creditor balance. Invalid payments and excess are returned unused through the token resolver. Creditors withdraw separately. Withdrawals debit before the external transfer; private failure callbacks restore withdrawable balance, not debt.

Accepted total equals cleared plus settled plus outstanding. Outstanding equals accepted remaining, total payable and total receivable. Stored debts have positive remaining. Token custody equals withdrawable balances outside in-flight withdrawals. Receipt rollback and token custody require sandbox tests; unit panic tests do not establish them.

Closed, rejected and cancelled debts are deleted. Event logs preserve history. NEP-297 events use standard untangle version 1.0.0. No owner can edit debt. Tokens may be added, never removed. Full-access deployment keys remain an operator trust assumption.

Additional storage reservations: one registration minimum per extra token bucket, one fixed fee for each persistent pair limit, and one fixed fee for a solver's first leaderboard entry per token. Anyone can register as a solver. These reservations prevent unbounded state growth through deposit-free calls.
