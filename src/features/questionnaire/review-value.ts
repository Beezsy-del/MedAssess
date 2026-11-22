import { freeTextQuestions } from "./model";
/** Translate controlled choices only. Never rewrite a patient's free-text answer. */
export function reviewValue(
  value: unknown,
  path: string,
  translate: (value: string) => string,
): string {
  if (value === null || value === "") return translate("Unknown");
  if (typeof value === "boolean") return translate(value ? "yes" : "no");
  const key = path.split(".").at(-1) ?? "";
  const choice =
    [
      "assistance",
      "progression",
      "spreading",
      "status",
      "surgery",
      "similar_before",
      "hospitalised",
      "current_treatment",
      "medication_status",
      "allergy_status",
      "medication_changed",
      "medication_missed",
      "pregnancy",
    ].includes(key) ||
    /^\.(symptoms|history\.conditions)\.\d+$/.test(path) ||
    (path.startsWith(".answers.") && !freeTextQuestions.has(key));
  return choice ? translate(String(value).replaceAll("_", " ")) : String(value);
}
