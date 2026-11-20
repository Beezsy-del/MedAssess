export type Category = "RED" | "YELLOW" | "GREEN" | "ASSESSMENT_REQUIRED";
export const emergencySigns = [
  "Unresponsive",
  "Severe breathing difficulty",
  "Uncontrolled bleeding",
  "Suspected stroke",
  "Ongoing seizure",
  "Major trauma",
  "Suspected shock",
] as const;
export type ClinicalInput = {
  warningSigns: string[];
  symptoms: string;
  pain: number | null;
  worsening: boolean | null;
  verified: boolean;
  vitals: {
    pulse: number | null;
    spo2: number | null;
    respiratoryRate: number | null;
    systolic: number | null;
    temperature: number | null;
  };
};
export type ClinicalResult = {
  category: Category;
  emergency: boolean;
  reasons: string[];
  missing: string[];
  protocol: string;
  score: number | null;
  breakdown: { label: string; value: number }[];
};

/** Software demonstration only: no invented clinical vital-sign cutoffs. Human assessment is authoritative. */
export function assess(input: ClinicalInput): ClinicalResult {
  const missing = Object.entries(input.vitals)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  if (!input.symptoms.trim()) missing.push("symptoms");
  if (!input.verified) missing.push("clinical verification");
  if (input.pain === null) missing.push("pain");
  if (input.worsening === null) missing.push("progression");
  const signs = input.warningSigns.filter((s) =>
    (emergencySigns as readonly string[]).includes(s),
  );
  const emergency = signs.length > 0;
  const reasons = emergency
    ? signs.map(
        (s) =>
          `Reported emergency warning: ${s}. Immediate staff assistance and human assessment required.`,
      )
    : [
        "Human triage required; absence of reported warning signs does not establish normal findings.",
      ];
  if (input.worsening)
    reasons.push("Deterioration reported: prompt reassessment required.");
  if (missing.length)
    reasons.push(
      `Information incomplete or unverified: ${missing.join(", ")}.`,
    );
  const breakdown = missing.length
    ? []
    : [
        { label: "Reported warning sign (demo)", value: emergency ? 40 : 0 },
        {
          label: "Reported pain (demo)",
          value: Math.min(10, Math.max(0, input.pain!)) * 1.5,
        },
        { label: "Worsening symptoms (demo)", value: input.worsening ? 10 : 0 },
      ];
  return {
    category: emergency ? "RED" : "ASSESSMENT_REQUIRED",
    emergency,
    reasons,
    missing,
    protocol: "demo-1.0-unvalidated",
    score: breakdown.length
      ? Math.round(breakdown.reduce((n, x) => n + x.value, 0) * 100) / 100
      : null,
    breakdown,
  };
}
