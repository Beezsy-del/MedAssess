import type { Row } from "@/lib/data";
export const capabilities = [
  "oxygen",
  "cardiac_monitor",
  "ventilator",
  "isolation",
  "negative_pressure",
  "accessible",
] as const;
export const bedKinds = ["General bed", "Emergency bed", "ICU bed"] as const;
export const bedStatuses = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "CLEANING",
  "MAINTENANCE",
  "BLOCKED",
] as const;
export const zones = {
  critical: "Critical care",
  high: "High acuity",
  standard: "Treatment & observation",
  ambulatory: "Low acuity / ambulatory",
  unconfigured: "Unconfigured",
} as const;
export const label = (s: string) => s.replaceAll("_", " ").toLowerCase();
export function compatibility(
  bed: Row<"hospital_resources">,
  profile: Row<"bed_profiles"> | undefined,
  ward: Row<"bed_wards"> | undefined,
  plan: Row<"bed_placement_plans"> | undefined,
  encounter: Row<"patient_encounters"> | undefined,
): string[] {
  const reasons: string[] = [];
  if (!encounter || !plan || plan.decision !== "BED_REQUIRED")
    return ["Review and save patient placement requirements first."];
  if (plan.encounter_version !== encounter.version)
    reasons.push("Assessment changed. Review placement requirements again.");
  if (["DISCHARGED", "TRANSFERRED", "CANCELLED"].includes(encounter.status))
    reasons.push("Encounter is closed.");
  if (!profile?.verified || !ward || ward.zone === "unconfigured")
    reasons.push("Bed capabilities have not been verified.");
  if (plan.ward_id !== ward?.id) reasons.push("Different ward / care level.");
  if (
    !ward?.categories.includes(encounter.category) ||
    encounter.category === "ASSESSMENT_REQUIRED"
  )
    reasons.push("Ward does not support the confirmed triage category.");
  if (plan.bed_kind !== bed.kind) reasons.push("Different bed type.");
  for (const c of plan.required_capabilities)
    if (!profile?.capabilities.includes(c))
      reasons.push(`Missing ${label(c)}.`);
  return reasons;
}
