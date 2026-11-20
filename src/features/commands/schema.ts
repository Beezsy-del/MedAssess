import { z } from "zod";
import { emergencySigns } from "@/features/clinical/engine";
const uuid = z.uuid();
const text = (max = 3000) => z.string().trim().max(max);
const reason = text().min(5);
const optionalId = z.union([uuid, z.literal(""), z.null()]).optional();
const integer = (min: number, max: number) =>
  z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .pipe(z.number().int().min(min).max(max));
const encounter = {
  encounter_id: uuid,
  version: integer(1, 2147483647).optional(),
};
export const resourceKinds = [
  "General bed",
  "Emergency bed",
  "ICU bed",
  "Stretcher",
  "Wheelchair",
  "Equipment",
] as const;
export const clinicalInput = z.strictObject({
  warningSigns: z.array(z.enum(emergencySigns)).max(emergencySigns.length),
  symptoms: text(),
  pain: z.number().min(0).max(10).nullable(),
  worsening: z.boolean().nullable(),
  verified: z.boolean(),
  vitals: z.strictObject({
    pulse: z.number().min(0).max(400).nullable(),
    spo2: z.number().min(0).max(100).nullable(),
    respiratoryRate: z.number().min(0).max(150).nullable(),
    systolic: z.number().min(0).max(350).nullable(),
    temperature: z.number().min(20).max(50).nullable(),
  }),
});
const isoDate = z.iso.datetime({ offset: true });
export const assessmentSchema = z
  .strictObject({
    ...encounter,
    category: z.enum(["RED", "YELLOW", "GREEN", "ASSESSMENT_REQUIRED"]),
    reason,
    input: clinicalInput,
  })
  .refine(
    (v) => v.category === "ASSESSMENT_REQUIRED" || v.input.verified,
    "Human verification required",
  );

export const intakeSchema = z
  .strictObject({
    operation_id: uuid,
    patient_id: uuid.optional(),
    encounter_id: uuid.optional(),
    version: integer(1, 2147483647).optional(),
    name: text(160),
    age: integer(0, 130).nullable(),
    date_of_birth: z.iso.date().nullable(),
    sex: text(40),
    phone: text(40),
    identifier: text(80),
    emergency_contact: text(300),
    unidentified: z.boolean(),
    identity_confirmed: z.literal(true),
    duplicate_reason: text(1000),
    new_visit_reason: text(1000),
    department_id: optionalId,
    arrival_method: text(100),
    history: text(3000),
    allergies: text(1000),
    notes: text(3000),
    category: z.enum(["RED", "YELLOW", "GREEN", "ASSESSMENT_REQUIRED"]),
    reason,
    input: clinicalInput,
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (!v.patient_id && !v.unidentified && !v.name)
      issue("name", "Enter a name or choose unidentified patient.");
    if (v.encounter_id && (!v.patient_id || !v.version))
      issue("encounter_id", "Choose the patient and current encounter.");
    if (v.category !== "ASSESSMENT_REQUIRED" && !v.input.verified)
      issue("input", "Confirm the human assessment before assigning priority.");
    if (
      v.date_of_birth &&
      (v.date_of_birth > new Date().toISOString().slice(0, 10) ||
        Number(v.date_of_birth.slice(0, 4)) < new Date().getUTCFullYear() - 130)
    )
      issue(
        "date_of_birth",
        "Enter a valid date of birth within the supported age range.",
      );
    if (v.date_of_birth && v.age !== null)
      issue("age", "Enter date of birth or age, not both.");
  });
export const actionSchemas = {
  intake: intakeSchema,
  register: z.strictObject({
    operation_id: uuid,
    patient_id: uuid.optional(),
    name: text(160).optional(),
    age: integer(0, 130).nullable().optional(),
    sex: text(40).nullable().optional(),
    phone: text(40).nullable().optional(),
    symptoms: text().nullable().optional(),
    department_id: optionalId,
    unidentified: z.boolean().optional(),
    emergency: z.boolean().optional(),
  }),
  assess: assessmentSchema,
  transition: z
    .strictObject({
      ...encounter,
      status: z.enum([
        "REGISTERED",
        "TRIAGE_PENDING",
        "TRIAGE_COMPLETED",
        "WAITING",
        "STAFF_ASSIGNED",
        "ASSESSMENT",
        "DIAGNOSTICS",
        "TREATMENT",
        "DISPOSITION",
        "DISCHARGED",
        "ADMITTED",
        "REFERRED",
        "TRANSFERRED",
        "CANCELLED",
      ]),
      reason,
      assigned_to: optionalId,
    })
    .refine(
      (v) => v.status !== "STAFF_ASSIGNED" || !!v.assigned_to,
      "Assign a clinician",
    ),
  note: z.strictObject({
    ...encounter,
    kind: z.enum(["Assessment", "Treatment", "Investigation", "Handover"]),
    note: text(5000).min(5),
  }),
  reserve: z.strictObject({ ...encounter, resource_id: uuid }),
  release: z.strictObject({ resource_id: uuid }),
  alert: z
    .strictObject({
      id: uuid,
      status: z.enum(["ACKNOWLEDGED", "IN_PROGRESS", "ESCALATED", "RESOLVED"]),
      reason: text().nullable().optional(),
    })
    .refine(
      (v) => v.status !== "RESOLVED" || (v.reason?.length ?? 0) >= 5,
      "Resolution required",
    ),
  referral: z.strictObject({
    ...encounter,
    facility_id: uuid,
    reason,
    summary: text(5000).min(5),
    transport: text(300).min(1),
  }),
  referral_status: z.strictObject({
    ...encounter,
    id: uuid,
    status: z.enum([
      "CONTACTED",
      "ACCEPTED",
      "DEPARTED",
      "ARRIVED",
      "COMPLETED",
    ]),
    reason,
  }),
  token: z.strictObject(encounter),
  settings: z.strictObject({
    reassessment_minutes: integer(1, 240),
    alert_minutes: integer(1, 60),
  }),
  department: z.strictObject({
    name: text(160).min(1),
    location: text(300),
    capacity: integer(1, 100000),
  }),
  resource: z.strictObject({
    name: text(160).min(1),
    location: text(300),
    kind: z.enum(resourceKinds),
  }),
  facility: z.strictObject({
    name: text(160).min(1),
    contact: text(300).min(1),
    services: text(1000).min(1),
  }),
  shift: z
    .strictObject({ user_id: uuid, starts_at: isoDate, ends_at: isoDate })
    .refine(
      (v) => Date.parse(v.ends_at) > Date.parse(v.starts_at),
      "Shift end must follow start",
    ),
  reassessment: z.strictObject({ ...encounter, reason }),
  subpriority: z.strictObject({
    ...encounter,
    reason,
    sub_priority: integer(0, 10),
  }),
  shortage: z.strictObject({
    ...encounter,
    reason,
    kind: z.enum(resourceKinds),
  }),
  maintenance: z.strictObject({ resource_id: uuid, reason }),
  follow_up: z.strictObject({ ...encounter, reason, due_at: isoDate }),
} as const;
export const commandEnvelope = z.strictObject({
  hospital: uuid,
  action: z.enum(
    Object.keys(actionSchemas) as [
      keyof typeof actionSchemas,
      ...Array<keyof typeof actionSchemas>,
    ],
  ),
  data: z.unknown(),
});
