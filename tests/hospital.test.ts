import { describe, expect, it, vi, beforeEach } from "vitest";
import { selectMembership } from "../src/lib/hospital-selection";
import { readBoundedJson } from "../src/lib/request-json";
const mocks = vi.hoisted(() => ({ session: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/data", () => ({ session: mocks.session }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: mocks.set }) }));
import { POST } from "../src/app/api/hospital/route";
const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
const memberships = [{ hospital_id: b }, { hospital_id: a }];
function request(hospital: string, origin = "https://medcipher.test") {
  return new Request("https://medcipher.test/api/hospital", {
    method: "POST",
    headers: { origin },
    body: JSON.stringify({ hospital }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.mockResolvedValue({ memberships });
});
describe("hospital selection", () => {
  it("uses a stable default and an authorized saved preference", () => {
    expect(selectMembership(memberships).hospital_id).toBe(a);
    expect(selectMembership(memberships, undefined, b).hospital_id).toBe(b);
  });
  it("rejects explicit unknown or empty IDs instead of silently changing hospital", () => {
    expect(() => selectMembership(memberships, "unknown", a)).toThrow();
    expect(() => selectMembership(memberships, "")).toThrow();
    expect(() => selectMembership([], undefined, a)).toThrow();
  });
  it("ignores a stale saved preference without granting access", () => {
    expect(
      selectMembership([{ hospital_id: b }], undefined, a).hospital_id,
    ).toBe(b);
  });
  it("writes a secure HttpOnly preference only for an active membership", async () => {
    expect((await POST(request(b))).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith("medcipher-hospital", b, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  });
  it("rejects foreign origin before authentication or cookie changes", async () => {
    expect((await POST(request(b, "https://foreign.test"))).status).toBe(403);
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated and revoked memberships without setting a cookie", async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await POST(request(b))).status).toBe(403);
    mocks.session.mockResolvedValueOnce({ memberships: [{ hospital_id: a }] });
    expect((await POST(request(b))).status).toBe(403);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("rejects malformed selections", async () => {
    expect((await POST(request("invalid"))).status).toBe(400);
    expect(mocks.set).not.toHaveBeenCalled();
  });
});
describe("bounded request bodies", () => {
  const body = (text: string) =>
    new Request("https://test.local", { method: "POST", body: text });
  it("parses valid JSON and rejects malformed JSON", async () => {
    expect(await readBoundedJson(body('{"a":1}'), 7)).toEqual({ a: 1 });
    expect(await readBoundedJson(body("{"), 7)).toBeNull();
  });
  it("bounds actual bytes without Content-Length, including multibyte text", async () => {
    await expect(readBoundedJson(body('"éé"'), 5)).rejects.toThrow(RangeError);
  });
  it("rejects an oversized selection before authentication", async () => {
    const req = request("x".repeat(1100));
    expect((await POST(req)).status).toBe(413);
    expect(mocks.session).not.toHaveBeenCalled();
  });
});
