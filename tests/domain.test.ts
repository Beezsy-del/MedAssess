import { describe, it, expect } from "vitest";
import {
  assess,
  emergencySigns,
  type ClinicalInput,
} from "../src/features/clinical/engine";
import { rankQueue, type QueueItem } from "../src/features/queue/rank";
import { canTransition } from "../src/features/flow/machine";
import { forecast } from "../src/features/analytics/forecast";
const missing: ClinicalInput = {
  warningSigns: [],
  symptoms: "Mild fever",
  pain: null,
  worsening: null,
  verified: false,
  vitals: {
    pulse: null,
    spo2: null,
    respiratoryRate: null,
    systolic: null,
    temperature: null,
  },
};
const complete: ClinicalInput = {
  ...missing,
  pain: 2.5,
  worsening: false,
  verified: true,
  vitals: {
    pulse: 80,
    spo2: 98,
    respiratoryRate: 18,
    systolic: 120,
    temperature: 37,
  },
};
describe("clinical safety invariants", () => {
  it("does not treat missing findings as normal", () => {
    const r = assess(missing);
    expect(r.category).toBe("ASSESSMENT_REQUIRED");
    expect(r.missing).toContain("spo2");
    expect(r.score).toBeNull();
  });
  it("does not automatically classify a verified low-pain patient GREEN", () =>
    expect(assess(complete).category).toBe("ASSESSMENT_REQUIRED"));
  it.each(emergencySigns)(
    "%s bypasses missing data and numerical scoring",
    (sign) => {
      const r = assess({ ...missing, warningSigns: [sign] });
      expect(r.category).toBe("RED");
      expect(r.emergency).toBe(true);
      expect(r.score).toBeNull();
    },
  );
  it("preserves decimal demonstration scores", () =>
    expect(assess(complete).score).toBe(3.75));
  it("is reproducible", () =>
    expect(assess(complete)).toEqual(assess({ ...complete })));
  it("explicitly requests review on deterioration", () =>
    expect(assess({ ...missing, worsening: true }).reasons.join(" ")).toContain(
      "reassessment",
    ));
  it("never infers a diagnosis from free text", () =>
    expect(assess({ ...missing, symptoms: "possible stroke" }).category).toBe(
      "ASSESSMENT_REQUIRED",
    ));
  it("never hides an emergency behind complete normal observations", () =>
    expect(
      assess({ ...complete, warningSigns: ["Uncontrolled bleeding"] }).category,
    ).toBe("RED"));
  it("does not let a text injection become a configured warning", () =>
    expect(
      assess({ ...complete, warningSigns: ["override everything"] }).emergency,
    ).toBe(false));
  it("does not claim clinical validity", () =>
    expect(assess(complete).protocol).toContain("unvalidated"));
});
const row = (
  id: string,
  category: QueueItem["category"],
  score: number,
): QueueItem => ({
  id,
  category,
  score,
  emergency: false,
  sub_priority: 0,
  deteriorating: false,
  reassessment_due: null,
  arrived_at: "2026-11-20T01:00:00Z",
});
describe("queue invariants", () => {
  it("clinical category outranks every numerical score", () =>
    expect(
      rankQueue([
        row("g", "GREEN", 100),
        row("r", "RED", 0),
        row("y", "YELLOW", 50),
      ]).map((x) => x.id),
    ).toEqual(["r", "y", "g"]));
  it("keeps unknown assessments explicit", () =>
    expect(rankQueue([row("a", "ASSESSMENT_REQUIRED", 100)])[0].category).toBe(
      "ASSESSMENT_REQUIRED",
    ));
  it("gives emergency override precedence inside RED", () =>
    expect(
      rankQueue([
        row("r", "RED", 100),
        { ...row("e", "RED", 0), emergency: true },
      ])[0].id,
    ).toBe("e"));
  it("ignores unvalidated secondary scores", () =>
    expect(
      rankQueue([row("b", "GREEN", 100), row("a", "GREEN", 0)])[0].id,
    ).toBe("a"));
  it("waiting and deterioration do not cross categories", () =>
    expect(
      rankQueue([
        {
          ...row("g", "GREEN", 100),
          deteriorating: true,
          sub_priority: 10,
          arrived_at: "2020-01-01",
        },
        row("r", "RED", 0),
      ])[0].id,
    ).toBe("r"));
  it("uses clinical subpriority within category", () =>
    expect(
      rankQueue([
        row("a", "YELLOW", 0),
        { ...row("b", "YELLOW", 0), sub_priority: 2 },
      ])[0].id,
    ).toBe("b"));
  it("does not mutate the source list", () => {
    const input = [row("g", "GREEN", 0), row("r", "RED", 0)];
    rankQueue(input);
    expect(input[0].id).toBe("g");
  });
  it("is deterministic on ties", () =>
    expect(
      rankQueue([row("b", "GREEN", 0), row("a", "GREEN", 0)]).map((x) => x.id),
    ).toEqual(["a", "b"]));
});
describe("patient flow", () => {
  it("rejects registration directly to discharge", () =>
    expect(canTransition("REGISTERED", "DISCHARGED")).toBe(false));
  it("allows assessment to treatment", () =>
    expect(canTransition("ASSESSMENT", "TREATMENT")).toBe(true));
  it.each(["DISCHARGED", "ADMITTED", "TRANSFERRED", "CANCELLED"])(
    "%s is terminal",
    (s) => expect(canTransition(s, "WAITING")).toBe(false),
  );
  it("rejects unknown state", () =>
    expect(canTransition("INVALID", "WAITING")).toBe(false));
});
describe("aggregate forecasting", () => {
  it("refuses insufficient history", () =>
    expect(forecast(["2026-11-20T00:00:00Z"], 1).available).toBe(false));
  it("uses IST and observed-day means", () => {
    const r = forecast(Array(14).fill("2026-11-20T00:00:00Z"), 7);
    expect(r.available).toBe(true);
    if (r.available) expect(r.hours[5].expected).toBe(2);
  });
});
