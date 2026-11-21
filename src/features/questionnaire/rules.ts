import { z } from "zod";
import type { Category } from "@/features/clinical/engine";
import type { PatientReport } from "./model";
export const ruleFields = [
  "symptoms",
  "symptoms_complete",
  "progression",
  "pain",
  "onset",
  "history.conditions",
  "history.status",
  "medication_status",
  "allergy_status",
  "pregnancy",
  "answers.chest_current",
  "answers.chest_breathing",
  "answers.chest_faintness_sweating",
  "answers.chest_spread",
  "answers.bleeding_ongoing",
  "answers.bleeding_uncontrolled",
  "answers.breathing_current",
  "answers.breathing_worsening",
  "answers.breathing_speech",
  "answers.breathing_warning",
  "answers.injury_unconscious",
  "self_reported_vitals.pulse",
  "self_reported_vitals.spo2",
  "self_reported_vitals.respiratory_rate",
  "self_reported_vitals.systolic",
  "self_reported_vitals.temperature",
] as const;
const predicate = z.strictObject({
  field: z.enum(ruleFields),
  operator: z.enum(["equals", "contains", "gte", "lte"]),
  value: z.union([z.string().max(200), z.number().finite(), z.boolean()]),
});
export const protocolSchema = z.strictObject({
  name: z.string().trim().min(3).max(160),
  version: z.string().trim().min(1).max(60),
  reference: z.string().url().max(1000),
  rules: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9_-]{1,60}$/),
        category: z.enum(["RED", "YELLOW", "GREEN"]),
        explanation: z.string().trim().min(10).max(1000),
        requires: z.array(z.enum(ruleFields)).min(1).max(40),
        all: z.array(predicate).min(1).max(20),
      }),
    )
    .max(30),
  considerations: z
    .array(
      z.strictObject({
        label: z.string().trim().min(3).max(200),
        symptoms: z.array(z.string().max(80)).min(1).max(14),
        limitations: z.string().trim().min(10).max(1000),
        reference: z.string().url().max(1000),
      }),
    )
    .max(20),
  reassessment_minutes: z.strictObject({
    RED: z.number().int().min(1).max(240),
    YELLOW: z.number().int().min(1).max(240),
    GREEN: z.number().int().min(1).max(240),
    ASSESSMENT_REQUIRED: z.number().int().min(1).max(240),
  }),
});
export type ProtocolConfiguration = z.infer<typeof protocolSchema>;
export type ReviewedProtocol = {
  configuration: ProtocolConfiguration;
  status: string;
  reviewer: string | null;
  approved_at: string | null;
  version: string;
};
export function fieldValue(report: PatientReport, path: string): unknown {
  let v: unknown = report;
  for (const part of path.split(".")) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
    v = (v as Record<string, unknown>)[part];
  }
  return v;
}
export function known(value: unknown) {
  return (
    value !== undefined && value !== null && value !== "" && value !== "unknown"
  );
}
const severity: Record<Category, number> = {
  ASSESSMENT_REQUIRED: 0,
  GREEN: 1,
  YELLOW: 2,
  RED: 3,
};
export function preliminaryAssessment(
  report: PatientReport,
  protocol: ReviewedProtocol | null,
  previous: Category = "ASSESSMENT_REQUIRED",
) {
  const result = {
    category: previous,
    protocol: protocol?.version ?? "human-review-required",
    matched: [] as string[],
    reasons: [] as string[],
    missing: [] as string[],
    requiresReview: true,
  };
  if (report.emergency_help || report.warning_signs.length) {
    return {
      ...result,
      category: "RED" as Category,
      reasons: [
        "Emergency assistance requested or warning reported. Alert nearby staff immediately; human assessment is required.",
      ],
      protocol: "emergency-assistance-override",
    };
  }
  if (
    !protocol ||
    protocol.status !== "active" ||
    !protocol.reviewer ||
    !protocol.approved_at
  ) {
    result.reasons.push(
      "No reviewed active protocol is available. Human assessment is required.",
    );
    return result;
  }
  for (const rule of protocol.configuration.rules) {
    const absent = rule.requires.filter((f) => !known(fieldValue(report, f)));
    // A known empty symptom selection requires explicit completion, never an unchecked default.
    if (rule.requires.includes("symptoms") && !report.symptoms_complete)
      absent.push("symptoms_complete");
    if (absent.length) {
      result.missing.push(...absent);
      continue;
    }
    const matches = rule.all.every((p) => {
      const v = fieldValue(report, p.field);
      if (!known(v)) return false;
      if (p.operator === "equals") return v === p.value;
      if (p.operator === "contains")
        return Array.isArray(v) && v.includes(p.value);
      return (
        typeof v === "number" &&
        typeof p.value === "number" &&
        (p.operator === "gte" ? v >= p.value : v <= p.value)
      );
    });
    if (matches) {
      result.matched.push(rule.id);
      result.reasons.push(rule.explanation);
      if (severity[rule.category] > severity[result.category])
        result.category = rule.category;
    }
  }
  result.missing = [...new Set(result.missing)];
  if (!result.matched.length)
    result.reasons.push(
      "No reviewed rule matched complete information. Human assessment is required.",
    );
  if (report.progression === "worsening")
    result.reasons.push(
      "Symptoms are worsening: clinical reassessment is required.",
    );
  return result;
}
export function clinicalConsiderations(
  report: PatientReport | null,
  protocol: ReviewedProtocol | null,
) {
  if (
    !report ||
    !protocol ||
    protocol.status !== "active" ||
    !protocol.reviewer ||
    !protocol.approved_at
  )
    return [];
  return protocol.configuration.considerations.filter((c) =>
    c.symptoms.every((s) =>
      report.symptoms.includes(s as PatientReport["symptoms"][number]),
    ),
  );
}
