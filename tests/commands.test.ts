import { describe, expect, it } from "vitest";
import {
  actionSchemas,
  commandEnvelope,
} from "../src/features/commands/schema";
const id = "11111111-1111-4111-8111-111111111111";
describe("operation-specific validation", () => {
  it("rejects unknown envelope and payload keys", () => {
    expect(
      commandEnvelope.safeParse({
        hospital: id,
        action: "token",
        data: {},
        role: "doctor",
      }).success,
    ).toBe(false);
    expect(
      actionSchemas.token.safeParse({ encounter_id: id, hospital_id: id })
        .success,
    ).toBe(false);
  });
  it("keeps unknown age unknown and rejects out-of-range age", () => {
    expect(
      actionSchemas.register.parse({ operation_id: id, age: null }).age,
    ).toBeNull();
    expect(
      actionSchemas.register.safeParse({ operation_id: id, age: 131 }).success,
    ).toBe(false);
  });
  it("parses integer form values without coercing empty fields to zero", () => {
    expect(
      actionSchemas.settings.parse({
        reassessment_minutes: "30",
        alert_minutes: "5",
      }).alert_minutes,
    ).toBe(5);
    expect(
      actionSchemas.subpriority.safeParse({
        encounter_id: id,
        reason: "Clinical review",
        sub_priority: "",
      }).success,
    ).toBe(false);
    expect(
      actionSchemas.subpriority.safeParse({
        encounter_id: id,
        reason: "Clinical review",
        sub_priority: 11,
      }).success,
    ).toBe(false);
  });
  it("requires clinician assignment and documented alert resolution", () => {
    expect(
      actionSchemas.transition.safeParse({
        encounter_id: id,
        status: "STAFF_ASSIGNED",
        assigned_to: "",
        reason: "Handover",
      }).success,
    ).toBe(false);
    expect(
      actionSchemas.alert.safeParse({ id, status: "RESOLVED", reason: "" })
        .success,
    ).toBe(false);
  });
  it("requires timezone-aware, ordered shifts", () => {
    expect(
      actionSchemas.shift.safeParse({
        user_id: id,
        starts_at: "2026-11-20T10:00:00",
        ends_at: "2026-11-20T12:00:00",
      }).success,
    ).toBe(false);
    expect(
      actionSchemas.shift.safeParse({
        user_id: id,
        starts_at: "2026-11-20T12:00:00+05:30",
        ends_at: "2026-11-20T10:00:00+05:30",
      }).success,
    ).toBe(false);
  });
});
