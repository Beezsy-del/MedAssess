import { describe, expect, it } from "vitest";
import { normalizeIstIso, toIstLocalInput } from "@/lib/date-ist";
import { actionSchemas } from "@/features/commands/schema";

describe("IST datetime normalization helpers", () => {
  it("formats a UTC timestamp into Asia/Kolkata datetime-local string", () => {
    const utc = new Date("2026-11-27T04:30:00.000Z");
    expect(toIstLocalInput(utc)).toBe("2026-11-27T10:00");
  });

  it("normalizes datetime-local input to valid ISO +05:30 accepted by command schemas", () => {
    const normalized = normalizeIstIso("2026-11-27T10:00");
    expect(normalized).toBe("2026-11-27T10:00:00+05:30");

    const parsed = actionSchemas.follow_up.safeParse({
      encounter_id: "e1111111-1111-4111-8111-111111111111",
      due_at: normalized,
      reason: "Review vital signs in 24 hours",
    });
    expect(parsed.success).toBe(true);
  });

  it("preserves explicit timezone offsets unchanged", () => {
    expect(normalizeIstIso("2026-11-27T10:00:00+05:30")).toBe(
      "2026-11-27T10:00:00+05:30",
    );
  });
});
