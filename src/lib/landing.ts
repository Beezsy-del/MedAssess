export function landingForRole(role: string) {
  return role === "triage_nurse" || role === "nurse"
    ? "/registration"
    : "/dashboard";
}
