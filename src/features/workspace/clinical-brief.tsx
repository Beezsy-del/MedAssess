"use client";
import { useState } from "react";
import { useWorkspace } from "./context";
import { Modal } from "@/components/ui";
import { reportSchema } from "@/features/questionnaire/model";
import {
  clinicalConsiderations,
  protocolSchema,
} from "@/features/questionnaire/rules";
import { canCommand } from "@/features/access/policy";
export function ClinicalBrief({ encounterId }: { encounterId: string }) {
  const { data, command, busy, setMessage } = useWorkspace();
  const [action, setAction] = useState("");
  const encounter = data.encounters.find((e) => e.id === encounterId);
  if (!encounter) return null;
  const record = data.patientReports.find(
    (r) => r.encounter_id === encounterId,
  );
  const parsed = reportSchema.safeParse(record?.answers);
  const report = parsed.success ? parsed.data : null;
  const assessment = data.preliminaryAssessments.find(
    (a) => a.encounter_id === encounterId,
  );
  const protocol = data.protocols.find((p) => p.status === "active");
  const config = protocolSchema.safeParse(protocol?.configuration);
  const considerations = clinicalConsiderations(
    report,
    protocol && config.success
      ? { ...protocol, configuration: config.data }
      : null,
  );
  const closed = ["DISCHARGED", "TRANSFERRED", "CANCELLED"].includes(
    encounter.status,
  );
  const eligible = data.departments.filter(
    (d) =>
      d.id !== encounter.department_id &&
      (action !== "opd_route" ||
        (d.outpatient &&
          d.routing_reviewed_at &&
          d.accepted_categories.includes(encounter.category) &&
          encounter.category !== "RED" &&
          !encounter.emergency)),
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!encounter) return;
    const form = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {
      operation_id: crypto.randomUUID(),
      encounter_id: encounter.id,
      version: encounter.version,
      reason: form.get("reason"),
    };
    if (action === "resource_request") values.kind = "Stretcher";
    if (action === "vitals")
      for (const key of [
        "pulse",
        "spo2",
        "respiratory_rate",
        "systolic",
        "temperature",
      ])
        values[key] = form.get(key) === "" ? null : Number(form.get(key));
    if (action === "opd_route" || action === "department_referral")
      values.department_id = form.get("department_id");
    if (action === "department_referral") {
      values.urgency = form.get("urgency");
      values.observations = form.get("observations");
    }
    try {
      await command(action, values);
      setAction("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    }
  }
  return (
    <section className="panel panel-copy spaced">
      <div className="section-title">
        <h2>Patient medical brief</h2>
        <span>
          {record
            ? new Date(record.submitted_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })
            : "No patient questionnaire yet"}
        </span>
      </div>
      {report ? (
        <>
          <p>
            <strong>Patient-reported, unverified:</strong> {report.complaint}
          </p>
          <dl className="brief-grid">
            <div>
              <dt>Symptoms / onset</dt>
              <dd>
                {report.symptoms.join(", ").replaceAll("_", " ") || "Unknown"} ·{" "}
                {report.onset || "Onset unknown"}
              </dd>
            </div>
            <div>
              <dt>Progression / pain</dt>
              <dd>
                {report.progression} ·{" "}
                {report.pain === null ? "Pain unknown" : `${report.pain}/10`}
              </dd>
            </div>
            <div>
              <dt>Medical history</dt>
              <dd>
                {report.history.status.replaceAll("_", " ")}{" "}
                {report.history.conditions.join(", ").replaceAll("_", " ")}{" "}
                {report.history.details}
              </dd>
            </div>
            <div>
              <dt>Prescription medicines</dt>
              <dd>
                {report.medication_status.replaceAll("_", " ")}
                {report.medications.map((m, i) => (
                  <p key={i}>
                    {m.name} · {m.dose || "Dose unknown"} ·{" "}
                    {m.frequency || "Frequency unknown"} {m.details}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt>Allergies</dt>
              <dd>
                {report.allergy_status.replaceAll("_", " ")}
                {report.allergies.map((a, i) => (
                  <p key={i}>
                    {a.substance}: {a.reaction || "Reaction unknown"}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt>Warning reports</dt>
              <dd>
                {report.warning_signs.join(", ") ||
                  "No explicit warning reported; this does not establish absence of risk."}
              </dd>
            </div>
            <div>
              <dt>Patient measurements</dt>
              <dd>
                {Object.entries(report.self_reported_vitals).map(
                  ([key, value]) => (
                    <span key={key}>
                      {key.replaceAll("_", " ")}: {value ?? "unknown"};{" "}
                    </span>
                  ),
                )}
              </dd>
            </div>
            <div>
              <dt>Assistance / additional information</dt>
              <dd>
                {report.identity.assistance} {report.identity.helper_name}{" "}
                {report.access_needs} {report.additional}
              </dd>
            </div>
          </dl>
          <details>
            <summary>Complete patient responses and changes</summary>
            {data.patientReports
              .filter((r) => r.encounter_id === encounterId)
              .map((r) => (
                <article key={r.id}>
                  <h3>
                    {new Date(r.submitted_at).toLocaleString()} · {r.source}
                  </h3>
                  <pre className="report-json">
                    {JSON.stringify(r.answers, null, 2)}
                  </pre>
                </article>
              ))}
          </details>
        </>
      ) : (
        <p>
          Insufficient patient-reported information. Ask the patient or
          assisting person; missing history is not a normal finding.
        </p>
      )}
      {assessment && (
        <div>
          <h3>Preliminary assessment: {assessment.category}</h3>
          <p>
            {Array.isArray(assessment.reasons)
              ? assessment.reasons.join(" ")
              : "Human review required"}
          </p>
          <small>
            Protocol {assessment.protocol_version}. Preliminary decision
            support; clinical use disabled.
          </small>
        </div>
      )}
      <h3>Possible conditions to consider — not a confirmed diagnosis.</h3>
      {considerations.length ? (
        considerations.map((c) => (
          <p key={c.label}>
            <strong>{c.label}</strong> Supporting reported symptoms:{" "}
            {c.symptoms.join(", ").replaceAll("_", " ")}. {c.limitations}{" "}
            <a href={c.reference} target="_blank" rel="noreferrer">
              Protocol reference
            </a>
          </p>
        ))
      ) : (
        <p>
          Insufficient information for clinical consideration. Clinician
          assessment is required.
        </p>
      )}
      <div className="button-row spaced">
        {!closed &&
          [
            ["vitals", "Record measured vitals"],
            ["escalate_doctor", "Request doctor review"],
            ["resource_request", "Request stretcher"],
            ["opd_route", "Direct to OPD"],
            ["department_referral", "Refer to another department"],
          ]
            .filter(([key]) => canCommand(data.membership.role, key))
            .map(([key, label]) => (
              <button
                className="button"
                key={key}
                disabled={
                  busy ||
                  (key === "opd_route" &&
                    (encounter.emergency ||
                      !["GREEN", "YELLOW"].includes(encounter.category)))
                }
                onClick={() => setAction(key)}
              >
                {label}
              </button>
            ))}
      </div>
      {action && (
        <Modal
          title={
            action === "opd_route"
              ? "Direct to OPD"
              : action === "department_referral"
                ? "Refer to another department"
                : action === "vitals"
                  ? "Record measured vitals"
                  : action === "resource_request"
                    ? "Request stretcher"
                    : "Request doctor review"
          }
          onClose={() => setAction("")}
        >
          <form onSubmit={submit}>
            {(action === "opd_route" || action === "department_referral") && (
              <label className="field">
                Receiving department
                <select required name="department_id" defaultValue="">
                  <option value="" disabled>
                    Choose an eligible department
                  </option>
                  {eligible.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {!eligible.length && (
                  <span>
                    No eligible destination. Ask the responsible clinician to
                    review department routing.
                  </span>
                )}
              </label>
            )}
            {action === "department_referral" && (
              <>
                <label className="field">
                  Urgency
                  <select name="urgency" defaultValue={encounter.category}>
                    {["ASSESSMENT_REQUIRED", "GREEN", "YELLOW", "RED"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="field">
                  Clinical observations
                  <textarea name="observations" maxLength={3000} />
                </label>
              </>
            )}
            {action === "vitals" && (
              <>
                {[
                  ["pulse", "Pulse / min", 0, 400],
                  ["spo2", "SpO₂ %", 0, 100],
                  ["respiratory_rate", "Respiratory rate / min", 0, 150],
                  ["systolic", "Systolic pressure mmHg", 0, 350],
                  ["temperature", "Temperature °C", 20, 50],
                ].map(([key, label, min, max]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <input
                      type="number"
                      step="any"
                      name={String(key)}
                      min={min}
                      max={max}
                    />
                  </label>
                ))}
                <p>
                  Leave unmeasured values blank. These bounds validate input,
                  not clinical normality.
                </p>
              </>
            )}
            <label className="field">
              Reason
              <textarea name="reason" required minLength={5} maxLength={3000} />
            </label>
            <button className="button primary" disabled={busy}>
              Record action
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
export function DepartmentReferrals({ encounterId }: { encounterId?: string }) {
  const { data, command, busy, setMessage } = useWorkspace();
  const [selected, setSelected] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const rows = data.departmentReferrals.filter(
    (r) => !encounterId || r.encounter_id === encounterId,
  );
  return (
    <section className="panel panel-copy spaced">
      <h2>Department referrals</h2>
      {!rows.length && <p>No department referrals in this view.</p>}
      {rows.map((ref) => {
        const receiving = data.departmentMemberships.some(
          (m) =>
            m.user_id === data.userId &&
            m.department_id === ref.to_department_id,
        );
        const next: Record<string, string> = {
          REQUESTED: "ACKNOWLEDGED",
          ACKNOWLEDGED: "ACCEPTED",
          ACCEPTED: "ARRIVED",
          ARRIVED: "COMPLETED",
        };
        return (
          <article className="history-item" key={ref.id}>
            <h3>
              {
                data.encounters.find((e) => e.id === ref.encounter_id)
                  ?.reference
              }{" "}
              →{" "}
              {
                data.departments.find((d) => d.id === ref.to_department_id)
                  ?.name
              }
            </h3>
            <p>
              {ref.kind} · {ref.urgency} · {ref.status}
            </p>
            <p>{ref.reason}</p>
            <p>{ref.observations}</p>
            {receiving && next[ref.status] && (
              <button
                className="button"
                onClick={() =>
                  setSelected({ id: ref.id, status: next[ref.status] })
                }
              >
                Record {next[ref.status].toLowerCase()}
              </button>
            )}
            {ref.kind !== "OPD" &&
              ref.requested_by === data.userId &&
              ["REQUESTED", "ACKNOWLEDGED", "ACCEPTED"].includes(
                ref.status,
              ) && (
                <button
                  className="button"
                  onClick={() =>
                    setSelected({ id: ref.id, status: "CANCELLED" })
                  }
                >
                  Cancel referral
                </button>
              )}
            <details>
              <summary>Referral timeline</summary>
              {data.departmentReferralEvents
                .filter((e) => e.referral_id === ref.id)
                .map((e) => (
                  <p key={e.id}>
                    {new Date(e.created_at).toLocaleString()} · {e.status} ·{" "}
                    {data.staff.find((s) => s.user_id === e.actor)
                      ?.display_name ?? "Authorized staff"}
                    : {e.reason}
                  </p>
                ))}
            </details>
          </article>
        );
      })}
      {selected && (
        <Modal
          title={`Record ${selected.status.toLowerCase()}`}
          onClose={() => setSelected(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const ref = data.departmentReferrals.find(
                (r) => r.id === selected.id,
              );
              const encounter = data.encounters.find(
                (e) => e.id === ref?.encounter_id,
              );
              if (!ref || !encounter) return;
              try {
                await command("department_referral_status", {
                  operation_id: crypto.randomUUID(),
                  id: ref.id,
                  referral_version: ref.version,
                  encounter_id: encounter.id,
                  version: encounter.version,
                  status: selected.status,
                  reason: form.get("reason"),
                });
                setSelected(null);
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Referral update failed",
                );
              }
            }}
          >
            <label className="field">
              Movement / acknowledgement note
              <textarea name="reason" required minLength={5} maxLength={3000} />
            </label>
            <button className="button primary" disabled={busy}>
              Confirm
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
