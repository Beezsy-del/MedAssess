"use client";
import { useState } from "react";
import { assess, emergencySigns, type ClinicalInput } from "./engine";
import { Field, Badge } from "@/components/ui";
import { useWorkspace } from "@/features/workspace/context";
import type { Row } from "@/lib/data";
export function AssessmentForm({
  encounter,
  onComplete,
}: {
  encounter: Row<"patient_encounters">;
  onComplete: () => void;
}) {
  const { command, busy } = useWorkspace();
  const [error, setError] = useState("");
  const [input, setInput] = useState<ClinicalInput>({
    warningSigns: [],
    symptoms: encounter.symptoms,
    pain: null,
    worsening: null,
    verified: false,
    vitals: {
      pulse: null,
      spo2: null,
      respiratoryRate: null,
      systolic: null,
      temperature: null,
    },
  });
  const result = assess(input);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    try {
      await command("assess", {
        encounter_id: encounter.id,
        version: encounter.version,
        input,
        category: f.get("category"),
        reason: f.get("reason"),
      });
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    }
  }
  return (
    <form onSubmit={save} className="stack-form">
      <p className="form-note">
        Demonstration protocol. Enter actual observations only in an approved
        clinical deployment. Blank vital signs remain unknown.
      </p>
      <fieldset>
        <legend>Reported or observed emergency signs</legend>
        <div className="check-grid">
          {emergencySigns.map((sign) => (
            <label className="check" key={sign}>
              <input
                type="checkbox"
                checked={input.warningSigns.includes(sign)}
                onChange={(e) =>
                  setInput({
                    ...input,
                    warningSigns: e.target.checked
                      ? [...input.warningSigns, sign]
                      : input.warningSigns.filter((s) => s !== sign),
                  })
                }
              />
              {sign}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Symptoms / current observations">
        <textarea
          value={input.symptoms}
          onChange={(e) => setInput({ ...input, symptoms: e.target.value })}
          maxLength={3000}
        />
      </Field>
      <div className="form-grid">
        {(
          [
            ["pulse", "Pulse / min", 0, 400],
            ["spo2", "SpO₂ %", 0, 100],
            ["respiratoryRate", "Respiratory rate / min", 0, 150],
            ["systolic", "Systolic BP mmHg", 0, 350],
            ["temperature", "Temperature °C", 20, 50],
          ] as const
        ).map(([key, label, min, max]) => (
          <Field key={key} label={label}>
            <input
              type="number"
              step="0.1"
              min={min}
              max={max}
              value={input.vitals[key] ?? ""}
              onChange={(e) =>
                setInput({
                  ...input,
                  vitals: {
                    ...input.vitals,
                    [key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            />
          </Field>
        ))}
        <Field label="Pain / 10">
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={input.pain ?? ""}
            onChange={(e) =>
              setInput({
                ...input,
                pain: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
      </div>
      <Field label="Symptoms worsening?">
        <select
          value={input.worsening === null ? "" : String(input.worsening)}
          onChange={(e) =>
            setInput({
              ...input,
              worsening:
                e.target.value === "" ? null : e.target.value === "true",
            })
          }
        >
          <option value="">Unknown</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </Field>
      <label className="check">
        <input
          type="checkbox"
          checked={input.verified}
          onChange={(e) => setInput({ ...input, verified: e.target.checked })}
        />
        I have performed a human clinical assessment of the available
        information.
      </label>
      <div className="assessment-result">
        <Badge category={result.category} />
        <ul>
          {result.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <strong>
          Demo score:{" "}
          {result.score === null
            ? "Not available — insufficient information"
            : `${result.score.toFixed(2)} / 100`}
        </strong>
        <p>
          Unvalidated. Never used to override clinical category or rank
          patients.
        </p>
        {result.breakdown.map((b) => (
          <small key={b.label}>
            {b.label}: {b.value.toFixed(2)}
            <br />
          </small>
        ))}
      </div>
      <Field label="Clinician-confirmed category">
        <select name="category" required defaultValue={encounter.category}>
          <option value="ASSESSMENT_REQUIRED">Assessment required</option>
          <option value="RED">RED — Critical / emergency</option>
          <option value="YELLOW">YELLOW — Urgent assessment</option>
          <option value="GREEN">GREEN — Non-immediate</option>
        </select>
      </Field>
      <Field label="Clinical reasoning / reason for override">
        <textarea name="reason" required minLength={5} maxLength={3000} />
      </Field>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? "Saving…" : "Save clinical assessment"}
      </button>
    </form>
  );
}
