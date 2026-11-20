import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDeviceKey,
  sealDraft,
  openDraft,
} from "../src/features/offline/crypto";
import { rankQueue } from "../src/features/queue/rank";
const auth = vi.hoisted(() => ({
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signInWithPassword: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  serverClient: async () => ({ auth }),
}));
vi.mock("@/lib/landing-server", () => ({
  staffLanding: async () => "/dashboard",
}));
import { POST } from "../src/app/api/auth/route";
const req = (body: string) =>
  new Request("https://test.local/api/auth", {
    method: "POST",
    headers: { origin: "https://test.local" },
    body,
  });
beforeEach(() => vi.resetAllMocks());
describe("authentication failure handling", () => {
  it("rejects malformed JSON without invoking the provider", async () => {
    expect((await POST(req("{"))).status).toBe(400);
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it("never reports logout success after a provider failure", async () => {
    auth.signOut.mockResolvedValue({
      error: { message: "private provider details" },
    });
    const r = await POST(req('{"action":"logout"}'));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("private provider");
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("never reports recovery success after a provider failure", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: {} });
    expect(
      (await POST(req('{"action":"reset","email":"synthetic@example.test"}')))
        .status,
    ).toBe(503);
  });
  it("handles rejected provider requests", async () => {
    auth.signOut.mockRejectedValue(Error("network"));
    expect((await POST(req('{"action":"logout"}'))).status).toBe(503);
  });
});
describe("device draft encryption", () => {
  it("encrypts clinical payload and preserves exact unknown fields", async () => {
    const key = await createDeviceKey();
    const draft = { name: "Synthetic confidential", age: null };
    const sealed = await sealDraft(key, draft, "hospital:user:id");
    expect(new TextDecoder().decode(sealed.ciphertext)).not.toContain(
      draft.name,
    );
    expect(await openDraft(key, sealed, "hospital:user:id")).toEqual(draft);
    expect(key.extractable).toBe(false);
  });
  it("rejects tampering and reassignment to another hospital", async () => {
    const key = await createDeviceKey();
    const sealed = await sealDraft(key, { age: null }, "hospital:user:id");
    await expect(openDraft(key, sealed, "other:user:id")).rejects.toThrow();
    new Uint8Array(sealed.ciphertext)[0] ^= 1;
    await expect(openDraft(key, sealed, "hospital:user:id")).rejects.toThrow();
  });
});
it("sorts 10000 synthetic queue entries with deterministic category ordering", () => {
  const categories = ["GREEN", "RED", "ASSESSMENT_REQUIRED", "YELLOW"] as const;
  const rows = Array.from({ length: 10000 }, (_, i) => ({
    id: String(i),
    category: categories[i % 4],
    emergency: false,
    sub_priority: i % 11,
    deteriorating: false,
    reassessment_due: null,
    arrived_at: "2026-11-20T00:00:00Z",
    score: 100,
  }));
  const start = performance.now();
  const sorted = rankQueue(rows);
  expect(sorted).toHaveLength(10000);
  expect(sorted[0].category).toBe("RED");
  expect(sorted[2500].category).toBe("YELLOW");
  expect(sorted[5000].category).toBe("GREEN");
  expect(sorted[7500].category).toBe("ASSESSMENT_REQUIRED");
  expect(performance.now() - start).toBeLessThan(2000);
});
