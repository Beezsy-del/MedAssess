export const transitions = {
  REGISTERED: ["TRIAGE_PENDING", "CANCELLED"],
  TRIAGE_PENDING: ["TRIAGE_COMPLETED", "CANCELLED"],
  TRIAGE_COMPLETED: ["WAITING"],
  WAITING: ["STAFF_ASSIGNED", "TRIAGE_PENDING"],
  STAFF_ASSIGNED: ["ASSESSMENT", "TRIAGE_PENDING"],
  ASSESSMENT: ["DIAGNOSTICS", "TREATMENT", "DISPOSITION"],
  DIAGNOSTICS: ["ASSESSMENT", "TREATMENT"],
  TREATMENT: ["DIAGNOSTICS", "DISPOSITION"],
  DISPOSITION: ["DISCHARGED", "ADMITTED", "REFERRED"],
  REFERRED: ["TRANSFERRED"],
  DISCHARGED: [],
  ADMITTED: [],
  TRANSFERRED: [],
  CANCELLED: [],
} as const;
export type FlowStatus = keyof typeof transitions;
export function canTransition(from: string, to: string): boolean {
  return (
    from in transitions &&
    (transitions[from as FlowStatus] as readonly string[]).includes(to)
  );
}
export const terminalStatuses = [
  "DISCHARGED",
  "ADMITTED",
  "TRANSFERRED",
  "CANCELLED",
];
