import { describe, expect, it } from "vitest";
import { staffPasswordSchema } from "../src/features/access/staff-password";

describe("staff password provider limits", () => {
  it("accepts supported boundary lengths", () => {
    for (const length of [12, 72])
      expect(staffPasswordSchema.safeParse("A".repeat(length)).success).toBe(
        true,
      );
  });
  it("rejects short and provider-rejected long passwords", () => {
    for (const length of [11, 73, 128])
      expect(staffPasswordSchema.safeParse("A".repeat(length)).success).toBe(
        false,
      );
  });
  it("enforces the UTF-8 limit rather than silently truncating Unicode", () => {
    expect(staffPasswordSchema.safeParse("界".repeat(24)).success).toBe(true);
    expect(staffPasswordSchema.safeParse("界".repeat(25)).success).toBe(false);
  });
});
