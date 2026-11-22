"use client";
import Link from "next/link";
import {
  PatientLanguage,
  translatePatient,
  usePatientCopy,
  type PatientLanguageCode,
} from "./language";
import { PatientReview } from "./review";
import { Dictation } from "./voice";
import { useEffect, useRef, useState } from "react";
import {
  emptyReport,
  reportSchema,
  submissionIssues,
  symptoms,
  conditions,
  visibleQuestions,
  freeTextQuestions,
  type PatientReport,
} from "./model";
import { questionLabels as labels } from "./question-labels";
import { PublicHeader } from "@/components/chrome";
type PortalStatus = {
  reference: string;
  status: string;
  category: string;
  preliminary_category?: string;
  confirmed_category?: string;
  closed: boolean;
  report_id: string | null;
  latest_report?: unknown;
  draft?: unknown;
  draft_step?: number;
  department?: string;
};
const sections = [
  "About you",
  "Your symptoms",
  "Symptom details",
  "Medical history",
  "Medicines",
  "Allergies",
  "Additional information",
  "Review & send",
];

const readable = (v: string) => v.replaceAll("_", " ");
function TextField({
  label,
  value,
  change,
  max = 1000,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  max?: number;
}) {
  const t = usePatientCopy();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <input
        value={value}
        maxLength={max}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
}
function Choice({
  label,
  value,
  choices,
  change,
}: {
  label: string;
  value: string;
  choices: readonly string[];
  change: (value: string) => void;
}) {
  const t = usePatientCopy();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <select value={value} onChange={(e) => change(e.target.value)}>
        {choices.map((option) => (
          <option key={option} value={option}>
            {t(readable(option))}
          </option>
        ))}
      </select>
    </label>
  );
}
const yesNo = ["unknown", "yes", "no"] as const;
const historyOptions = ["unknown", "none_reported", "recorded"] as const;
async function call(body: unknown) {
  const response = await fetch("/api/patient/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || data.error)
    throw new Error(
      data.error ?? "Request failed. Please ask hospital staff for help.",
    );
  return data;
}
export function AdaptivePortal() {
  const [report, setReport] = useState<PatientReport>(emptyReport);
  const t = (text: string) => translatePatient(text, report.language);
  const [status, setStatus] = useState<PortalStatus | null>(null);
  const [step, setStep] = useState(0);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const epoch = useRef(0);
  const foreground = useRef(false);
  const [editing, setEditing] = useState(true);
  const pending = useRef<{ operation_id: string; fingerprint: string } | null>(
    null,
  );
  const previous = useRef<string | null>(null);
  const update = <K extends keyof PatientReport>(
    key: K,
    value: PatientReport[K],
  ) => setReport((r) => ({ ...r, [key]: value }));
  function restore(value: PortalStatus) {
    setStatus(value);
    previous.current = value.report_id;
    const saved = reportSchema.safeParse(value.draft ?? value.latest_report);
    if (saved.success) setReport({ ...saved.data, consent: false });
    setStep(value.draft_step ?? 0);
    setEditing(!!value.draft || !value.latest_report);
  }
  useEffect(() => {
    let active = true;
    const generation = epoch.current;
    const fragment = window.location.hash.slice(1);
    if (fragment)
      window.history.replaceState(null, "", window.location.pathname);
    call(fragment ? { action: "open", token: fragment } : { action: "status" })
      .then((value) => {
        if (active && generation === epoch.current && !foreground.current)
          restore(value);
      })
      .catch(() => {
        if (active && generation === epoch.current && !foreground.current)
          setMessage(
            "Enter the private token from your patient pass. You can always ask a nurse for assistance.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const hasSession = status !== null;
  useEffect(() => {
    if (!hasSession) return;
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (
        !active ||
        refreshing ||
        foreground.current ||
        document.visibilityState !== "visible"
      )
        return;
      refreshing = true;
      const generation = epoch.current;
      try {
        const value = await call({ action: "status" });
        if (active && generation === epoch.current && !foreground.current) {
          setStatus(value);
          setRefreshError("");
        }
      } catch {
        if (active && generation === epoch.current && !foreground.current)
          setRefreshError(
            "Updates are unavailable. Your displayed status may be out of date. Contact staff directly.",
          );
      } finally {
        refreshing = false;
      }
    };
    const timer = setInterval(() => void refresh(), 10000);
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [hasSession]); // Refresh status only; never overwrite unsaved answers.
  async function operation(task: () => Promise<void>) {
    if (foreground.current) return;
    foreground.current = true;
    epoch.current++;
    setBusy(true);
    setRefreshError("");
    setError("");
    setMessage("");
    try {
      await task();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete this action.",
      );
    } finally {
      epoch.current++;
      foreground.current = false;
      setBusy(false);
    }
  }
  async function save(next: number) {
    await operation(async () => {
      await call({ action: "draft", answers: report, step: next });
      setStep(next);
      setMessage(
        "Draft saved to this encounter. Reopen your private pass to continue.",
      );
    });
  }
  async function submit() {
    const issues = submissionIssues(report);
    if (issues.length) {
      setError(issues.map(t).join(" "));
      return;
    }
    await operation(async () => {
      const fingerprint = JSON.stringify({
        report,
        previous: previous.current,
      });
      if (!pending.current || pending.current.fingerprint !== fingerprint)
        pending.current = { operation_id: crypto.randomUUID(), fingerprint };
      await call({
        action: "submit",
        answers: report,
        operation_id: pending.current.operation_id,
        previous_report_id: previous.current,
      });
      pending.current = null;
      restore(await call({ action: "status" }));
      setEditing(false);
      setMessage("Report recorded. A member of staff must review it.");
    });
  }
  async function answerQuestion(key: string, value: string) {
    update("answers", { ...report.answers, [key]: value });
    if (key === "breathing_warning" && value === "yes") {
      update("emergency_help", true);
      await operation(async () => {
        await call({ action: "emergency" });
        setMessage(
          "Emergency request recorded; alert nearby staff now. Do not wait for this form.",
        );
        setStatus(await call({ action: "status" }));
      });
    }
  }
  const identity = <K extends keyof PatientReport["identity"]>(
    key: K,
    value: PatientReport["identity"][K],
  ) => update("identity", { ...report.identity, [key]: value });
  const history = <K extends keyof PatientReport["history"]>(
    key: K,
    value: PatientReport["history"][K],
  ) => update("history", { ...report.history, [key]: value });
  return (
    <PatientLanguage.Provider value={report.language}>
      <PublicHeader />
      <main className="public-page questionnaire-page" lang={report.language}>
        <label className="field">
          Language / ಭಾಷೆ / भाषा
          <select
            aria-label="Language"
            value={report.language}
            onChange={(e) =>
              update("language", e.target.value as PatientLanguageCode)
            }
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
        <div className="panel panel-copy">
          <strong>{t("Synthetic demonstration only")}</strong>
          <p>
            {t(
              "This questionnaire is not a diagnosis. Emergency care must never wait for registration or this form.",
            )}
          </p>
          <Link href="/emergency" className="button emergency-button">
            {t("Get emergency help directly")}
          </Link>
          {status && !status.closed && (
            <button
              disabled={busy}
              className="button emergency-button"
              onClick={() =>
                operation(async () => {
                  const value = await call({ action: "emergency" });
                  setMessage(
                    value.acknowledged
                      ? "A staff member has acknowledged the alert. Continue seeking help directly."
                      : "Emergency request recorded; staff acknowledgement is still pending. Call for staff now.",
                  );
                  setStatus(await call({ action: "status" }));
                })
              }
            >
              {t("Notify staff: I need immediate help")}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="error-text">
            {t(error)}
          </p>
        )}
        {refreshError && <p role="alert">{t(refreshError)}</p>}
        {message && <p role="status">{t(message)}</p>}
        {!status ? (
          <form
            className="panel panel-copy"
            onSubmit={(e) => {
              e.preventDefault();
              void operation(async () =>
                restore(
                  await call({
                    action: "open",
                    token: pass.toLowerCase().replace(/[\s-]/g, ""),
                  }),
                ),
              );
            }}
          >
            <h1>{t("Open your patient pass")}</h1>
            <div className="patient-entry-instructions">
              <h2>{t("Scan your QR code")}</h2>
              <p>
                {t(
                  "Open your phone camera, point it at the QR code on your patient pass, then tap the link. It opens your private encounter.",
                )}
              </p>
              <h2>{t("Or enter your private token")}</h2>
              <p>
                {t(
                  "Type the private access token printed on your pass below. Your encounter number alone cannot open a record.",
                )}
              </p>
              <p>
                {t(
                  "No pass or need help? Ask reception or a triage nurse to register you or help complete the questionnaire. No smartphone is required for staff-assisted care.",
                )}
              </p>
            </div>
            <TextField
              label="Private access token"
              value={pass}
              change={setPass}
              max={100}
            />
            <p>
              {t(
                "Your encounter reference is not an access token. Keep your pass private.",
              )}
            </p>
            <button className="button primary" disabled={busy}>
              {t("Open encounter")}
            </button>
          </form>
        ) : (
          <>
            <section
              className={`panel panel-copy patient-priority priority-${status.category.toLowerCase()}`}
            >
              <h2>
                {t(
                  status.category === "RED"
                    ? "RED — emergency assistance"
                    : status.category === "YELLOW"
                      ? "YELLOW — prompt assessment"
                      : status.category === "GREEN"
                        ? "GREEN — non-immediate care"
                        : "Human assessment required",
                )}
              </h2>
              <p>
                {t(
                  status.category === "RED"
                    ? "Alert nearby hospital staff now. Do not wait for this screen to update."
                    : status.category === "YELLOW"
                      ? "Prompt clinical assessment is required. Contact the assigned care professional."
                      : status.category === "GREEN"
                        ? "Follow the care team's waiting instructions. Tell staff immediately if symptoms worsen. This does not mean your condition is harmless."
                        : "Human assessment required",
                )}
              </p>
              <p>
                {status.reference}
                {t("·")}
                {t(readable(status.status))}
              </p>
              <h1>
                {t(
                  status.closed
                    ? "This encounter is closed"
                    : "Your care team’s updates",
                )}
              </h1>
              <p>
                {t("Preliminary priority:")}{" "}
                {t(
                  readable(
                    status.preliminary_category ?? "ASSESSMENT_REQUIRED",
                  ),
                )}
                {t(". Human review required.")}
              </p>
              <p>
                {t("Latest clinician decision:")}{" "}
                {status.confirmed_category
                  ? t(readable(status.confirmed_category))
                  : t("Not yet recorded")}
                {t(".")}
              </p>
              <p>
                {t("Department:")}{" "}
                {status.department ?? t("Awaiting staff assignment")}
              </p>
              {status.closed ? (
                <p>
                  {t("Ask staff for a new encounter if you need further care.")}
                </p>
              ) : (
                !editing && (
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      operation(async () => {
                        restore(await call({ action: "status" }));
                        setEditing(true);
                        setStep(1);
                      })
                    }
                  >
                    {t("MY SYMPTOMS HAVE CHANGED")}
                  </button>
                )
              )}
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  operation(async () => {
                    await call({ action: "logout" });
                    setStatus(null);
                    setReport(emptyReport());
                    setPass("");
                    setMessage("Patient session closed on this device.");
                  })
                }
              >
                {t("Close private session")}
              </button>
            </section>
            {!status.closed && editing && (
              <section className="panel panel-copy">
                <p>
                  {t("Step")}
                  {step + 1}
                  {t("of")}
                  {sections.length}
                </p>
                <progress
                  value={step + 1}
                  max={sections.length}
                  aria-label={t("Questionnaire progress")}
                />
                <h2>{t(sections[step])}</h2>
                <p>
                  {t(
                    "Leave unknown information as unknown. Use synthetic details only.",
                  )}
                </p>
                <fieldset disabled={busy} className="questionnaire-fields">
                  {step === 0 && (
                    <>
                      <TextField
                        label="Name"
                        value={report.identity.name}
                        change={(v) => identity("name", v)}
                        max={160}
                      />
                      <label className="field">
                        <span>{t("Age, if known")}</span>
                        <input
                          type="number"
                          min="0"
                          max="130"
                          value={report.identity.age ?? ""}
                          onChange={(e) =>
                            identity(
                              "age",
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </label>
                      <label className="field">
                        <span>{t("Or date of birth")}</span>
                        <input
                          type="date"
                          max={new Date().toISOString().slice(0, 10)}
                          value={report.identity.date_of_birth}
                          onChange={(e) =>
                            identity("date_of_birth", e.target.value)
                          }
                        />
                      </label>
                      {(
                        [
                          "sex",
                          "phone",
                          "emergency_contact",
                          "patient_identifier",
                        ] as const
                      ).map((k) => (
                        <TextField
                          key={k}
                          label={readable(k)}
                          value={report.identity[k]}
                          change={(v) => identity(k, v)}
                          max={
                            k === "emergency_contact"
                              ? 200
                              : k === "patient_identifier"
                                ? 100
                                : k === "sex"
                                  ? 80
                                  : 40
                          }
                        />
                      ))}
                      <Choice
                        label="Who is completing this report?"
                        value={report.identity.assistance}
                        choices={["unknown", "self", "guardian", "assisted"]}
                        change={(v) =>
                          identity(
                            "assistance",
                            v as PatientReport["identity"]["assistance"],
                          )
                        }
                      />
                      {["guardian", "assisted"].includes(
                        report.identity.assistance,
                      ) && (
                        <>
                          <TextField
                            label="Helper name"
                            value={report.identity.helper_name}
                            change={(v) => identity("helper_name", v)}
                            max={160}
                          />
                          <TextField
                            label="Relationship"
                            value={report.identity.relationship}
                            change={(v) => identity("relationship", v)}
                            max={80}
                          />
                        </>
                      )}
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <TextField
                        label="What is your main concern?"
                        value={report.complaint}
                        change={(v) => update("complaint", v)}
                        max={3000}
                      />
                      <Dictation
                        language={report.language}
                        onText={(value) =>
                          update(
                            "complaint",
                            `${report.complaint} ${value}`
                              .trim()
                              .slice(0, 3000),
                          )
                        }
                      />
                      <div className="questionnaire-options">
                        {symptoms.map((s) => (
                          <label key={s}>
                            <input
                              type="checkbox"
                              checked={report.symptoms.includes(s)}
                              onChange={(e) =>
                                update(
                                  "symptoms",
                                  e.target.checked
                                    ? [...report.symptoms, s]
                                    : report.symptoms.filter((v) => v !== s),
                                )
                              }
                            />{" "}
                            {t(readable(s))}
                          </label>
                        ))}
                      </div>
                      <label>
                        <input
                          type="checkbox"
                          checked={report.symptoms_complete}
                          onChange={(e) =>
                            update("symptoms_complete", e.target.checked)
                          }
                        />{" "}
                        {t("I have reviewed the symptom list.")}
                      </label>
                      <TextField
                        label="When did it start?"
                        value={report.onset}
                        change={(v) => update("onset", v)}
                        max={200}
                      />
                      <Choice
                        label="How has it changed?"
                        value={report.progression}
                        choices={["unknown", "improving", "same", "worsening"]}
                        change={(v) =>
                          update(
                            "progression",
                            v as PatientReport["progression"],
                          )
                        }
                      />
                      <TextField
                        label="Location of discomfort"
                        value={report.location}
                        change={(v) => update("location", v)}
                        max={200}
                      />
                      <label className="field">
                        <span>{t("Pain from 0 to 10, if known")}</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={report.pain ?? ""}
                          onChange={(e) =>
                            update(
                              "pain",
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </label>
                      <Choice
                        label="Does it spread elsewhere?"
                        value={report.spreading}
                        choices={yesNo}
                        change={(v) =>
                          update("spreading", v as PatientReport["spreading"])
                        }
                      />
                      {report.spreading === "yes" && (
                        <TextField
                          label="Where does it spread?"
                          value={report.spread_location}
                          change={(v) => update("spread_location", v)}
                          max={200}
                        />
                      )}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      {visibleQuestions(report).length === 0 && (
                        <p>
                          {t(
                            "No additional questions for the selected symptoms. You can add details in the final section.",
                          )}
                        </p>
                      )}
                      {visibleQuestions(report).map((key) =>
                        freeTextQuestions.has(key) ? (
                          <TextField
                            key={key}
                            label={labels[key]}
                            value={report.answers[key] ?? ""}
                            change={(v) => void answerQuestion(key, v)}
                            max={300}
                          />
                        ) : (
                          <Choice
                            key={key}
                            label={labels[key]}
                            value={report.answers[key] ?? "unknown"}
                            choices={yesNo}
                            change={(v) => void answerQuestion(key, v)}
                          />
                        ),
                      )}
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Choice
                        label="Known medical conditions"
                        value={report.history.status}
                        choices={historyOptions}
                        change={(v) =>
                          history(
                            "status",
                            v as PatientReport["history"]["status"],
                          )
                        }
                      />
                      {report.history.status === "recorded" && (
                        <>
                          <div className="questionnaire-options">
                            {conditions.map((c) => (
                              <label key={c}>
                                <input
                                  type="checkbox"
                                  checked={report.history.conditions.includes(
                                    c,
                                  )}
                                  onChange={(e) =>
                                    history(
                                      "conditions",
                                      e.target.checked
                                        ? [...report.history.conditions, c]
                                        : report.history.conditions.filter(
                                            (v) => v !== c,
                                          ),
                                    )
                                  }
                                />{" "}
                                {t(readable(c))}
                              </label>
                            ))}
                          </div>
                          <TextField
                            label="Condition details"
                            value={report.history.details}
                            change={(v) => history("details", v)}
                            max={2000}
                          />
                        </>
                      )}
                      {(
                        [
                          "surgery",
                          "similar_before",
                          "hospitalised",
                          "current_treatment",
                        ] as const
                      ).map((k) => (
                        <Choice
                          key={k}
                          label={readable(k)}
                          value={report.history[k]}
                          choices={yesNo}
                          change={(v) =>
                            history(k, v as "yes" | "no" | "unknown")
                          }
                        />
                      ))}
                      {report.history.surgery === "yes" && (
                        <TextField
                          label="Surgery details"
                          value={report.history.surgery_details}
                          change={(v) => history("surgery_details", v)}
                        />
                      )}
                      {report.history.current_treatment === "yes" && (
                        <TextField
                          label="Current treatment details"
                          value={report.history.treatment_details}
                          change={(v) => history("treatment_details", v)}
                        />
                      )}
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <Choice
                        label="Medicines you take"
                        value={report.medication_status}
                        choices={historyOptions}
                        change={(v) =>
                          update(
                            "medication_status",
                            v as PatientReport["medication_status"],
                          )
                        }
                      />
                      {report.medication_status === "recorded" && (
                        <>
                          {report.medications.map((medicine, index) => (
                            <fieldset key={index}>
                              <legend>
                                {t("Medicine")}
                                {index + 1}
                              </legend>
                              {(
                                [
                                  "name",
                                  "dose",
                                  "frequency",
                                  "details",
                                ] as const
                              ).map((key) => (
                                <TextField
                                  key={key}
                                  label={t(readable(key))}
                                  value={medicine[key]}
                                  max={
                                    key === "name"
                                      ? 160
                                      : key === "details"
                                        ? 500
                                        : 120
                                  }
                                  change={(v) =>
                                    update(
                                      "medications",
                                      report.medications.map((m, i) =>
                                        i === index ? { ...m, [key]: v } : m,
                                      ),
                                    )
                                  }
                                />
                              ))}
                              <button
                                className="button"
                                onClick={() =>
                                  update(
                                    "medications",
                                    report.medications.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                {t("Remove medicine")}
                                {index + 1}
                              </button>
                            </fieldset>
                          ))}
                          <button
                            className="button"
                            disabled={report.medications.length >= 20}
                            onClick={() =>
                              update("medications", [
                                ...report.medications,
                                {
                                  name: "",
                                  dose: "",
                                  frequency: "",
                                  details: "",
                                },
                              ])
                            }
                          >
                            {t("Add medicine")}
                          </button>
                        </>
                      )}
                      <Choice
                        label="Any recent medication changes?"
                        value={report.medication_changed}
                        choices={yesNo}
                        change={(v) =>
                          update(
                            "medication_changed",
                            v as PatientReport["medication_changed"],
                          )
                        }
                      />
                      <Choice
                        label="Any missed doses?"
                        value={report.medication_missed}
                        choices={yesNo}
                        change={(v) =>
                          update(
                            "medication_missed",
                            v as PatientReport["medication_missed"],
                          )
                        }
                      />
                      <TextField
                        label="Medicine taken for these symptoms"
                        value={report.current_symptom_medicine}
                        change={(v) => update("current_symptom_medicine", v)}
                      />
                    </>
                  )}
                  {step === 5 && (
                    <>
                      <Choice
                        label="Known allergies"
                        value={report.allergy_status}
                        choices={historyOptions}
                        change={(v) =>
                          update(
                            "allergy_status",
                            v as PatientReport["allergy_status"],
                          )
                        }
                      />
                      {report.allergy_status === "recorded" && (
                        <>
                          {report.allergies.map((allergy, index) => (
                            <fieldset key={index}>
                              <legend>
                                {t("Allergy")}
                                {index + 1}
                              </legend>
                              <TextField
                                label="Substance"
                                value={allergy.substance}
                                max={160}
                                change={(v) =>
                                  update(
                                    "allergies",
                                    report.allergies.map((a, i) =>
                                      i === index ? { ...a, substance: v } : a,
                                    ),
                                  )
                                }
                              />
                              <TextField
                                label="Reaction"
                                value={allergy.reaction}
                                max={500}
                                change={(v) =>
                                  update(
                                    "allergies",
                                    report.allergies.map((a, i) =>
                                      i === index ? { ...a, reaction: v } : a,
                                    ),
                                  )
                                }
                              />
                              <button
                                className="button"
                                onClick={() =>
                                  update(
                                    "allergies",
                                    report.allergies.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                {t("Remove allergy")}
                                {index + 1}
                              </button>
                            </fieldset>
                          ))}
                          <button
                            className="button"
                            disabled={report.allergies.length >= 20}
                            onClick={() =>
                              update("allergies", [
                                ...report.allergies,
                                { substance: "", reaction: "" },
                              ])
                            }
                          >
                            {t("Add allergy")}
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {step === 6 && (
                    <>
                      <Choice
                        label="Pregnancy, if relevant"
                        value={report.pregnancy}
                        choices={yesNo}
                        change={(v) =>
                          update("pregnancy", v as PatientReport["pregnancy"])
                        }
                      />
                      {report.pregnancy === "yes" && (
                        <TextField
                          label="Pregnancy details"
                          value={report.pregnancy_details}
                          change={(v) => update("pregnancy_details", v)}
                          max={500}
                        />
                      )}
                      <TextField
                        label="Accessibility or communication assistance"
                        value={report.access_needs}
                        change={(v) => update("access_needs", v)}
                      />
                      <TextField
                        label="Anything else your care team should know?"
                        value={report.additional}
                        change={(v) => update("additional", v)}
                        max={2000}
                      />
                      <p>
                        {t(
                          "Optional measurements you report yourself. Staff must verify them.",
                        )}
                      </p>
                      {Object.entries(report.self_reported_vitals).map(
                        ([key, value]) => (
                          <label className="field" key={key}>
                            <span>{readable(key)}</span>
                            <input
                              type="number"
                              step="any"
                              value={value ?? ""}
                              onChange={(e) =>
                                update("self_reported_vitals", {
                                  ...report.self_reported_vitals,
                                  [key]:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                })
                              }
                            />
                          </label>
                        ),
                      )}
                    </>
                  )}
                  {step === 7 && (
                    <>
                      <PatientReview report={report} />
                      <dl>
                        <dt>{t("Main concern")}</dt>
                        <dd>{report.complaint || "Unknown"}</dd>
                        <dt>{t("Symptoms")}</dt>
                        <dd>
                          {report.symptoms.map(readable).join(", ") ||
                            "Unknown"}
                        </dd>
                        <dt>{t("Progression")}</dt>
                        <dd>{report.progression}</dd>
                        <dt>{t("Medical history")}</dt>
                        <dd>
                          {readable(report.history.status)}{" "}
                          {report.history.conditions.map(readable).join(", ")}{" "}
                          {report.history.details}
                        </dd>
                        <dt>{t("Medicines")}</dt>
                        <dd>
                          {readable(report.medication_status)}{" "}
                          {report.medications
                            .map((m) => `${m.name} ${m.dose} ${m.frequency}`)
                            .join("; ")}
                        </dd>
                        <dt>{t("Allergies")}</dt>
                        <dd>
                          {readable(report.allergy_status)}{" "}
                          {report.allergies
                            .map((a) => `${a.substance}: ${a.reaction}`)
                            .join("; ")}
                        </dd>
                      </dl>
                      <p>
                        {t(
                          "Use Back to correct any section. Your answers will be shared with the authorized hospital care team for this encounter.",
                        )}
                      </p>
                      <label>
                        <input
                          type="checkbox"
                          checked={report.consent}
                          onChange={(e) => update("consent", e.target.checked)}
                        />{" "}
                        {t(
                          "I reviewed my answers and consent to sharing this report with the care team.",
                        )}
                      </label>
                    </>
                  )}
                </fieldset>
                <div className="button-row spaced">
                  {step > 0 && (
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() => setStep((s) => s - 1)}
                    >
                      {t("Back")}
                    </button>
                  )}
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => save(step)}
                  >
                    {t("Save draft")}
                  </button>
                  {step < 7 ? (
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={() => save(step + 1)}
                    >
                      {t("Save & continue")}
                    </button>
                  ) : (
                    <button
                      className="button primary"
                      disabled={busy || !report.consent}
                      onClick={submit}
                    >
                      {busy ? "Sending…" : "Send to care team"}
                    </button>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </PatientLanguage.Provider>
  );
}
