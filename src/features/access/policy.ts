export const staffRoles = [
  "receptionist",
  "triage_nurse",
  "nurse",
  "doctor",
  "resource_manager",
  "emergency_coordinator",
  "hospital_admin",
  "super_admin",
] as const;
export type StaffRole = (typeof staffRoles)[number];
export const clinicalRoles: readonly string[] = [
  "nurse",
  "triage_nurse",
  "doctor",
];
export const registrationRoles: readonly string[] = [
  "receptionist",
  "nurse",
  "triage_nurse",
];
export const administratorRoles: readonly string[] = [
  "hospital_admin",
  "super_admin",
];
const common = ["dashboard", "settings", "notifications"];
const routes: Record<StaffRole, readonly string[]> = {
  receptionist: [...common, "reception", "patients"],
  nurse: [
    ...common,
    "nurse",
    "registration",
    "reception",
    "triage",
    "queues",
    "encounters",
    "smartflow",
    "resources",
    "beds",
    "referrals",
    "emergency-center",
  ],
  triage_nurse: [
    ...common,
    "nurse",
    "registration",
    "reception",
    "triage",
    "queues",
    "encounters",
    "smartflow",
    "resources",
    "beds",
    "referrals",
    "emergency-center",
  ],
  doctor: [
    ...common,
    "doctor",
    "queues",
    "encounters",
    "smartflow",
    "resources",
    "beds",
    "referrals",
    "emergency-center",
    "protocols",
  ],
  resource_manager: [...common, "resources", "beds", "patients"],
  emergency_coordinator: [
    ...common,
    "queues",
    "encounters",
    "emergency-center",
    "smartflow",
    "resources",
    "beds",
    "referrals",
  ],
  hospital_admin: [
    ...common,
    "patients",
    "resources",
    "beds",
    "departments",
    "staff",
    "analytics",
    "forecasting",
    "audit",
  ],
  super_admin: [
    ...common,
    "patients",
    "resources",
    "beds",
    "departments",
    "staff",
    "analytics",
    "forecasting",
    "audit",
  ],
};
export function canVisit(role: string, path: string): boolean {
  if (!staffRoles.includes(role as StaffRole)) return false;
  const [route, detail] = path.replace(/^\//, "").split("/");
  if (!routes[role as StaffRole].includes(route)) return false;
  if (route === "settings" && detail && detail !== "profile")
    return administratorRoles.includes(role);
  return true;
}
export function canRegister(role: string) {
  return registrationRoles.includes(role);
}
export function isClinical(role: string) {
  return clinicalRoles.includes(role);
}
export function isAdministrator(role: string) {
  return administratorRoles.includes(role);
}
export function canCommand(role: string, action: string): boolean {
  if (!staffRoles.includes(role as StaffRole)) return false;
  if (["register", "intake", "token"].includes(action))
    return canRegister(role);
  if (
    [
      "assess",
      "note",
      "subpriority",
      "reassessment",
      "opd_route",
      "escalate_doctor",
      "vitals",
    ].includes(action)
  )
    return clinicalRoles.includes(role);
  if (["department_referral", "follow_up", "referral"].includes(action))
    return role === "doctor";
  if (["protocol_save", "protocol_review"].includes(action))
    return role === "doctor";
  if (
    [
      "settings",
      "department",
      "resource",
      "facility",
      "shift",
      "staff_access",
      "department_access",
    ].includes(action)
  )
    return administratorRoles.includes(role);
  if (action === "transition")
    return [...clinicalRoles, "emergency_coordinator"].includes(role);
  if (action === "department_referral_status")
    return [...clinicalRoles, "emergency_coordinator"].includes(role);
  if (["bed_ward", "bed_configure"].includes(action))
    return administratorRoles.includes(role);
  if (["bed_plan", "bed_assign", "bed_release"].includes(action))
    return [...clinicalRoles, "emergency_coordinator"].includes(role);
  if (["bed_refresh", "bed_status"].includes(action))
    return [
      "nurse",
      "triage_nurse",
      "doctor",
      "resource_manager",
      "emergency_coordinator",
      "hospital_admin",
      "super_admin",
    ].includes(role);
  if (["reserve", "release", "maintenance", "shortage"].includes(action))
    return [
      ...clinicalRoles,
      "resource_manager",
      "emergency_coordinator",
      "hospital_admin",
      "super_admin",
    ].includes(role);
  if (action === "alert") return role !== "receptionist";
  if (["referral_status"].includes(action))
    return ["doctor", "emergency_coordinator"].includes(role);
  return false;
}
