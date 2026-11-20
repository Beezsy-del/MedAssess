import type { z } from "zod";
import { intakeSchema } from "@/features/commands/schema";
import type { Category, ClinicalInput } from "@/features/clinical/engine";
export type IntakeDraft = Omit<
  z.output<typeof intakeSchema>,
  "identity_confirmed" | "category" | "input"
> & {
  input: ClinicalInput;
  identity_confirmed: boolean;
  category: Category | "";
};
export function emptyIntake(operation_id: string): IntakeDraft {
  return {
    operation_id,
    name: "",
    age: null,
    date_of_birth: null,
    sex: "",
    phone: "",
    identifier: "",
    emergency_contact: "",
    unidentified: false,
    identity_confirmed: false,
    duplicate_reason: "",
    new_visit_reason: "",
    department_id: "",
    arrival_method: "",
    history: "",
    allergies: "",
    notes: "",
    category: "",
    reason: "",
    input: {
      warningSigns: [],
      symptoms: "",
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
    },
  };
}
export const categories = [
  [
    "RED",
    "Critical / emergency",
    "Immediate staff assistance and emergency assessment.",
  ],
  ["YELLOW", "Urgent assessment", "Route to the urgent assessment queue."],
  [
    "GREEN",
    "Non-immediate",
    "Route to the non-immediate care queue after human assessment.",
  ],
  [
    "ASSESSMENT_REQUIRED",
    "Assessment incomplete",
    "Keep visible for human assessment; no urgency is assumed.",
  ],
] as const;
export type IntakeReceipt = {
  id: string;
  patient_id: string;
  name: string;
  reference: string;
  category: Category;
  status: string;
  department: string;
  registered_at: string;
  confirmed_at: string;
  actor: string;
  actor_name: string;
  symptoms: string;
  reason: string;
  duplicate?: boolean;
};
