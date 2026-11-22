"use client";
import { reviewValue } from "./review-value";
import type { PatientReport } from "./model";
import { activeReport } from "./model";
import { questionLabels } from "./question-labels";
import { usePatientCopy } from "./language";
export function PatientReview({ report }: { report: PatientReport }) {
  const t = usePatientCopy();
  const clean = activeReport(report);
  function entries(value: unknown, path = ""): React.ReactNode {
    if (value && typeof value === "object" && !Array.isArray(value))
      return (
        <dl>
          {Object.entries(value)
            .filter(
              ([key]) => !["version", "consent", "language"].includes(key),
            )
            .map(([key, item]) => (
              <div key={`${path}.${key}`}>
                <dt>
                  {t(
                    questionLabels[key] ??
                      fieldLabels[key] ??
                      key.replaceAll("_", " "),
                  )}
                </dt>
                <dd>{entries(item, `${path}.${key}`)}</dd>
              </div>
            ))}
        </dl>
      );
    if (Array.isArray(value))
      return value.length ? (
        <ul>
          {value.map((item, i) => (
            <li key={i}>{entries(item, `${path}.${i}`)}</li>
          ))}
        </ul>
      ) : (
        t("Unknown")
      );
    return reviewValue(value, path, t);
  }
  return (
    <details open className="patient-review">
      <summary>{t("Complete review")}</summary>
      {entries(clean)}
    </details>
  );
}

const fieldLabels: Record<string, string> = {
  identity: "About you",
  name: "Name",
  age: "Age, if known",
  date_of_birth: "Or date of birth",
  symptoms: "Your symptoms",
  complaint: "Main concern",
  onset: "When did it start?",
  progression: "How has it changed?",
  history: "Medical history",
  medications: "Medicines",
  allergies: "Allergies",
  additional: "Additional information",
  dose: "Dose, if known",
  frequency: "Frequency, if known",
  reaction: "Reaction, if known",
  self_reported_vitals: "Patient-reported measurements",
  emergency_help: "Immediate help requested",
  medication_status: "Medication information",
  allergy_status: "Allergy information",
  symptoms_complete: "Symptom selection reviewed",
  consent: "Consent",
  answers: "Symptom details",
};
