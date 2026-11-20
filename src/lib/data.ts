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
export async function snapshot(hospitalId?: string) {
  const s = await session();
  if (!s) throw new Error("Sign in with an authorized hospital account.");
  const membership = selectMembership(
    s.memberships,
    hospitalId,
    (await cookies()).get(hospitalCookie)?.value,
  );
  const h = membership.hospital_id;
  await s.db.rpc("escalate_alerts", { p_hospital: h });
  const [
    hospital,
    hospitals,
    encounters,
    patients,
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
    s.db
      .from("patient_encounters")
      .select("*")
      .eq("hospital_id", h)
      .order("arrived_at", { ascending: false })
      .limit(500),
    s.db.from("patients").select("*").eq("hospital_id", h).limit(1000),
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
  ]);
  const responses = [
    hospital,
    hospitals,
    encounters,
    patients,
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
  ];
  if (responses.some((x) => x.error))
    throw new Error(
      "Hospital data could not be loaded. Retry or contact your administrator.",
    );
  return {
    userId: s.user.id,
    membership,
    memberships: s.memberships,
    hospitals: hospitals.data!,
    hospital: hospital.data!,
    encounters: encounters.data!,
    patients: patients.data!,
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
    loadedAt: new Date().toISOString(),
  };
}
export type Snapshot = Awaited<ReturnType<typeof snapshot>>;
