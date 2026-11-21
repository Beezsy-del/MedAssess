import { z } from "zod";
export const questionnaireVersion = "patient-intake-2.0";
export const symptoms = [
  "chest_discomfort",
  "breathing_difficulty",
  "fever",
  "bleeding",
  "injury",
  "dizziness",
  "vomiting",
  "diarrhoea",
  "fainting",
  "weakness",
  "seizure",
  "speech_vision_movement",
  "pain",
  "other",
] as const;
export const conditions = [
  "diabetes",
  "hypertension",
  "heart_disease",
  "respiratory_condition",
  "kidney_disease",
  "neurological_condition",
  "other",
] as const;
export const answer = z.enum(["yes", "no", "unknown"]);
const text = (max = 1000) => z.string().trim().max(max);
const optionalNumber = (min: number, max: number) =>
  z.number().finite().min(min).max(max).nullable();
export const reportSchema = z.strictObject({
  version: z.literal(questionnaireVersion),
  language: z.enum(["en", "kn", "hi"]),
  identity: z.strictObject({
    name: text(160),
    age: z.number().int().min(0).max(130).nullable(),
    date_of_birth: z
      .union([z.literal(""), z.iso.date()])
      .refine(
        (value) =>
          !value ||
          (value <= new Date().toISOString().slice(0, 10) &&
            Number(value.slice(0, 4)) >= new Date().getUTCFullYear() - 130),
        "Enter a valid date of birth within the supported age range.",
      ),
    sex: text(80),
    phone: text(40),
    emergency_contact: text(200),
    patient_identifier: text(100),
    assistance: z.enum(["self", "guardian", "assisted", "unknown"]),
    helper_name: text(160),
    relationship: text(80),
  }),
  symptoms: z.array(z.enum(symptoms)).max(symptoms.length),
  symptoms_complete: z.boolean(),
  complaint: text(3000),
  onset: text(200),
  progression: z.enum(["improving", "same", "worsening", "unknown"]),
  location: text(200),
  pain: optionalNumber(0, 10),
  spreading: answer,
  spread_location: text(200),
  answers: z.record(z.string().max(80), z.union([answer, text(300)])),
  history: z.strictObject({
    status: z.enum(["recorded", "none_reported", "unknown"]),
    conditions: z.array(z.enum(conditions)).max(conditions.length),
    details: text(2000),
    surgery: answer,
    surgery_details: text(),
    similar_before: answer,
    hospitalised: answer,
    current_treatment: answer,
    treatment_details: text(),
  }),
  medication_status: z.enum(["recorded", "none_reported", "unknown"]),
  medications: z
    .array(
      z.strictObject({
        name: text(160).min(1),
        dose: text(120),
        frequency: text(120),
        details: text(500),
      }),
    )
    .max(20),
  medication_changed: answer,
  medication_missed: answer,
  current_symptom_medicine: text(1000),
  allergy_status: z.enum(["recorded", "none_reported", "unknown"]),
  allergies: z
    .array(z.strictObject({ substance: text(160).min(1), reaction: text(500) }))
    .max(20),
  pregnancy: answer,
  pregnancy_details: text(500),
  access_needs: text(1000),
  additional: text(2000),
  self_reported_vitals: z.strictObject({
    pulse: optionalNumber(0, 400),
    spo2: optionalNumber(0, 100),
    respiratory_rate: optionalNumber(0, 150),
    systolic: optionalNumber(0, 350),
    temperature: optionalNumber(20, 50),
  }),
  emergency_help: z.boolean(),
  warning_signs: z.array(z.string().max(100)).max(20),
  consent: z.boolean(),
});
export type PatientReport = z.infer<typeof reportSchema>;
export function emptyReport(): PatientReport {
  return {
    version: questionnaireVersion,
    language: "en",
    identity: {
      name: "",
      age: null,
      date_of_birth: "",
      sex: "",
      phone: "",
      emergency_contact: "",
      patient_identifier: "",
      assistance: "unknown",
      helper_name: "",
      relationship: "",
    },
    symptoms: [],
    symptoms_complete: false,
    complaint: "",
    onset: "",
    progression: "unknown",
    location: "",
    pain: null,
    spreading: "unknown",
    spread_location: "",
    answers: {},
    history: {
      status: "unknown",
      conditions: [],
      details: "",
      surgery: "unknown",
      surgery_details: "",
      similar_before: "unknown",
      hospitalised: "unknown",
      current_treatment: "unknown",
      treatment_details: "",
    },
    medication_status: "unknown",
    medications: [],
    medication_changed: "unknown",
    medication_missed: "unknown",
    current_symptom_medicine: "",
    allergy_status: "unknown",
    allergies: [],
    pregnancy: "unknown",
    pregnancy_details: "",
    access_needs: "",
    additional: "",
    self_reported_vitals: {
      pulse: null,
      spo2: null,
      respiratory_rate: null,
      systolic: null,
      temperature: null,
    },
    emergency_help: false,
    warning_signs: [],
    consent: false,
  };
}
export const branches: Record<string, readonly string[]> = {
  chest_discomfort: [
    "chest_current",
    "chest_breathing",
    "chest_faintness_sweating",
    "chest_spread",
  ],
  fever: [
    "fever_duration",
    "fever_intermittent",
    "fever_chills",
    "fever_other",
  ],
  bleeding: [
    "bleeding_location",
    "bleeding_ongoing",
    "bleeding_uncontrolled",
    "bleeding_injury",
  ],
  breathing_difficulty: [
    "breathing_current",
    "breathing_worsening",
    "breathing_speech",
    "breathing_warning",
  ],
  injury: [
    "injury_cause",
    "injury_time",
    "injury_location",
    "injury_bleeding",
    "injury_unconscious",
  ],
};
export const freeTextQuestions = new Set([
  "fever_duration",
  "fever_other",
  "bleeding_location",
  "injury_cause",
  "injury_time",
  "injury_location",
]);
export function visibleQuestions(report: Pick<PatientReport, "symptoms">) {
  return report.symptoms.flatMap((s) => branches[s] ?? []);
}
export function submissionIssues(r: PatientReport): string[] {
  const issues: string[] = [];
  if (!r.consent) issues.push("Review and confirm consent before submitting.");
  if (r.complaint.trim().length < 2)
    issues.push("Describe your main concern, or ask staff for assistance.");
  if (r.identity.age !== null && r.identity.date_of_birth)
    issues.push("Use age or date of birth, not both.");
  if (r.medication_status === "recorded" && !r.medications.length)
    issues.push("Add the reported medication or choose unknown.");
  if (r.allergy_status === "recorded" && !r.allergies.length)
    issues.push("Add the reported allergy or choose unknown.");
  if (
    r.history.status === "recorded" &&
    !r.history.conditions.length &&
    !r.history.details.trim()
  )
    issues.push("Add the reported medical history or choose unknown.");
  return issues;
}
export function activeReport(r: PatientReport): PatientReport {
  const active = new Set(visibleQuestions(r));
  return {
    ...r,
    answers: Object.fromEntries(
      Object.entries(r.answers).filter(([key]) => active.has(key)),
    ),
    medications: r.medication_status === "recorded" ? r.medications : [],
    allergies: r.allergy_status === "recorded" ? r.allergies : [],
    history: {
      ...r.history,
      conditions: r.history.status === "recorded" ? r.history.conditions : [],
      details: r.history.status === "recorded" ? r.history.details : "",
    },
  };
}
