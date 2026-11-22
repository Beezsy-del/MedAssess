"use client";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Activity,
  Bell,
  ClipboardList,
  History,
  UserRound,
  Users,
  QrCode,
} from "lucide-react";
import { PublicHeader } from "@/components/chrome";
import type { PatientReport } from "../questionnaire/model";
import { DemoQuestionnaire } from "./questionnaire";
import {
  demoQrValue,
  demoReducer,
  initialDemo,
  scenarios,
  type ScenarioId,
} from "./model";
const now = () => new Date().toISOString();
const time = (at: string) =>
  new Date(at).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";
const tabs = [
  { id: "home", title: "Patient dashboard", Icon: UserRound },
  { id: "assessment", title: "Health assessment", Icon: ClipboardList },
  { id: "history", title: "Medical history", Icon: History },
  { id: "timeline", title: "Patient timeline", Icon: Activity },
  { id: "notifications", title: "Notifications", Icon: Bell },
  { id: "staff", title: "Simulated care team", Icon: Users },
  { id: "qr", title: "Demo QR code", Icon: QrCode },
] as const;
type View = (typeof tabs)[number]["id"] | "update";
export function PatientDemo() {
  const [state, dispatch] = useReducer(demoReducer, undefined, () =>
    initialDemo("green", "2026-11-22T09:00:00Z"),
  );
  const [view, setView] = useState<View>("home");
  const [formKey, setFormKey] = useState(0);
  const [reviewFirst, setReviewFirst] = useState(false);
  const [notice, setNotice] = useState("");
  const [qr, setQr] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(demoQrValue, {
      width: 180,
      margin: 2,
    })
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active)
          setNotice(
            "Illustrative QR could not be drawn. It never grants patient access.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  function reset(scenario: ScenarioId = "green", start = false) {
    dispatch({ type: "reset", scenario, at: now() });
    setFormKey((k) => k + 1);
    setReviewFirst(false);
    setView(start ? "assessment" : "home");
    setNotice("Demo reset. All previous simulated activity has been cleared.");
  }
  function load(scenario: ScenarioId) {
    dispatch({ type: "reset", scenario, at: now() });
    setFormKey((k) => k + 1);
    setReviewFirst(true);
    if (scenario === "red") {
      dispatch({ type: "emergency", at: now() });
      setView("home");
    } else setView("assessment");
    setNotice(
      "Fictional scenario loaded. Review the prefilled answers and submit, or use Back to change them.",
    );
  }
  function emergency(report?: PatientReport) {
    dispatch({ type: "emergency", report, at: now() });
    setView("home");
    setNotice(
      "Emergency demonstration activated. No real hospital alert has been sent.",
    );
  }
  const history = (
    <>
      <h3>Conditions</h3>
      <p>
        {state.report.history.conditions.length
          ? state.report.history.conditions
              .map((x) => x.replaceAll("_", " "))
              .join(", ")
          : "Unknown / not recorded"}
      </p>
      <h3>Medications</h3>
      {state.report.medications.length ? (
        state.report.medications.map((m, i) => (
          <p key={i}>
            {m.name} · Dose: {m.dose || "unknown"} · Frequency:{" "}
            {m.frequency || "unknown"}
          </p>
        ))
      ) : (
        <p>Unknown / not recorded</p>
      )}
      <h3>Allergies</h3>
      {state.report.allergies.length ? (
        state.report.allergies.map((a, i) => (
          <p key={i}>
            {a.substance} · {a.reaction || "Reaction unknown"}
          </p>
        ))
      ) : (
        <p>Unknown / not recorded</p>
      )}
      <h3>Medical and surgical history</h3>
      <p>{state.report.history.details || "No additional history recorded."}</p>
      <p>
        {state.report.history.surgery_details ||
          "Previous procedures: unknown / not recorded."}
      </p>
    </>
  );
  return (
    <>
      <PublicHeader />
      <div className="demo-banner" role="note">
        DEMO MODE — SYNTHETIC PATIENT DATA — NOT FOR REAL CLINICAL USE
      </div>
      <main className="demo-workspace">
        <header className="page-heading">
          <div>
            <p className="page-context">Patient Portal demonstration</p>
            <h1>Your care journey</h1>
            <p>
              Explore a fictional hospital visit. Nothing here is sent to a
              hospital or saved to a real patient record.
            </p>
          </div>
          <Link className="button" href="/patient-portal">
            Exit demo
          </Link>
        </header>
        <section
          className="panel panel-copy demo-controls"
          aria-label="DEMO CONTROL PANEL"
        >
          <h2>DEMO CONTROL PANEL</h2>
          <div className="button-row">
            <label className="field">
              <span>Select scenario</span>
              <select
                value={state.scenario}
                onChange={(e) => load(e.target.value as ScenarioId)}
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="button" onClick={() => reset()}>
              Reset Demo
            </button>
            <button
              className="button"
              onClick={() => reset(state.scenario, true)}
            >
              Start from beginning
            </button>
            <button className="button" onClick={() => setView("timeline")}>
              View patient timeline
            </button>
            <button className="button" onClick={() => setView("notifications")}>
              View notifications
            </button>
            <button className="button" onClick={() => setView("home")}>
              Return to Patient Portal Demo Home
            </button>
          </div>
        </section>
        {notice && (
          <p role="status" className="demo-feedback">
            {notice}
          </p>
        )}
        <nav className="demo-tabs" aria-label="Demo sections">
          {tabs.map(({ id, title, Icon }) => (
            <button
              key={id}
              className="button"
              aria-current={view === id ? "page" : undefined}
              onClick={() => setView(id)}
            >
              <Icon size={17} aria-hidden="true" />
              {title}
              {id === "notifications"
                ? ` (${state.notices.filter((n) => !n.acknowledged).length})`
                : ""}
            </button>
          ))}
        </nav>
        <div className="demo-emergency">
          <p>
            Real emergency? Alert nearby hospital staff immediately. Do not wait
            for this demo.
          </p>
          <button
            className="button emergency-button"
            onClick={() => emergency()}
          >
            Simulate emergency assistance
          </button>
        </div>
        {state.category && (
          <section
            className={`panel panel-copy patient-priority priority-${state.category.toLowerCase()}`}
            aria-label="Simulated result"
          >
            <h2>
              SIMULATED {state.category} —{" "}
              {state.category === "RED"
                ? "Emergency assessment required"
                : state.category === "YELLOW"
                  ? "Urgent assessment required"
                  : "General waiting / non-immediate assessment"}
            </h2>
            <p>
              {state.category === "RED"
                ? "Alert nearby hospital staff immediately for a real emergency. Emergency nurse, duty doctor and transport assistance are simulated here; clinicians determine the destination."
                : state.category === "YELLOW"
                  ? "Demo next step: prompt nurse and doctor assessment in the urgent assessment workflow."
                  : "Demo next step: general waiting with nurse assessment. Tell staff if real symptoms worsen."}
            </p>
            <p>
              {state.previousCategory && (
                <>
                  Previous: {state.previousCategory} → Current: {state.category}
                  .{" "}
                </>
              )}
              Assigned at {time(state.assessedAt!)}.
            </p>
            <p>
              Reported symptoms:{" "}
              {state.report.symptoms
                .map((s) => s.replaceAll("_", " "))
                .join(", ") || "Unknown"}
              . {state.report.complaint}
            </p>
            <strong>
              Simulated clinical decision support, not a medical diagnosis.
              Presentation scenarios select these results; no clinical rules or
              safety claims are validated.
            </strong>
          </section>
        )}
        {view === "home" && (
          <>
            <section className="panel panel-copy">
              <h2>Patient profile</h2>
              <div className="demo-profile">
                <div>
                  <h3>{state.report.identity.name}</h3>
                  <p>
                    Fictional patient · Age:{" "}
                    {state.report.identity.age ?? "unknown"} · Gender:{" "}
                    {state.report.identity.sex || "unknown"}
                  </p>
                  <p>
                    Patient: DEMO-PATIENT-001 · Encounter: DEMO-ENCOUNTER-001
                  </p>
                  <p>
                    Emergency contact: {state.report.identity.emergency_contact}
                  </p>
                  <p>Visit: {time(state.registeredAt)}</p>
                </div>
                <div>
                  <h3>Current status</h3>
                  <p>{state.status}</p>
                  <p>
                    {state.report.history.conditions.length
                      ? state.report.history.conditions.join(", ")
                      : "Medical history: unknown / not recorded"}
                  </p>
                </div>
              </div>
              <div className="button-row">
                <button
                  className="button primary"
                  onClick={() => {
                    setReviewFirst(false);
                    setFormKey((k) => k + 1);
                    setView("assessment");
                  }}
                >
                  Complete health assessment
                </button>
                <button
                  className="button"
                  onClick={() => setView("update")}
                  disabled={!state.category}
                >
                  My Symptoms Have Changed
                </button>
              </div>
            </section>
            <section className="panel panel-copy">
              <h2>Try Interactive Demo Scenarios</h2>
              <p>
                Each scenario loads fictional answers. GREEN and YELLOW begin
                with a review; RED activates an immediate emergency
                demonstration. These are presentation scripts, not medical
                rules.
              </p>
              <div className="demo-scenarios">
                {scenarios.map((s) => (
                  <button
                    className="demo-scenario"
                    key={s.id}
                    onClick={() => load(s.id)}
                  >
                    <strong>{s.title}</strong>
                    <span>{s.description}</span>
                    <span>Try scenario</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
        {view === "assessment" && (
          <DemoQuestionnaire
            key={formKey}
            initial={state.report}
            reviewFirst={reviewFirst}
            onEmergency={emergency}
            onSubmit={(report) => {
              dispatch({ type: "submit", report, at: now() });
              setView("home");
              setNotice(
                "Assessment received in this demo. View the result, timeline and simulated care team.",
              );
            }}
          />
        )}
        {view === "history" && (
          <section className="panel panel-copy">
            <h2>Fictional medical history</h2>
            {history}
            <h3>Previous hospital visits</h3>
            <p>
              15 October 2026 — fictional routine follow-up; patient reported a
              previous minor procedure. This sample visit is not a medical
              record.
            </p>
          </section>
        )}
        {view === "timeline" && (
          <section className="panel panel-copy">
            <h2>Patient timeline</h2>
            <ol className="demo-timeline">
              {state.events.map((e) => (
                <li key={e.id}>
                  <time>{time(e.at)}</time>
                  <h3>{e.title}</h3>
                  <p>{e.detail}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {view === "notifications" && (
          <section className="panel panel-copy">
            <h2>Simulated notifications</h2>
            <p>No SMS, email, push notification or hospital alert is sent.</p>
            {!state.notices.length && (
              <p>
                No simulated notifications yet. Submit an assessment or run a
                scenario.
              </p>
            )}
            {state.notices.map((n) => (
              <article className="demo-notification" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.detail}</p>
                <p>
                  {time(n.at)} ·{" "}
                  {n.acknowledged
                    ? "Acknowledged in demo"
                    : "Pending simulated acknowledgement"}
                </p>
                <button
                  className="button"
                  disabled={n.acknowledged}
                  onClick={() =>
                    dispatch({ type: "acknowledge", id: n.id, at: now() })
                  }
                >
                  Simulate nurse acknowledgement
                </button>
              </article>
            ))}
          </section>
        )}
        {view === "update" && (
          <section className="panel panel-copy">
            <h2>My Symptoms Have Changed</h2>
            <p>
              Choose the next presentation state explicitly. Elapsed waiting
              time never changes the category.
            </p>
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                dispatch({
                  type: "update",
                  complaint: String(f.get("complaint")),
                  progression: "worsening",
                  target: f.get("scenario") as "YELLOW" | "RED",
                  at: now(),
                });
                setView("home");
                setNotice(
                  "Symptoms updated. The simulated result, timeline and care-team alert have changed.",
                );
              }}
            >
              <label className="field">
                <span>Describe changed or new symptoms</span>
                <textarea
                  name="complaint"
                  required
                  maxLength={1000}
                  defaultValue="Fictional symptoms have worsened; requesting reassessment."
                />
              </label>
              <label className="field">
                <span>Configured demonstration update</span>
                <select name="scenario">
                  <option value="YELLOW">
                    Worsening scenario — simulate YELLOW
                  </option>
                  <option value="RED">Emergency scenario — simulate RED</option>
                </select>
              </label>
              <button className="button primary">Submit symptom update</button>
              <button
                type="button"
                className="button emergency-button"
                onClick={() => emergency()}
              >
                Demonstrate an emergency warning now
              </button>
            </form>
          </section>
        )}
        {view === "staff" && (
          <section className="panel panel-copy">
            <h2>Simulated nurse and doctor workflow</h2>
            <p>
              This view illustrates the existing clinical workflow. It cannot
              open or modify the actual staff portals.
            </p>
            <h3>Patient handover</h3>
            <p>
              {state.report.identity.name} ·{" "}
              {state.category ?? "Assessment not submitted"}
            </p>
            <p>{state.report.complaint}</p>
            <p>
              Symptoms: {state.report.symptoms.join(", ")} · Progression:{" "}
              {state.report.progression}
            </p>
            {history}
            <h3>Nurse workspace — simulated</h3>
            <p>
              {state.notices.filter((n) => !n.acknowledged).length} simulated
              notifications awaiting acknowledgement.
            </p>
            <button
              className="button"
              disabled={!state.notices.some((n) => !n.acknowledged)}
              onClick={() => {
                state.notices
                  .filter((n) => !n.acknowledged)
                  .forEach((n) =>
                    dispatch({ type: "acknowledge", id: n.id, at: now() }),
                  );
                setNotice("Simulated nurse alerts acknowledged.");
              }}
            >
              Acknowledge simulated alerts
            </button>
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                dispatch({
                  type: "nurse",
                  observation: String(f.get("observation")),
                  at: now(),
                });
                setNotice(
                  "Simulated nurse assessment recorded. The doctor can now review the handover.",
                );
              }}
            >
              <fieldset disabled={!state.category}>
                <label className="field">
                  <span>Nurse reassessment observations</span>
                  <textarea
                    name="observation"
                    required
                    maxLength={1000}
                    defaultValue="Fictional reassessment reviewed; handover to the demo doctor."
                  />
                </label>
                <button className="button primary">
                  Record simulated nurse reassessment
                </button>
              </fieldset>
            </form>
            <h3>Doctor workspace — simulated</h3>
            {!state.nurseReviewed && (
              <p>
                Complete the simulated nurse reassessment to open the doctor
                workflow.
              </p>
            )}
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                dispatch({
                  type: "doctor",
                  kind: String(f.get("kind")),
                  text: String(f.get("note")),
                  at: now(),
                });
                setNotice(
                  "Simulated doctor documentation added to the timeline.",
                );
              }}
            >
              <fieldset disabled={!state.nurseReviewed}>
                <label className="field">
                  <span>Doctor action</span>
                  <select name="kind">
                    <option>Assessment</option>
                    <option>Referral</option>
                    <option>Treatment plan</option>
                  </select>
                </label>
                <label className="field">
                  <span>Fictional clinical documentation</span>
                  <textarea
                    name="note"
                    required
                    maxLength={1000}
                    defaultValue="Fictional review only. No real diagnosis, medication or treatment recommendation."
                  />
                </label>
                <button className="button primary">
                  Record simulated doctor action
                </button>
              </fieldset>
            </form>
            {state.doctorNotes.map((n, i) => (
              <p key={i}>
                {n.kind}: {n.text} · {time(n.at)}
              </p>
            ))}
          </section>
        )}
        {view === "qr" && (
          <section className="panel panel-copy">
            <h2>Demo QR Code — Not Valid for Real Patient Access</h2>
            {qr && (
              <Image
                src={qr}
                alt="Illustrative demo QR encoding only a non-access demonstration label"
                width={180}
                height={180}
                unoptimized
              />
            )}
            <p>
              This QR contains only a demonstration label. It has no access
              token and cannot open a patient record.
            </p>
            <p>
              For real patient access, authorised registration staff create an
              encounter and issue a private, expiring QR/token pass. The real
              portal validates that credential before opening its encounter.
            </p>
            <Link href="/patient/start" className="button">
              Go to Real Patient Access
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
