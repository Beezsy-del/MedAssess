import { describe, it, expect } from "vitest";
import { compatibility } from "@/features/beds/model";
import { actionSchemas } from "@/features/commands/schema";
import type { Row } from "@/lib/data";
const bed = {
  kind: "Emergency bed",
  status: "AVAILABLE",
} as Row<"hospital_resources">;
const profile = {
  verified: true,
  capabilities: ["oxygen", "cardiac_monitor"],
} as Row<"bed_profiles">;
const ward = {
  id: "ward-a",
  zone: "high",
  categories: ["RED", "YELLOW"],
} as Row<"bed_wards">;
const plan = {
  decision: "BED_REQUIRED",
  ward_id: "ward-a",
  bed_kind: "Emergency bed",
  required_capabilities: ["oxygen"],
  encounter_version: 3,
} as Row<"bed_placement_plans">;
const encounter = {
  version: 3,
  category: "YELLOW",
  status: "WAITING",
} as Row<"patient_encounters">;
describe("bed suitability is independent of availability", () => {
  it("matches all explicitly reviewed requirements", () =>
    expect(compatibility(bed, profile, ward, plan, encounter)).toEqual([]));
  it("never assumes missing requirements are normal", () =>
    expect(
      compatibility(bed, profile, ward, undefined, encounter).length,
    ).toBeGreaterThan(0));
  it("rejects a free bed in the wrong ward", () =>
    expect(
      compatibility(bed, profile, { ...ward, id: "other" }, plan, encounter),
    ).toContain("Different ward / care level."));
  it("rejects missing isolation and monitoring equipment", () =>
    expect(
      compatibility(
        bed,
        profile,
        ward,
        { ...plan, required_capabilities: ["isolation", "ventilator"] },
        encounter,
      ),
    ).toHaveLength(2));
  it("requires current assessment and verified capability inventory", () =>
    expect(
      compatibility(bed, { ...profile, verified: false }, ward, plan, {
        ...encounter,
        version: 4,
      }),
    ).toHaveLength(2));
  it("does not infer placement for unassessed patients", () =>
    expect(
      compatibility(bed, profile, ward, plan, {
        ...encounter,
        category: "ASSESSMENT_REQUIRED",
      }).length,
    ).toBeGreaterThan(0));
  it("rejects incorrect type and closed encounter", () =>
    expect(
      compatibility({ ...bed, kind: "General bed" }, profile, ward, plan, {
        ...encounter,
        status: "DISCHARGED",
      }),
    ).toHaveLength(2));
  it("requires explicit confirmation and current review/bed versions in API contract", () => {
    const id = "10000000-0000-4000-8000-000000000001";
    const valid = {
      operation_id: id,
      encounter_id: id,
      resource_id: id,
      version: 1,
      bed_version: 1,
      plan_reviewed_at: "2026-11-21T00:00:00Z",
      expected_reservation_id: "",
      confirmed: true,
      reassign: false,
      hold: false,
      reason: "Reviewed synthetic placement",
    };
    expect(actionSchemas.bed_assign.safeParse(valid).success).toBe(true);
    expect(
      actionSchemas.bed_assign.safeParse({ ...valid, confirmed: false })
        .success,
    ).toBe(false);
    expect(
      actionSchemas.bed_assign.safeParse({ ...valid, bed_version: undefined })
        .success,
    ).toBe(false);
    expect(
      actionSchemas.bed_assign.safeParse({
        ...valid,
        plan_reviewed_at: undefined,
      }).success,
    ).toBe(false);
  });
});
