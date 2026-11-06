import { Account, SignedTransaction, baseEncode, actions } from "near-api-js";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
} from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { provider, verifyNetwork, testnetId, evidence } from "./index.ts";
import { stringify } from "../../shared/src/model.ts";
type Outcome = Awaited<ReturnType<typeof provider.sendTransactionUntil>>;
type RecordEntry = {
  hash: string;
  signer: string;
  receiver: string;
  method: string;
  keyRole: "agent" | "operator" | "solver";
  signed: string;
  fingerprint: string;
  result?: Outcome;
};
export class Journal {
  readonly records: Record<string, RecordEntry>;
  readonly data: Record<string, unknown>;
  private path: string;
  constructor(readonly runId: string) {
    if (!/^[a-z0-9-]+$/.test(runId)) throw Error("Invalid run id");
    mkdirSync(".sim-state", { recursive: true });
    this.path = `.sim-state/${runId}.json`;
    const saved = existsSync(this.path)
      ? JSON.parse(readFileSync(this.path, "utf8"))
      : { records: {}, data: {} };
    this.records = saved.records;
    this.data = saved.data;
  }
  save() {
    writeFileSync(
      this.path + ".tmp",
      stringify({ records: this.records, data: this.data }),
    );
    renameSync(this.path + ".tmp", this.path);
  }
  async send(
    id: string,
    who: Account,
    receiver: string,
    txActions: Parameters<Account["signAndSendTransaction"]>[0]["actions"],
    method: string,
    keyRole: "agent" | "operator" | "solver" = "operator",
  ) {
    await verifyNetwork();
    testnetId(receiver);
    testnetId(who.accountId);
    const fingerprint = createHash("sha256")
      .update(
        stringify({ signer: who.accountId, receiver, txActions, keyRole }),
      )
      .digest("hex");
    let entry = this.records[id];
    if (entry && entry.fingerprint !== fingerprint)
      throw Error(`Resume parameters changed: ${id}`);
    if (!entry) {
      const signed = await who.createSignedTransaction({
        receiverId: receiver,
        actions: txActions,
      });
      entry = {
        hash: baseEncode(
          createHash("sha256").update(signed.transaction.encode()).digest(),
        ),
        signer: who.accountId,
        receiver,
        method,
        keyRole,
        signed: Buffer.from(signed.encode()).toString("base64"),
        fingerprint,
      };
      this.records[id] = entry;
      this.save();
    }
    if (!entry.result) {
      let last: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0)
            try {
              entry.result = await provider.viewTransactionStatus({
                txHash: entry.hash,
                accountId: entry.signer,
                waitUntil: "FINAL",
              });
            } catch {
              /* Resend the same signed transaction; never create a new nonce here. */
            }
          if (!entry.result)
            entry.result = await provider.sendTransactionUntil(
              SignedTransaction.decode(Buffer.from(entry.signed, "base64")),
              "FINAL",
            );
          break;
        } catch (e) {
          last = e;
          await delay(500 * 2 ** attempt);
        }
      }
      if (!entry.result) throw last;
      this.save();
      evidence("transactions", {
        label: method,
        signer: entry.signer,
        keyRole,
        receiver,
        hash: entry.hash,
        status: entry.result.status,
        gas: this.gas(entry.result),
        receipts: entry.result.receipts_outcome,
        timestamp: new Date().toISOString(),
        runId: this.runId,
      });
    }
    if (
      typeof entry.result.status === "object" &&
      "Failure" in entry.result.status
    )
      throw Error(
        `Recorded transaction failed ${entry.hash}: ${JSON.stringify(entry.result.status.Failure)}`,
      );
    const raw =
      typeof entry.result.status === "object" &&
      "SuccessValue" in entry.result.status
        ? Buffer.from(entry.result.status.SuccessValue, "base64").toString()
        : "";
    return {
      value: raw ? JSON.parse(raw) : null,
      hash: entry.hash,
      result: entry.result,
    };
  }
  call(
    id: string,
    who: Account,
    receiver: string,
    method: string,
    args: Record<string, unknown>,
    deposit = 0n,
    gas = 100n * 10n ** 12n,
    role: "agent" | "operator" | "solver" = "operator",
  ) {
    return this.send(
      id,
      who,
      receiver,
      [actions.functionCall(method, args, gas, deposit)],
      method,
      role,
    );
  }
  private gas(r: Outcome) {
    return r.receipts_outcome
      .reduce(
        (n, o) => n + BigInt(o.outcome.gas_burnt),
        BigInt(r.transaction_outcome.outcome.gas_burnt),
      )
      .toString();
  }
  transactions() {
    return Object.values(this.records)
      .filter((e) => e.result)
      .map((e) => ({
        hash: e.hash,
        method: e.method,
        signer: e.signer,
        keyRole: e.keyRole,
        gas: this.gas(e.result!),
      }));
  }
}
