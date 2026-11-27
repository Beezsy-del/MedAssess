import type { Row } from "@/lib/data";
import type { Json } from "@/lib/supabase/database.types";
import type { Category } from "@/features/clinical/engine";
export type DepartmentReferral = {
  id: string;
  hospital_id: string;
  encounter_id: string;
  from_department_id: string | null;
  to_department_id: string;
  kind: "OPD" | "REFERRAL";
  urgency: Category;
  reason: string;
  observations: string;
  requested_by: string;
  status: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};
export type WorkspaceRows = {
  hospital: Row<"hospitals">;
  settings: Row<"hospital_settings">;
  encounters: Row<"patient_encounters">[];
  patients: Row<"patients">[];
  departments: (Row<"departments"> & {
    outpatient: boolean;
    accepted_categories: Category[];
    routing_reviewed_by: string | null;
    routing_reviewed_at: string | null;
  })[];
  notifications: Row<"notifications">[];
  resources: (Row<"hospital_resources"> & {
    status_updated_at: string | null;
  })[];
  reservations: Row<"resource_reservations">[];
  staff: Row<"hospital_memberships">[];
  facilities: Row<"referral_facilities">[];
  referrals: Row<"referrals">[];
  events: Row<"patient_status_events">[];
  assessments: Row<"triage_assessments">[];
  notes: Row<"treatment_records">[];
  audit: Row<"audit_logs">[];
  protocols: Row<"triage_protocol_versions">[];
  shifts: Row<"staff_shifts">[];
  vitals: Row<"vital_signs">[];
  reassessments: Row<"reassessment_records">[];
  shortages: Row<"resource_shortages">[];
  followUps: Row<"follow_up_records">[];
  wards: Row<"bed_wards">[];
  bedProfiles: Row<"bed_profiles">[];
  bedPlans: Row<"bed_placement_plans">[];
  bedEvents: Row<"bed_allocation_events">[];
  patientReports: {
    id: string;
    encounter_id: string;
    submitted_at: string;
    answers: Json;
    source: string;
    previous_report_id: string | null;
  }[];
  preliminaryAssessments: {
    id: string;
    encounter_id: string;
    report_id: string | null;
    category: Category;
    previous_category: Category;
    protocol_version: string;
    reasons: Json;
    missing: Json;
    created_at: string;
  }[];
  departmentReferrals: DepartmentReferral[];
  departmentReferralEvents: {
    id: string;
    referral_id: string;
    encounter_id: string;
    actor: string;
    status: string;
    reason: string;
    created_at: string;
  }[];
  departmentMemberships: {
    hospital_id: string;
    user_id: string;
    department_id: string;
    assigned_by: string;
    created_at: string;
  }[];
  resourceRequests: {
    id: string;
    encounter_id: string;
    kind: string;
    reason: string;
    status: string;
    created_at: string;
    updated_at: string;
    acknowledged_by: string | null;
    reservation_id: string | null;
  }[];
  census: {
    critical?: number;
    urgent?: number;
    waiting?: number;
    awaiting_admission?: number;
  };
  directory_truncated: boolean;
};
