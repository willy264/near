import { it, expect, vi } from "vitest";
import { rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
const mocks = vi.hoisted(() => ({ send: vi.fn(), status: vi.fn() }));
vi.mock("./index.ts", () => ({
  provider: {
    sendTransactionUntil: mocks.send,
    viewTransactionStatus: mocks.status,
  },
  verifyNetwork: async () => {},
  testnetId: (s: string) => s,
  evidence: () => {},
}));
vi.mock("near-api-js", async (original) => ({
  ...(await original<object>()),
  SignedTransaction: { decode: (bytes: Uint8Array) => bytes },
}));
import { Journal } from "./journal.ts";
it("recovers a lost response by hash and never signs a replacement transaction", async () => {
  const id = `test-${randomUUID()}`,
    journal = new Journal(id);
  const result = {
    status: { SuccessValue: Buffer.from('"7"').toString("base64") },
    receipts_outcome: [],
    transaction_outcome: { outcome: { gas_burnt: 1 } },
  };
  mocks.send.mockRejectedValueOnce(
    Error("connection interrupted after broadcast"),
  );
  mocks.status.mockResolvedValue(result);
  const create = vi.fn(async () => ({
    transaction: { encode: () => new Uint8Array([1, 2, 3]) },
    encode: () => new Uint8Array([4, 5, 6]),
  }));
  const who = {
    accountId: "alice.testnet",
    createSignedTransaction: create,
  } as unknown as Parameters<Journal["send"]>[1];
  try {
    const first = await journal.send(
      "issue-1",
      who,
      "ledger.testnet",
      [],
      "issue",
      "agent",
    );
    expect(first.value).toBe("7");
    const resumed = new Journal(id);
    expect(
      (
        await resumed.send(
          "issue-1",
          who,
          "ledger.testnet",
          [],
          "issue",
          "agent",
        )
      ).hash,
    ).toBe(first.hash);
    expect(create).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledTimes(1);
    await expect(
      resumed.send("issue-1", who, "other.testnet", [], "issue", "agent"),
    ).rejects.toThrow("Resume parameters changed");
  } finally {
    rmSync(`.sim-state/${id}.json`, { force: true });
  }
});
