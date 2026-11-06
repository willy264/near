# Testnet scoped-key proof

TEST ONLY. Ledger: ledger.untangle-261106-e1386a.testnet

Issue: 4QVN8i5MnctKaY1VNGwxxdnKJcV1WX8WYvvGB2G67F76
Accept: Csdgoze86eHQb1VPWcG3vaTdGteWHRPayrRaU6N5MeFS

All five forbidden actions were rejected. Signed hashes below identify attempted transactions, not included transactions; the protocol rejects these before receipts, so explorer entries are not expected.

```json
[
  {
    "label": "set_debt_cap",
    "signedTransactionHash": "DbfpvB1BCVUe2dF7EaCUB2HiJon874qywYbJSkYVuwkH",
    "includedOnChain": false,
    "error": "Deposit is not allowed with function call",
    "keyRole": "agent",
    "signer": "agent-02.untangle-261106-e1386a.testnet"
  },
  {
    "label": "withdraw",
    "signedTransactionHash": "6ZVsUwxJCvmedLo3Y7nhpiahk4GupBjXdGFW8mhQzQd9",
    "includedOnChain": false,
    "error": "Deposit is not allowed with function call",
    "keyRole": "agent",
    "signer": "agent-02.untangle-261106-e1386a.testnet"
  },
  {
    "label": "storage_deposit",
    "signedTransactionHash": "4tQkzzFnopivYPLRCrjYkouJCXhycdT5THzq2tsbGRwA",
    "includedOnChain": false,
    "error": "Deposit is not allowed with function call",
    "keyRole": "agent",
    "signer": "agent-02.untangle-261106-e1386a.testnet"
  },
  {
    "label": "ft_transfer_call",
    "signedTransactionHash": "5VyDiNiYAsqAiAhaVUyPDmRRHWxxtpgUBJQLkZZ5iJNC",
    "includedOnChain": false,
    "error": "Deposit is not allowed with function call",
    "keyRole": "agent",
    "signer": "agent-02.untangle-261106-e1386a.testnet"
  },
  {
    "label": "transfer_near",
    "signedTransactionHash": "7gJ6Hw2TjDWxqe1bXADVX1Pbv6MUXokw4CNXUnpr2iWE",
    "includedOnChain": false,
    "error": "Access key requires full access",
    "keyRole": "agent",
    "signer": "agent-02.untangle-261106-e1386a.testnet"
  }
]
```
