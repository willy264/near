# Standard allocator redeploy smoke test

Date: 2026-11-08T13:09:43.387Z

The ledger and tUSD contracts were code-only redeployed to the same testnet accounts. State was not reinitialized. This smoke test issued and accepted a three-edge cycle, cleared it, issued and settled one residue, and withdrew the creditor balance.

Accounts: agent-01.untangle-261106-e1386a.testnet, agent-02.untangle-261106-e1386a.testnet, agent-03.untangle-261106-e1386a.testnet; creditor withdrawal: agent-02.untangle-261106-e1386a.testnet.
Config after redeploy: {"max_cycle_len":12,"max_cycles_per_batch":5,"max_memo_bytes":128,"max_batch_issue":20}.
Stats before smoke (post gas benchmark): {"accepted_total":"1391000904","cleared_total":"560000644","settled_total":"828000100","outstanding_total":"3000160","open_count":"163","closed_by_clearing":"703","closed_by_payment":"134","clearing_batches":"33","cycles_cleared":"199","payments":"134","cleared_ratio_bps":4025}.

| Action | Transaction | Explorer |
|---|---|---|
| issue 1 | B4HLMyhDGYViaoqwqAuPjm2q7q9UTfB7NNLSWEU2e3ta | https://testnet.nearblocks.io/txns/B4HLMyhDGYViaoqwqAuPjm2q7q9UTfB7NNLSWEU2e3ta |
| issue 2 | AB9vjitRTWxpoauXA1bujmSy4FnrEBGL1CJPJ4M2tHTH | https://testnet.nearblocks.io/txns/AB9vjitRTWxpoauXA1bujmSy4FnrEBGL1CJPJ4M2tHTH |
| issue 3 | A2TU3yESQq5jxnfv7TGPA1jjJb6iRJe1obXrSJrurheA | https://testnet.nearblocks.io/txns/A2TU3yESQq5jxnfv7TGPA1jjJb6iRJe1obXrSJrurheA |
| clearing | 86h8TpeLFR3uBzMKSJ4qHCUJegEahSFNjTfRRrhzTiKq | https://testnet.nearblocks.io/txns/86h8TpeLFR3uBzMKSJ4qHCUJegEahSFNjTfRRrhzTiKq |
| settlement | 9Sf1gimKGtdb7naxJd2HguSVsisT5it3n6BTccFVcFBs | https://testnet.nearblocks.io/txns/9Sf1gimKGtdb7naxJd2HguSVsisT5it3n6BTccFVcFBs |
| withdraw | EVnasSAhuuL4z4sujQ3otVszcmM3PtQNy4iAvceuUir6 | https://testnet.nearblocks.io/txns/EVnasSAhuuL4z4sujQ3otVszcmM3PtQNy4iAvceuUir6 |

Final stats: {"accepted_total":"1395000904","cleared_total":"563000644","settled_total":"829000100","outstanding_total":"3000160","open_count":"163","closed_by_clearing":"706","closed_by_payment":"135","clearing_batches":"34","cycles_cleared":"200","payments":"135","cleared_ratio_bps":4035}.
Ledger code hash: 3CxCowQ7QfAztqQsK2MopHjSphjtNv3HgGLyEkNe1S3U; tUSD code hash: YHv3VtximTuKEL9p84nupQgE8nKDpf9yZH3XfGEnnv3.

The seed-42 agent and fictional-firm runs predate this allocator-only redeploy; they used wee_alloc with the same contract logic.
