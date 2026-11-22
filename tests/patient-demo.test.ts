import { patientToken } from "../src/features/questionnaire/requests";
import { describe, expect, it } from "vitest";
import {
  demoQrValue,
  demoReducer,
  initialDemo,
  scenarios,
} from "../src/features/patient-demo/model";
const at = "2026-11-22T12:00:00Z";
describe("isolated presentation scenarios", () => {
  it.each(scenarios)(
    "runs the explicit $id script, not a symptom classifier",
    (scenario) => {
      const initial = initialDemo(scenario.id, at);
      const report = {
        ...initial.report,
        consent: true,
        pain: 10,
        complaint: "Any fictional text; not evaluated clinically",
      };
      const result = demoReducer(initial, { type: "submit", report, at });
      expect(result.category).toBe(scenario.category);
      expect(result.notices.length).toBeGreaterThan(0);
      expect(
        result.events.some((e) => e.title === "Questionnaire completed"),
      ).toBe(true);
      expect(initial.category).toBeNull();
    },
  );
  it("preserves escalation history and never downgrades automatically", () => {
    let s = initialDemo("dynamic", at);
    s = demoReducer(s, {
      type: "submit",
      report: { ...s.report, consent: true },
      at,
    });
    s = demoReducer(s, {
      type: "update",
      complaint: "Scripted deterioration",
      progression: "worsening",
      target: "YELLOW",
      at,
    });
    expect(s.previousCategory).toBe("GREEN");
    s = demoReducer(s, { type: "emergency", at });
    expect(s.previousCategory).toBe("YELLOW");
    s = demoReducer(s, { type: "submit", report: s.report, at });
    expect(s.category).toBe("RED");
    expect(s.events.some((e) => e.title.includes("GREEN → YELLOW"))).toBe(true);
    expect(s.events.some((e) => e.title.includes("YELLOW → RED"))).toBe(true);
  });
  it("records acknowledgement once and gates doctor work on nurse review", () => {
    let s = initialDemo("history", at);
    expect(
      demoReducer(s, {
        type: "doctor",
        kind: "Referral",
        text: "fictional",
        at,
      }),
    ).toBe(s);
    s = demoReducer(s, { type: "submit", report: s.report, at });
    s = demoReducer(s, { type: "acknowledge", id: 1, at });
    expect(demoReducer(s, { type: "acknowledge", id: 1, at })).toBe(s);
    s = demoReducer(s, { type: "nurse", observation: "fictional review", at });
    s = demoReducer(s, {
      type: "doctor",
      kind: "Referral",
      text: "fictional referral",
      at,
    });
    expect(s.doctorNotes).toHaveLength(1);
    const reset = demoReducer(s, { type: "reset", at });
    expect(reset.events).toHaveLength(1);
    expect(reset.notices).toEqual([]);
    expect(reset.doctorNotes).toEqual([]);
    expect(reset.category).toBeNull();
  });
});

it("illustrative QR cannot pass the real access-token validator", () => {
  expect(patientToken.safeParse(demoQrValue).success).toBe(false);
});
