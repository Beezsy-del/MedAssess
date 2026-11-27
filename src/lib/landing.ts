export function landingForRole(role: string) {
  return role === "triage_nurse" || role === "nurse"
    ? "/nurse"
    : role === "doctor"
      ? "/doctor"
      : role === "receptionist"
        ? "/reception"
        : "/dashboard";
}
