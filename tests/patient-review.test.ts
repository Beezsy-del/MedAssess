import { expect, it } from "vitest";
import { reviewValue } from "../src/features/questionnaire/review-value";
it("preserves patient names, medicine names and free text verbatim", () => {
  const translate = (value: string) => `translated:${value}`;
  for (const path of [
    ".identity.name",
    ".medications.0.name",
    ".complaint",
    ".answers.fever_other",
    ".identity.sex",
  ]) {
    expect(reviewValue("same_name", path, translate)).toBe("same_name");
    expect(reviewValue("unknown", path, translate)).toBe("unknown");
  }
  expect(reviewValue("none_reported", ".allergy_status", translate)).toBe(
    "translated:none reported",
  );
  expect(reviewValue("heart_disease", ".history.conditions.0", translate)).toBe(
    "translated:heart disease",
  );
  expect(reviewValue("yes", ".answers.chest_current", translate)).toBe(
    "translated:yes",
  );
  expect(reviewValue(null, ".identity.age", translate)).toBe(
    "translated:Unknown",
  );
});
