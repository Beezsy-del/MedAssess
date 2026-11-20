import "server-only";
import { cookies } from "next/headers";
import { hospitalCookie, selectMembership } from "./hospital-selection";
import { serverClient } from "./supabase/server";
import type { Database } from "./supabase/database.types";
export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export async function session() {
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: memberships, error } = await db
    .from("hospital_memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true);
  if (error || !memberships?.length) return null;
  return { db, user, memberships };
}
export class AuthenticationRequiredError extends Error {}
export async function snapshot(hospitalId?: string) {
  const s = await session();
  if (!s)
    throw new AuthenticationRequiredError(
      "Sign in with an authorized hospital account.",
    );
  const membership = selectMembership(
    s.memberships,
    hospitalId,
    (await cookies()).get(hospitalCookie)?.value,
  );
  const h = membership.hospital_id;
  if (
    [
      "nurse",
      "triage_nurse",
      "doctor",
      "resource_manager",
      "emergency_coordinator",
      "hospital_admin",
      "super_admin",
    ].includes(membership.role)
  ) {
    const beds = await s.db.rpc("staff_command", {
      p_hospital: h,
      p_action: "bed_refresh",
      p_data: {},
    });
    if (beds.error) throw new Error("Bed availability could not be refreshed.");
  }
  const escalation = await s.db.rpc("escalate_alerts", { p_hospital: h });
  if (escalation.error)
    throw new Error(
      "Unable to refresh reassessment and alert tasks. Contact staff directly.",
    );
  const [
    hospital,
    hospitals,
    encounters,
    departments,
    notifications,
    resources,
    reservations,
    staff,
    facilities,
    referrals,
    events,
    assessments,
    notes,
    audit,
    settings,
    protocols,
    shifts,
    vitals,
    reassessments,
    shortages,
    followUps,
    wards,
    bedProfiles,
    bedPlans,
    bedEvents,
  ] = await Promise.all([
    s.db.from("hospitals").select("*").eq("id", h).single(),
    s.db
      .from("hospitals")
      .select("id, name")
      .in(
        "id",
        s.memberships.map((m) => m.hospital_id),
      )
      .order("name"),
    (async () => {
      const active: Row<"patient_encounters">[] = [];
      // Stable key ordering and count verification prevent silent queue truncation.
      for (let offset = 0; offset <= 10000; offset += 500) {
        const page = await s.db
          .from("patient_encounters")
          .select("*")
          .eq("hospital_id", h)
          .not("status", "in", "(DISCHARGED,TRANSFERRED,CANCELLED)")
          .order("id")
          .range(offset, offset + 499);
        if (page.error) throw new Error("Active queue unavailable.");
        active.push(...page.data);
        if (active.length > 10000)
          throw new Error(
            "Queue exceeds supported demo capacity. Use manual coordination.",
          );
        if (page.data.length < 500) break;
      }
      const closed = await s.db
        .from("patient_encounters")
        .select("*")
        .eq("hospital_id", h)
        .in("status", ["DISCHARGED", "TRANSFERRED", "CANCELLED"])
        .order("arrived_at", { ascending: false })
        .limit(500);
      return { data: [...active, ...(closed.data ?? [])], error: closed.error };
    })(),
    s.db.from("departments").select("*").eq("hospital_id", h),
    s.db
      .from("notifications")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(200),
    s.db.from("hospital_resources").select("*").eq("hospital_id", h),
    s.db
      .from("resource_reservations")
      .select("*")
      .eq("hospital_id", h)
      .is("released_at", null),
    s.db.from("hospital_memberships").select("*").eq("hospital_id", h),
    s.db.from("referral_facilities").select("*").eq("hospital_id", h),
    s.db.from("referrals").select("*").eq("hospital_id", h),
    s.db
      .from("patient_status_events")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(1000),
    s.db
      .from("triage_assessments")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("treatment_records")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("audit_logs")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(200),
    s.db.from("hospital_settings").select("*").eq("hospital_id", h).single(),
    s.db.from("triage_protocol_versions").select("*").eq("hospital_id", h),
    s.db.from("staff_shifts").select("*").eq("hospital_id", h),
    s.db
      .from("vital_signs")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("reassessment_records")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("resource_shortages")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("follow_up_records")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(500),
    s.db
      .from("bed_wards")
      .select("*")
      .eq("hospital_id", h)
      .order("display_order"),
    s.db.from("bed_profiles").select("*").eq("hospital_id", h),
    s.db.from("bed_placement_plans").select("*").eq("hospital_id", h),
    s.db
      .from("bed_allocation_events")
      .select("*")
      .eq("hospital_id", h)
      .order("created_at", { ascending: false })
      .limit(300),
  ]);
  const responses = [
    hospital,
    hospitals,
    encounters,
    departments,
    notifications,
    resources,
    reservations,
    staff,
    facilities,
    referrals,
    events,
    assessments,
    notes,
    audit,
    settings,
    protocols,
    shifts,
    vitals,
    reassessments,
    shortages,
    followUps,
    wards,
    bedProfiles,
    bedPlans,
    bedEvents,
  ];
  if (responses.some((x) => x.error))
    throw new Error(
      "Hospital data could not be loaded. Retry or contact your administrator.",
    );
  const patientIds = [...new Set(encounters.data!.map((e) => e.patient_id))];
  const patients: Row<"patients">[] = [];
  for (let offset = 0; offset < patientIds.length; offset += 200) {
    const page = await s.db
      .from("patients")
      .select("*")
      .eq("hospital_id", h)
      .in("id", patientIds.slice(offset, offset + 200));
    if (page.error) throw new Error("Encounter patient details unavailable.");
    patients.push(...page.data);
  }
  return {
    coverage:
      "All active encounters (demo ceiling 10,000), latest 500 closed encounters. History and reports are bounded snapshots, not complete longitudinal exports.",
    userId: s.user.id,
    membership,
    memberships: s.memberships,
    hospitals: hospitals.data!,
    hospital: hospital.data!,
    encounters: encounters.data!,
    patients,
    departments: departments.data!,
    notifications: notifications.data!,
    resources: resources.data!,
    reservations: reservations.data!,
    staff: staff.data!,
    facilities: facilities.data!,
    referrals: referrals.data!,
    events: events.data!,
    assessments: assessments.data!,
    notes: notes.data!,
    audit: audit.data!,
    settings: settings.data!,
    protocols: protocols.data!,
    shifts: shifts.data!,
    vitals: vitals.data!,
    reassessments: reassessments.data!,
    shortages: shortages.data!,
    followUps: followUps.data!,
    wards: wards.data!,
    bedProfiles: bedProfiles.data!,
    bedPlans: bedPlans.data!,
    bedEvents: bedEvents.data!,
    loadedAt: new Date().toISOString(),
  };
}
export type Snapshot = Awaited<ReturnType<typeof snapshot>>;
