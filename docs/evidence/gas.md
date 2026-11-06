# Testnet gas measurements

TEST ONLY. Every cycle uses distinct obligations. Repeated accounts form valid closed walks; measurements do not cover distinct-account worst cases. Memos are 128 bytes. Total transaction and receipt gas burnt is reported.

| Method | Size | Tgas | Transaction |
|---|---|---:|---|
| issue_many | 1 | 4.001 | 5svukRJVFAHF9p4HBpGUiZU82z3gZqdvGMRkXR9jcp25 |
| issue_many | 1 | 4.193 | A5G1LmMKh6sDmnbpJhG7dTvRf9AXVL19dfwSuzaaTZJP |
| submit_clearing | 1 x length 2 | 8.476 | GGttfZG3dNVZ7g5PNemy4284xsGUYX2wFpigEA2XmUTM |
| issue_many | 2 | 5.388 | 6V5qvf5jACWqgDj5cPspk6PT6FgqvU4kAHwVK4JS1L6o |
| issue_many | 2 | 5.619 | AYeaS18sW52DkQdK5RB54th2JKtZ5mCzSRQ7gjbAFU7P |
| submit_clearing | 1 x length 4 | 11.726 | 8J3XbcPk6Yzhs6SXedVWXWvx4WwWHhhNgeP6path6Dxa |
| issue_many | 4 | 8.164 | 1qoHxiTtWyfsyTmskX9G1BwzppsF9n1FTAp8LUCHa4N |
| issue_many | 4 | 8.449 | FJMHYn3VPSzN13csSamqiUzxLqWqoLVnPT2oAyQbddNA |
| submit_clearing | 1 x length 8 | 18.719 | 7iLcstcKmkLHzmoUmJSWKuNBi64Fpu8vbFfBzn1nuHyb |
| issue_many | 6 | 10.936 | Ab42QsySaoTvxHWihqJyEecwAVuzhKBkicFcuNmG7HeN |
| issue_many | 6 | 11.280 | EkdSPCF2qz7gLXM6MusY3KWjCMuSFeZCJxGCSW1eZ76D |
| submit_clearing | 1 x length 12 | 25.704 | CdxUT5du5TVpd1ZWviYf6qpfpMmWZoHnVD9hX2mvwfY7 |
| issue_many | 8 | 13.709 | 8ZPYvLYfqPX4NV2qd4udFNMDSN95LWznbYqAts7giQpd |
| issue_many | 8 | 14.115 | Ck7iYXNnCFZeGNDJgavF4XZ21cmdR8JpHF3QPAQC9it5 |
| submit_clearing | 1 x length 16 | 32.706 | HnT2SMQBvVHawHT6AuJtpVHwSTYFbMs26bPfnegZ9QH9 |
| issue_many | 10 | 16.486 | 98DD5AAsvbzqem5mCZq4Zov5qiunYFoWV2kFEd2DHvb5 |
| issue_many | 10 | 16.916 | HXS9McNMaLUNrVW1ubqFKrzKm26p2WzVQNE192jrhbCR |
| submit_clearing | 5 x length 4 | 40.078 | 8ua5WkwMDntCQCu8dJT1shbSDHEtpeVzXhzD8qP8ieqM |
| issue_many | 20 | 30.378 | DQ8poGk4HuZw8cnRKAv9v5w2FcXpF2jNux1taNcRgtrH |
| issue_many | 20 | 31.243 | 38aC5zBcUjyMQsyT6mWjTbgz2PGF3zBC79hgCtNAEq7w |
| submit_clearing | 10 x length 4 | 75.977 | DaZ8ZuxFNrFhN4yU5eXQtW9tDQCqB1U6ZZk6Lt6EpbiL |
| issue_many | 20 | 30.391 | 44rFRVTn9o1UgmqJPWs2fwfkuNiTTiMw9BBFR824GYo8 |
| issue_many | 20 | 31.254 | 8V7UJKHrNbbHgybDBpSe2XFoAXSmXgQ4BP7nUX7Ja5E5 |
| issue_many | 20 | 31.349 | 5shnwrD9d2kamcc9m7SV9umtQwx2bZ8Q8LTEnn9bUKVT |
| issue_many | 20 | 31.360 | 4NPeXX3MKYjHf7UUkFtzUw4LBvQZe3PfRAwoUyc8ND7M |
| submit_clearing | 20 x length 4 | 150.217 | 7Y8bk4CmbzyYns4GE5oCtzEB3aFpmYkU1MdgUED792hb |
| issue_many | 20 | 30.407 | 572kXYEVGNEPePiZSU6zSpqeL5fkwAJtRtMXqyC1Gz3y |
| issue_many | 20 | 31.233 | 7NHbQuE8dGzKWWU6zmW5iY599TqtG2CXoh2ZJ3SEFmh4 |
| issue_many | 20 | 31.284 | 7zxUp1PKJ8s3gK1ZmCmDyHQf9izQQuKDDmrdAyuzKhzH |
| issue_many | 20 | 31.290 | 7qnF3BGEoLr561mEtE47URjN45m8Mfd1NKg4hcWh5yHq |
| issue_many | 20 | 31.371 | ATbthL5W1gqpGb3UhY6R1pF4wgvnMb7hVsQeHPAYX8Zu |
| issue_many | 20 | 31.472 | B9RhgwjWAUjV1MiDuweQ9WAN65WgH6qQaahkAmisFJvt |
| issue_many | 20 | 31.456 | GZr8aA7YQjAkEtFSReqZdvfVZenL4a7jQw1S65zt2jDk |
| issue_many | 20 | 31.435 | HQqChjxNGvDBs8rAGhGj4ypxg7M1Qbdy5Y4soxAEXb2L |
| issue_many FAILED: log limit | 40 | 22.169 | 8tioh7T6vgNEB5DyPCM6cVYndTVtBGzNfBirGWoHRqJH |
| submit_clearing FAILED: gas limit | 40 x length 4 | 301.517 | CezKfsvbeN5PVTq8rF7jU2g3cj971YqQPzjnsPVKHJYB |
| cleanup FAILED: gas limit | 20 x length 2 | 101.458 | GjBsM4KgAA3H2gUTMpD7DztbW4nJtPp5cdTfq54nritG |
| issue_many | 20 | 30.419 | HoyrvWqRzj2u1oeE9cge9aZJFKZVuQU75GGHbvL5Mxgu |
| issue_many | 10 | 17.031 | 8woB82D7eyRnYmJ7cEco3zug2TGayKDGYvNcX13AoYrE |
| issue_many | 20 | 31.232 | 82duDLLDZJT8ZsHzG6zdqVvV3Wi5kQMjfXYZum3fvB3J |
| issue_many | 10 | 17.080 | Gqb8Kon7KaSxoXTizCQw8zHj3Z6PpWgorxxT3igFoPX2 |
| submit_clearing | 5 x length 12 | 112.436 | F6CHEXvE5XGUXeTfNrTi53ZxVWuJWay5Q59CKTT7LQ6e |

Final limits: cycle 12, batch 5, issue batch 20. The combined 5 x length 12 case measured 112.436 Tgas, below 180. Config transaction: 6UBwifh4f2NPWvEuFjbrkHAJQh3rwe9ntxVauW8eMFyQ.

Issue batch 40 with 128-byte memos failed the runtime log limit, tx 8tioh7T6vgNEB5DyPCM6cVYndTVtBGzNfBirGWoHRqJH. Failed receipts are retained in transactions.jsonl.
