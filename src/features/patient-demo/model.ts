export const demoQrValue = "MEDIROUTE-DEMO-NOT-VALID-FOR-PATIENT-ACCESS";
import { emptyReport, type PatientReport } from "../questionnaire/model";
export type DemoCategory = "GREEN" | "YELLOW" | "RED";
export const scenarios = [
  {
    id: "green",
    title: "GREEN — General Waiting",
    category: "GREEN",
    description:
      "Complete a fictional visit and follow the general waiting process.",
  },
  {
    id: "yellow",
    title: "YELLOW — Urgent Assessment",
    category: "YELLOW",
    description:
      "Present a scripted urgent assessment and nurse/doctor notification.",
  },
  {
    id: "red",
    title: "RED — Emergency",
    category: "RED",
    description:
      "Activate an emergency demonstration without finishing the questionnaire.",
  },
  {
    id: "dynamic",
    title: "Dynamic Escalation",
    category: "GREEN",
    description:
      "Begin GREEN, report a scripted change to YELLOW, then demonstrate RED.",
  },
  {
    id: "history",
    title: "Existing Medical History",
    category: "GREEN",
    description:
      "Share fictional conditions, medicines and allergies with the simulated care team.",
  },
] as const;
export type ScenarioId = (typeof scenarios)[number]["id"];
export type DemoEvent = {
  id: number;
  at: string;
  title: string;
  detail: string;
};
export type DemoNotice = DemoEvent & { acknowledged: boolean };
export type DemoState = {
  scenario: ScenarioId;
  report: PatientReport;
  category: DemoCategory | null;
  previousCategory: DemoCategory | null;
  assessedAt: string | null;
  status: string;
  registeredAt: string;
  events: DemoEvent[];
  notices: DemoNotice[];
  nurseReviewed: boolean;
  doctorNotes: { at: string; kind: string; text: string }[];
};
export function initialDemo(
  scenario: ScenarioId = "green",
  at = new Date().toISOString(),
): DemoState {
  const report = emptyReport();
  report.identity = {
    ...report.identity,
    name: "Asha Example — fictional patient",
    age: 42,
    sex: "Female",
    emergency_contact: "Ravi Example — fictional contact, 000-000-0000",
    patient_identifier: "DEMO-PATIENT-001",
  };
  report.complaint =
    scenario === "green" || scenario === "dynamic"
      ? "Fictional mild ankle discomfort"
      : scenario === "yellow"
        ? "Fictional urgent-review presentation"
        : scenario === "red"
          ? "Predefined emergency presentation — fictional"
          : "Fictional follow-up with existing conditions";
  report.symptoms = scenario === "red" ? ["breathing_difficulty"] : ["pain"];
  report.symptoms_complete = true;
  report.onset = "Earlier today — synthetic history";
  report.progression = "same";
  report.location = "Ankle — fictional example";
  report.pain = 2;
  if (scenario === "history") {
    report.history = {
      ...report.history,
      status: "recorded",
      conditions: ["diabetes", "hypertension"],
      details: "Fictional history only; no treatment advice.",
      surgery: "yes",
      surgery_details: "Fictional previous minor procedure",
      hospitalised: "yes",
      similar_before: "yes",
    };
    report.medication_status = "recorded";
    report.medications = [
      {
        name: "Example maintenance medicine — fictional",
        dose: "Not specified",
        frequency: "Not specified",
        details: "Illustration only, not a prescription",
      },
    ];
    report.allergy_status = "recorded";
    report.allergies = [
      {
        substance: "Example substance — fictional",
        reaction: "Reported rash — synthetic history",
      },
    ];
  }
  return {
    scenario,
    report,
    category: null,
    previousCategory: null,
    assessedAt: null,
    status: "Registration completed",
    registeredAt: at,
    events: [
      {
        id: 1,
        at,
        title: "Registration completed",
        detail:
          "Fictional encounter DEMO-ENCOUNTER-001 opened in this browser only.",
      },
    ],
    notices: [],
    nurseReviewed: false,
    doctorNotes: [],
  };
}
export type DemoAction =
  | { type: "reset"; scenario?: ScenarioId; at: string }
  | { type: "submit"; report: PatientReport; at: string }
  | {
      type: "update";
      complaint: string;
      progression: "same" | "worsening";
      target: "YELLOW" | "RED";
      at: string;
    }
  | { type: "emergency"; report?: PatientReport; at: string }
  | { type: "acknowledge"; id: number; at: string }
  | { type: "nurse"; observation: string; at: string }
  | { type: "doctor"; kind: string; text: string; at: string };
