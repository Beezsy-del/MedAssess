import { describe, it, expect } from "vitest";
import {
  emptyReport,
  activeReport,
  visibleQuestions,
  submissionIssues,
} from "../src/features/questionnaire/model";
import {
  preliminaryAssessment,
  type ReviewedProtocol,
} from "../src/features/questionnaire/rules";
const protocol: ReviewedProtocol = {
  status: "active",
  reviewer: "synthetic-reviewer",
  approved_at: "2026-01-01T00:00:00Z",
  version: "synthetic-fixture-only",
  configuration: {
    name: "Synthetic software fixture",
    version: "synthetic-fixture-only",
    reference: "https://example.test/synthetic-not-clinical",
    rules: [
      {
        id: "synthetic_green",
        category: "GREEN",
        requires: ["symptoms", "progression"],
        all: [{ field: "progression", operator: "equals", value: "same" }],
        explanation: "Synthetic routing assertion, not medical guidance",
      },
      {
        id: "synthetic_yellow",
        category: "YELLOW",
        requires: ["progression"],
        all: [{ field: "progression", operator: "equals", value: "worsening" }],
        explanation:
          "Synthetic worsening rule, not a reviewed clinical protocol",
      },
    ],
    considerations: [],
    reassessment_minutes: {
      RED: 10,
      YELLOW: 20,
      GREEN: 30,
      ASSESSMENT_REQUIRED: 10,
    },
  },
};
describe("adaptive patient report and reviewed rule boundaries", () => {
  it("branches only on selected symptoms and removes hidden stale answers", () => {
    const r = emptyReport();
    r.symptoms = ["fever"];
    r.answers = { fever_chills: "yes", bleeding_uncontrolled: "yes" };
    expect(visibleQuestions(r)).toContain("fever_chills");
    expect(activeReport(r).answers).toEqual({ fever_chills: "yes" });
  });
  it("missing answers never generate GREEN", () => {
    const r = emptyReport();
    r.progression = "same";
    expect(preliminaryAssessment(r, protocol).category).toBe(
      "ASSESSMENT_REQUIRED",
    );
  });
  it("requires reviewed active configuration", () => {
    const r = emptyReport();
    r.progression = "worsening";
    expect(preliminaryAssessment(r, null).category).toBe("ASSESSMENT_REQUIRED");
    expect(
      preliminaryAssessment(r, { ...protocol, reviewer: null }).category,
    ).toBe("ASSESSMENT_REQUIRED");
  });
  it("emergency assistance bypasses completeness and protocol configuration", () => {
    const r = emptyReport();
    r.emergency_help = true;
    expect(preliminaryAssessment(r, null).category).toBe("RED");
  });
  it("evaluates explicit synthetic criteria and never silently downgrades", () => {
    const r = emptyReport();
    r.symptoms_complete = true;
    r.progression = "same";
    expect(preliminaryAssessment(r, protocol).category).toBe("GREEN");
    r.progression = "worsening";
    expect(preliminaryAssessment(r, protocol, "GREEN").category).toBe("YELLOW");
    r.progression = "same";
    expect(preliminaryAssessment(r, protocol, "RED").category).toBe("RED");
  });
  it("requires review consent and preserves unknown medication/allergy status", () => {
    const r = emptyReport();
    expect(submissionIssues(r).length).toBeGreaterThan(0);
    expect(r.allergy_status).toBe("unknown");
    expect(r.medication_status).toBe("unknown");
  });
});
