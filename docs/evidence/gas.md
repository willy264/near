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
| issue_many | 1 | 4.009 | DSU2dDrajGxNfNd17BiHJB7kwbwcXorF6Jwmgi4FKAtN |
| issue_many | 1 | 4.194 | DkpY8aNeZUKadYk3T6TbJNp6nJsYJGcv58V15dSGMR9j |
| submit_clearing | 1 x length 2 | 8.262 | 3shAJZ7yZvG5B4b9ujxqAEtgCKy1kopkF1gkSh7XFgjG |
| issue_many | 2 | 5.389 | 3T75p4vUfAimNVB8NuhxmeEokavkcNh2BKmN5pMQnVFE |
| issue_many | 2 | 5.614 | 5RBAmp96Vg67jUG6pwhDjyHg2wmEnXPcA6gTZJQYRwGU |
| submit_clearing | 1 x length 4 | 11.733 | J4y7yiHADaE1ern9JGh7N9ifruASf1RcJvhdX2Dk6CVC |
| issue_many | 4 | 8.165 | 7MmcANg6igTSHsymG5d9Bch785wJpk4DGYYHg7bwWNHa |
| issue_many | 4 | 8.440 | 66niiRrVzdr1TRk4BjrWG9L8UFtvXRJiEXJwzgfLJNFM |
| submit_clearing | 1 x length 8 | 18.747 | 3F8FBgZkFEZZ3s42zPDFKbY9S5y9MC9dj8X9N8oY1LAM |
| issue_many | 6 | 10.939 | AK4uGt3b3j4eosmvFXw5yKYTrPKHtCg58UsRLfYWoKn3 |
| issue_many | 6 | 11.284 | 5s85Cyfp4moW1xpFp2rF9K8igrb57XHPw32tk3wv3mnD |
| submit_clearing | 1 x length 12 | 25.713 | AaakakwY4RRnRCKXhAQNNXSmo7eJZ3L33zwDy6zid724 |
| issue_many | 8 | 13.717 | AQq5MUzMAzk8VYXXSwt9kmj158SKNnii26y5qxyE445Z |
| issue_many | 8 | 14.118 | AL8Z7wQZxSSDnn8UiqnkcDeBL2KNw3xK6gd7QSDnvaXe |
| submit_clearing | 1 x length 16 | 32.764 | AmPQbjBgij9h8kQWNnYQxsees5QHTL2QzmM95b39tT1d |
| issue_many | 10 | 16.497 | Addg2XbS45n7NwBoTKG1PpRUzkF522y6KRFp5Vzu44Ec |
| issue_many | 10 | 16.934 | 7LT38yAXvNFdfNroGRa629nVkRtzHHUpQFc59ux6kFe6 |
| submit_clearing | 5 x length 4 | 40.112 | DYqeHZ7kPcNM1FB5oFa9Xd6Rsew8VrBCyXbNwj8cp3k8 |
| issue_many | 20 | 30.400 | 3YTfLYT75t9TbVP4LqdbBPwfY6AKsQva4ZVigpK2fmqF |
| issue_many | 20 | 31.349 | AhKrWr2THHiqUCEfzDPHKQnicvPkSrots66MezwZJfTd |
| submit_clearing | 10 x length 4 | 76.311 | 56mQU8HGQik7rhJ8MKr99rYLdRXrKYgF6922pj3k5KgM |
| issue_many | 20 | 30.389 | AZmxzGfqDB6AfoJ6BWRFcaDSqjrtNfqyJqVU6ApEfeFJ |
| issue_many | 20 | 31.247 | CVNW7wcoBERT9YWPkz9kgrRJgXdeWrAhJ3fzNLAgz25V |
| issue_many | 20 | 31.253 | Eyr9XBh8JKmhmSvNu91Df83VCCdmQAYtzyiGcW8brctv |
| issue_many | 20 | 31.273 | E7vfkoKpTzEhYSNXyeh4UwHyQJEApvT5oYvTgq9VpTHC |
| submit_clearing | 20 x length 4 | 149.870 | 2iFL2Md1WX7ktRQbCBneC68pxt1AdWLUfKMkbx1vMTeo |
| issue_many | 20 | 30.394 | CusK6f7Fvz2AuPwFWMb3RDyXfgmupV5A97CKuQfvqqjp |
| issue_many | 20 | 31.238 | HXfQhPu3dUXUMygaj6uUKJoKGKZ4nrJt4BjEgjquPbjZ |
| issue_many | 20 | 31.243 | 4J4kMwoJcDCbVLFJ5gYVxqV57eNzEJYR73UwjKkTyLWE |
| issue_many | 20 | 31.265 | FQVVTp8Kbxwi8VNHiLhfDZCP383KXbLaoSHmmG55ERSL |
| issue_many | 20 | 31.251 | DHFjyardasofd5eeD56ri4WBxKCV6bPvhZTKz3gwqCmz |
| issue_many | 20 | 31.431 | GUEmQdLXSHf4BjvM5GSvcp1BL9RPkb1Krk2Z6fqvqqYg |
| issue_many | 20 | 31.442 | GnCc3xmpf2gWM7LMYGEX4PDMznTwQyXsN287Jqva8P3P |
| issue_many | 20 | 31.431 | 4gUxipJ9sb6YJTkYTA1rfc6j48EzQFKciQpGwwPwgNtA |
| issue_many | 20 | 31.420 | 2w9Ef48w6rf2ESuP4Lpo6t4JsEyNkVpYHp973HvFEerS |
| issue_many | 10 | 17.161 | FMFcKKoqxnxJUa7q4H8C34f9DNeQ4DNb7f9F3msKRzpv |
| issue_many | 20 | 31.435 | 3wNoipaJEU7Wh8ikinrV6v5nGL3bNREZA11gBNZmUYKw |
| issue_many | 10 | 17.173 | 7pFMf5UsdX1e3ufdoVctf5t6KtA6fVgRDzCca5GFMkxz |
| submit_clearing | 5 x length 12 | 113.208 | 521ftyAAFq76iXYvg7hKdRVermDUbSpdBp9F8CeceBAd |

Final limits: cycle 12, batch 5, issue batch 20. The combined 5 x length 12 case measured 113.208 Tgas, below 180. Config transaction: AYteBLekr1kMfiSMiufexgvChZ49XS6SPEskSoJ4xCFU.

Issue batch 40 with 128-byte memos failed the runtime log limit, tx 8tioh7T6vgNEB5DyPCM6cVYndTVtBGzNfBirGWoHRqJH. Failed receipts are retained in transactions.jsonl.

Allocator verification rerun on 2026-11-08: rebuilt standard-allocator code measured 113.208 Tgas for 5 x length 12, below the 180 Tgas (60% of 300 Tgas) frozen threshold. The 20 x length 4 benchmark measured 149.870 Tgas, also below 180. The expected 40 x length 4 benchmark exceeded the 300 Tgas prepaid limit and was retained as a failed measurement; the script was then completed with a final 5 x length 12 measurement and restored config 12 / 5 / 128 / 20. New measurement rows are appended in gas.jsonl.