const severity = { GREEN: 0, YELLOW: 1, RED: 2 };
function event(
  s: DemoState,
  at: string,
  title: string,
  detail: string,
): DemoState {
  return {
    ...s,
    events: [...s.events, { id: s.events.length + 1, at, title, detail }],
  };
}
function notify(
  s: DemoState,
  at: string,
  title: string,
  detail: string,
): DemoState {
  return {
    ...s,
    notices: [
      ...s.notices,
      { id: s.notices.length + 1, at, title, detail, acknowledged: false },
    ],
  };
}
function classify(
  s: DemoState,
  requested: DemoCategory,
  at: string,
  reason: string,
): DemoState {
  // Presentation scripts only. No symptom score, physiological cutoff or clinical inference.
  const category =
    s.category && severity[s.category] > severity[requested]
      ? s.category
      : requested;
  const previous = s.category;
  let next: DemoState = {
    ...s,
    previousCategory: previous,
    category,
    assessedAt: at,
    nurseReviewed: false,
    status:
      category === "RED"
        ? "Emergency assistance activated — simulated"
        : category === "YELLOW"
          ? "Awaiting urgent nurse and doctor assessment"
          : "General waiting — awaiting nurse assessment",
  };
  next = event(
    next,
    at,
    previous && category !== previous
      ? `Simulated escalation: ${previous} → ${category}`
      : `Simulated classification: ${category}`,
    reason,
  );
  next = notify(
    next,
    at,
    category === "RED"
      ? "Simulated emergency nurse and duty doctor alert"
      : category === "YELLOW"
        ? "Simulated urgent nurse and duty doctor alert"
        : "Simulated nurse notification",
    "Pending simulated acknowledgement. No message was sent to a hospital.",
  );
  next = event(
    next,
    at,
    "Care team notification simulated",
    "Visible in the simulated staff workflow only.",
  );
  if (category === "RED")
    next = event(
      next,
      at,
      "Emergency transport assistance requested — simulated",
      "Staff must determine stabilisation and destination. No automatic theatre allocation.",
    );
  return next;
}
export function demoReducer(s: DemoState, a: DemoAction): DemoState {
  switch (a.type) {
    case "reset":
      return initialDemo(a.scenario ?? "green", a.at);
    case "submit": {
      let next = event(
        { ...s, report: a.report },
        a.at,
        "Questionnaire completed",
        "Answers reviewed and submitted in this demonstration.",
      );
      next = notify(
        next,
        a.at,
        "Your health assessment has been received — simulated",
        "The scenario controls the simulated result; your answers are not medically evaluated.",
      );
      return classify(
        next,
        scenarios.find((x) => x.id === s.scenario)!.category,
        a.at,
        "Result selected by the presentation scenario, not a diagnosis or validated triage rule.",
      );
    }
    case "update":
      return classify(
        event(
          {
            ...s,
            report: {
              ...s.report,
              complaint: a.complaint,
              progression: a.progression,
            },
          },
          a.at,
          "Symptoms updated",
          a.complaint,
        ),
        a.target,
        a.at,
        "Presenter selected a scripted symptom-change scenario; no clinical thresholds are inferred.",
      );
    case "emergency":
      return classify(
        { ...s, report: { ...(a.report ?? s.report), emergency_help: true } },
        "RED",
        a.at,
        "Explicit emergency demonstration requested. For a real emergency, alert nearby staff immediately.",
      );
    case "acknowledge": {
      if (!s.notices.some((n) => n.id === a.id && !n.acknowledged)) return s;
      return event(
        {
          ...s,
          notices: s.notices.map((n) =>
            n.id === a.id ? { ...n, acknowledged: true } : n,
          ),
        },
        a.at,
        "Simulated nurse acknowledged notification",
        "Acknowledgement recorded in this demo timeline.",
      );
    }
    case "nurse": {
      if (!s.category || !a.observation.trim()) return s;
      return notify(
        event(
          {
            ...s,
            nurseReviewed: true,
            status:
              s.category === "RED" ? s.status : "Awaiting doctor assessment",
          },
          a.at,
          "Simulated nurse assessment",
          a.observation,
        ),
        a.at,
        "Your doctor assessment is pending — simulated",
        "The simulated doctor workspace is now available.",
      );
    }
    case "doctor": {
      if (!s.nurseReviewed || !a.text.trim()) return s;
      return event(
        {
          ...s,
          status:
            a.kind === "Referral"
              ? "Referred for assessment — simulated"
              : "Doctor assessment recorded — simulated",
          doctorNotes: [
            ...s.doctorNotes,
            { at: a.at, kind: a.kind, text: a.text },
          ],
        },
        a.at,
        `Simulated doctor ${a.kind.toLowerCase()}`,
        a.text,
      );
    }
  }
}
