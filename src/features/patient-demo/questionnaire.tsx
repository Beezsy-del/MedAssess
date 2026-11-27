"use client";
import { useState } from "react";
import {
  conditions,
  symptoms,
  visibleQuestions,
  freeTextQuestions,
  submissionIssues,
  type PatientReport,
} from "../questionnaire/model";
import { questionLabels } from "../questionnaire/question-labels";
import { PatientReview } from "../questionnaire/review";
const readable = (text: string) => text.replaceAll("_", " ");
const steps = [
  "About you",
  "Symptoms",
  "Follow-up questions",
  "Medical history",
  "Medicines & allergies",
  "Review answers",
];
export function DemoQuestionnaire({
  initial,
  reviewFirst,
  onSubmit,
  onEmergency,
}: {
  initial: PatientReport;
  reviewFirst: boolean;
  onSubmit: (report: PatientReport) => void;
  onEmergency: (report: PatientReport) => void;
}) {
  const [report, setReport] = useState(initial);
  const [step, setStep] = useState(reviewFirst ? 5 : 0);
  const [error, setError] = useState("");
  const update = <K extends keyof PatientReport>(
    key: K,
    value: PatientReport[K],
  ) => setReport((r) => ({ ...r, [key]: value }));
  function text(label: string, value: string, change: (value: string) => void) {
    return (
      <label className="field">
        <span>{label}</span>
        <input
          value={value}
          maxLength={500}
          onChange={(e) => change(e.target.value)}
        />
      </label>
    );
  }
  function choice(
    label: string,
    value: string,
    change: (value: string) => void,
  ) {
    return (
      <label className="field">
        <span>{label}</span>
        <select value={value} onChange={(e) => change(e.target.value)}>
          {["unknown", "yes", "no"].map((v) => (
            <option key={v} value={v}>
              {readable(v)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <section className="panel panel-copy demo-questionnaire">
      <h2>Health assessment</h2>
      <p>
        Use fictional answers only. The selected scenario sets the simulated
        outcome; symptoms are not used to calculate clinical urgency.
      </p>
      <p>
        Step {step + 1} of {steps.length}: {steps[step]}
      </p>
      <progress
        aria-label="Demo questionnaire progress"
        value={step + 1}
        max={steps.length}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 5) {
            setStep(step + 1);
            return;
          }
          const issues = submissionIssues(report);
          if (issues.length) {
            setError(issues.join(" "));
            return;
          }
          onSubmit(report);
        }}
      >
        {step === 0 && (
          <div className="form-grid">
            {text("Fictional patient name", report.identity.name, (value) =>
              update("identity", { ...report.identity, name: value }),
            )}
            <label className="field">
              <span>Age, if known</span>
              <input
                type="number"
                min={0}
                max={130}
                value={report.identity.age ?? ""}
                onChange={(e) =>
                  update("identity", {
                    ...report.identity,
                    age: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
            {text("Gender, if relevant", report.identity.sex, (value) =>
              update("identity", { ...report.identity, sex: value }),
            )}
            {text(
              "Fictional emergency contact",
              report.identity.emergency_contact,
              (value) =>
                update("identity", {
                  ...report.identity,
                  emergency_contact: value,
                }),
            )}
          </div>
        )}
        {step === 1 && (
          <div className="stack-form">
            {text("Main health complaint", report.complaint, (v) =>
              update("complaint", v),
            )}
            <fieldset>
              <legend>Presenting symptoms</legend>
              <div className="demo-checks">
                {symptoms.map((symptom) => (
                  <label key={symptom}>
                    <input
                      type="checkbox"
                      checked={report.symptoms.includes(symptom)}
                      onChange={(e) =>
                        update(
                          "symptoms",
                          e.target.checked
                            ? [...report.symptoms, symptom]
                            : report.symptoms.filter((s) => s !== symptom),
                        )
                      }
                    />{" "}
                    {symptom === "fainting"
                      ? "fainting or loss of consciousness"
                      : readable(symptom)}
                  </label>
                ))}
              </div>
            </fieldset>
            {text("When did symptoms begin?", report.onset, (v) =>
              update("onset", v),
            )}
            <label className="field">
              <span>How are symptoms changing?</span>
              <select
                value={report.progression}
                onChange={(e) =>
                  update(
                    "progression",
                    e.target.value as PatientReport["progression"],
                  )
                }
              >
                {["unknown", "improving", "same", "worsening"].map((v) => (
                  <option key={v} value={v}>
                    {v === "same" ? "unchanged" : v}
                  </option>
                ))}
              </select>
            </label>
            {text("Pain location", report.location, (v) =>
              update("location", v),
            )}
            <label className="field">
              <span>Pain severity, 0–10 (optional)</span>
              <input
                type="number"
                min={0}
                max={10}
                value={report.pain ?? ""}
                onChange={(e) =>
                  update(
                    "pain",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="button emergency-button"
              onClick={() => onEmergency(report)}
            >
              Demonstrate an emergency warning now
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="stack-form">
            {visibleQuestions(report).length ? (
              visibleQuestions(report).map((key) => (
                <div key={key}>
                  {freeTextQuestions.has(key)
                    ? text(
                        questionLabels[key],
                        report.answers[key] ?? "",
                        (v) =>
                          update("answers", { ...report.answers, [key]: v }),
                      )
                    : choice(
                        questionLabels[key],
                        report.answers[key] ?? "unknown",
                        (v) => {
                          update("answers", { ...report.answers, [key]: v });
                          if (key === "breathing_warning" && v === "yes")
                            onEmergency({
                              ...report,
                              answers: { ...report.answers, [key]: v },
                            });
                        },
                      )}
                </div>
              ))
            ) : (
              <p>
                No additional questions for these symptoms. You can add details
                in the main complaint.
              </p>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="stack-form">
            <fieldset>
              <legend>Previous medical conditions</legend>
              <div className="demo-checks">
                {conditions.map((c) => (
                  <label key={c}>
                    <input
                      type="checkbox"
                      checked={report.history.conditions.includes(c)}
                      onChange={(e) =>
                        update("history", {
                          ...report.history,
                          status: "recorded",
                          conditions: e.target.checked
                            ? [...report.history.conditions, c]
                            : report.history.conditions.filter((x) => x !== c),
                        })
                      }
                    />{" "}
                    {readable(c)}
                  </label>
                ))}
              </div>
            </fieldset>
            {text("Relevant medical history", report.history.details, (v) =>
              update("history", {
                ...report.history,
                details: v,
                status:
                  v || report.history.conditions.length
                    ? "recorded"
                    : "unknown",
              }),
            )}
            {(["surgery", "hospitalised", "similar_before"] as const).map(
              (key) => (
                <div key={key}>
                  {choice(
                    {
                      surgery: "Previous operations or procedures?",
                      hospitalised: "Previous hospitalisations?",
                      similar_before: "Previous similar episodes?",
                    }[key],
                    report.history[key],
                    (v) => update("history", { ...report.history, [key]: v }),
                  )}
                </div>
              ),
            )}
            {report.history.surgery === "yes" &&
              text(
                "Surgery or procedure details",
                report.history.surgery_details,
                (v) =>
                  update("history", { ...report.history, surgery_details: v }),
              )}
          </div>
        )}
        {step === 4 && (
          <div className="stack-form">
            {text(
              "Current medication (fictional)",
              report.medications[0]?.name ?? "",
              (v) => {
                setReport((r) => ({
                  ...r,
                  medication_status: v ? "recorded" : "unknown",
                  medications: v
                    ? [
                        {
                          name: v,
                          dose: r.medications[0]?.dose ?? "",
                          frequency: r.medications[0]?.frequency ?? "",
                          details: "Patient-reported demo information",
                        },
                      ]
                    : [],
                }));
              },
            )}
            {report.medications.length > 0 && (
              <>
                {text("Dose, if known", report.medications[0].dose, (v) =>
                  update("medications", [
                    { ...report.medications[0], dose: v },
                  ]),
                )}
                {text(
                  "Frequency, if known",
                  report.medications[0].frequency,
                  (v) =>
                    update("medications", [
                      { ...report.medications[0], frequency: v },
                    ]),
                )}
              </>
            )}
            {text(
              "Known allergy (fictional)",
              report.allergies[0]?.substance ?? "",
              (v) =>
                setReport((r) => ({
                  ...r,
                  allergy_status: v ? "recorded" : "unknown",
                  allergies: v
                    ? [
                        {
                          substance: v,
                          reaction: r.allergies[0]?.reaction ?? "",
                        },
                      ]
                    : [],
                })),
            )}
            {report.allergies.length > 0 &&
              text(
                "Allergy reaction, if known",
                report.allergies[0].reaction,
                (v) =>
                  update("allergies", [
                    { ...report.allergies[0], reaction: v },
                  ]),
              )}
            <p>
              Blank fields remain unknown. No medication or treatment advice is
              generated.
            </p>
          </div>
        )}
        {step === 5 && (
          <>
            <PatientReview report={report} />
            <label className="demo-consent">
              <input
                type="checkbox"
                checked={report.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />{" "}
              I reviewed these fictional answers for this demonstration.
            </label>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="button-row spaced">
          <button
            type="button"
            className="button"
            disabled={step === 0}
            onClick={() => {
              setError("");
              setStep(step - 1);
            }}
          >
            Back
          </button>
          <button className="button primary" type="submit">
            {step === 5 ? "Submit Assessment" : "Continue"}
          </button>
        </div>
      </form>
    </section>
  );
}
