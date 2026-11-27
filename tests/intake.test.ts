import { describe, it, expect } from "vitest";
import { intakeSchema } from "../src/features/commands/schema";
import { emptyIntake } from "../src/features/registration/intake-model";
import { landingForRole } from "../src/lib/landing";
const id = "11111111-1111-4111-8111-111111111111";
const valid = () => ({
  ...emptyIntake(id),
  name: "Synthetic patient",
  identity_confirmed: true,
  category: "YELLOW",
  reason: "Human assessment",
  input: { ...emptyIntake(id).input, verified: true },
});
describe("nurse intake contract", () => {
  it("routes roles to their permitted primary workspace", () => {
    for (const role of ["nurse", "triage_nurse"])
      expect(landingForRole(role)).toBe("/nurse");
    expect(landingForRole("doctor")).toBe("/doctor");
    expect(landingForRole("receptionist")).toBe("/reception");
    for (const role of ["hospital_admin", "super_admin", "resource_manager"])
      expect(landingForRole(role)).toBe("/dashboard");
  });
  it("starts with no clinical category or assumed observations", () => {
    const draft = emptyIntake(id);
    expect(draft.category).toBe("");
    expect(draft.identity_confirmed).toBe(false);
    expect(Object.values(draft.input.vitals).every((v) => v === null)).toBe(
      true,
    );
    expect(intakeSchema.safeParse(draft).success).toBe(false);
  });
  it("requires explicit identity and human confirmation", () => {
    expect(intakeSchema.safeParse(valid()).success).toBe(true);
    expect(
      intakeSchema.safeParse({ ...valid(), identity_confirmed: false }).success,
    ).toBe(false);
    expect(
      intakeSchema.safeParse({
        ...valid(),
        input: { ...valid().input, verified: false },
      }).success,
    ).toBe(false);
  });
  it("retains incomplete assessments without pretending normality", () => {
    const result = intakeSchema.parse({
      ...valid(),
      category: "ASSESSMENT_REQUIRED",
      input: emptyIntake(id).input,
    });
    expect(result.input.vitals.pulse).toBeNull();
    expect(result.input.verified).toBe(false);
  });
  it("requires the patient and version when resuming a visit", () => {
    expect(
      intakeSchema.safeParse({ ...valid(), encounter_id: id }).success,
    ).toBe(false);
    expect(
      intakeSchema.safeParse({
        ...valid(),
        encounter_id: id,
        patient_id: id,
        version: 1,
      }).success,
    ).toBe(true);
  });
  it("rejects invalid demographics and clinical inputs", () => {
    for (const patch of [
      { date_of_birth: "2999-01-01" },
      { date_of_birth: "2000-01-01", age: 26 },
      { age: -1 },
      { name: "" },
      { category: "" },
      { reason: "no" },
      { unknown: true },
    ])
      expect(intakeSchema.safeParse({ ...valid(), ...patch }).success).toBe(
        false,
      );
    expect(
      intakeSchema.safeParse({
        ...valid(),
        input: {
          ...valid().input,
          vitals: { ...valid().input.vitals, spo2: 101 },
        },
      }).success,
    ).toBe(false);
  });
});
