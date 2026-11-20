import { randomUUID } from "node:crypto";
export async function bedRows(db, hospital) {
  const [resources, profiles, wards] = await Promise.all(
    ["hospital_resources", "bed_profiles", "bed_wards"].map((t) =>
      db.from(t).select("*").eq("hospital_id", hospital),
    ),
  );
  for (const r of [resources, profiles, wards])
    if (r.error) throw new Error(r.error.message);
  return {
    resources: resources.data,
    profiles: profiles.data,
    wards: wards.data,
  };
}
export async function prepareBed(
  db,
  hospital,
  encounterId,
  bed,
  required = [],
) {
  const { data: e, error } = await db
    .from("patient_encounters")
    .select("*")
    .eq("id", encounterId)
    .single();
  if (error) throw error;
  const { data: p } = await db
    .from("bed_profiles")
    .select("*")
    .eq("resource_id", bed.id)
    .single();
  return db.rpc("staff_command", {
    p_hospital: hospital,
    p_action: "bed_plan",
    p_data: {
      operation_id: randomUUID(),
      encounter_id: e.id,
      version: e.version,
      decision: "BED_REQUIRED",
      ward_id: p.ward_id,
      bed_kind: bed.kind,
      required_capabilities: required,
      reason: "Synthetic placement requirements reviewed",
      reviewed: true,
    },
  });
}
export async function bedAction(
  db,
  hospital,
  action,
  bedId,
  encounterId,
  extra = {},
) {
  const { data: b, error } = await db
    .from("hospital_resources")
    .select("*")
    .eq("id", bedId)
    .single();
  if (error) throw error;
  const payload = {
    operation_id: randomUUID(),
    resource_id: b.id,
    bed_version: b.version,
    reason: "Synthetic bed checks and handover",
    ...extra,
  };
  if (encounterId) {
    const { data: e } = await db
      .from("patient_encounters")
      .select("*")
      .eq("id", encounterId)
      .single();
    Object.assign(payload, { encounter_id: e.id, version: e.version });
  }
  if (action === "bed_assign") {
    const { data: plan } = await db
      .from("bed_placement_plans")
      .select("reviewed_at")
      .eq("encounter_id", encounterId)
      .maybeSingle();
    const { data: current } = await db
      .from("resource_reservations")
      .select("id")
      .eq("encounter_id", encounterId)
      .eq("is_bed", true)
      .is("released_at", null)
      .maybeSingle();
    payload.plan_reviewed_at = plan?.reviewed_at ?? new Date(0).toISOString();
    payload.expected_reservation_id = current?.id ?? "";
  }
  return db.rpc("staff_command", {
    p_hospital: hospital,
    p_action: action,
    p_data: payload,
  });
}
