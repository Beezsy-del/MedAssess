import { describe, expect, it } from "vitest";
import { emptyReport, reportSchema } from "../src/features/questionnaire/model";
import { patientRequest } from "../src/features/questionnaire/requests";
describe("patient capability and report boundaries", () => {
  it("does not treat an encounter reference as a credential", () => {
    expect(
      patientRequest.safeParse({ action: "open", token: "MC-1234567890" })
        .success,
    ).toBe(false);
    expect(
      patientRequest.safeParse({ action: "open", token: "a".repeat(32) })
        .success,
    ).toBe(true);
    expect(
      patientRequest.safeParse({ action: "open", token: "a".repeat(64) })
        .success,
    ).toBe(true);
  });
  it("permits incomplete drafts but requires reviewed submissions", () => {
    const answers = emptyReport();
    expect(
      patientRequest.safeParse({ action: "draft", answers, step: 3 }).success,
    ).toBe(true);
    expect(
      patientRequest.safeParse({
        action: "submit",
        answers,
        operation_id: crypto.randomUUID(),
        previous_report_id: null,
      }).success,
    ).toBe(false);
  });
  it("rejects impossible dates and fractional ages", () => {
    for (const date of ["2026-02-30", "2999-01-01", "not a date"]) {
      const answers = emptyReport();
      answers.identity.date_of_birth = date;
      expect(reportSchema.safeParse(answers).success).toBe(false);
    }
    const answers = emptyReport();
    answers.identity.age = 1.5;
    expect(reportSchema.safeParse(answers).success).toBe(false);
  });
  it("requires an idempotency key and rejects injected actor authority", () => {
    const answers = {
      ...emptyReport(),
      consent: true,
      complaint: "Synthetic concern",
    };
    expect(
      patientRequest.safeParse({
        action: "submit",
        answers,
        previous_report_id: null,
      }).success,
    ).toBe(false);
    expect(
      patientRequest.safeParse({
        action: "submit",
        answers,
        previous_report_id: null,
        operation_id: crypto.randomUUID(),
        hospital_id: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });
  it("emergency notification needs neither questionnaire nor consent", () => {
    expect(patientRequest.safeParse({ action: "emergency" }).success).toBe(
      true,
    );
  });
});
