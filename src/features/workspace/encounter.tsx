"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ClipboardPlus,
  History,
  QrCode,
  Activity,
} from "lucide-react";
import { useWorkspace } from "./context";
import { Badge, Status, Modal, Field, time, Empty } from "@/components/ui";
import { AssessmentForm } from "@/features/clinical/assessment-form";
import { QRToken } from "@/features/registration/reception";
import {
  transitions,
  type FlowStatus,
  terminalStatuses,
} from "@/features/flow/machine";
export function Encounter({ id }: { id: string }) {
  const { data, command, busy } = useWorkspace();
  const [modal, setModal] = useState(""),
    [error, setError] = useState(""),
    [token, setToken] = useState("");
  const e = data.encounters.find((e) => e.id === id);
  if (!e)
    return (
      <Empty
        title="Encounter unavailable"
        description="It may belong to another hospital or be outside this view."
      />
    );
  const encounter = e;
  const patient = data.patients.find((p) => p.id === e.patient_id);
  const clinical = ["doctor", "nurse", "triage_nurse"].includes(
    data.membership.role,
  );
  const closed = terminalStatuses.includes(e.status);
  async function formAction(
    event: React.FormEvent<HTMLFormElement>,
    action: string,
  ) {
    event.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await command(action, {
        ...f,
        encounter_id: encounter.id,
        version: encounter.version,
      });
      setModal("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  }
  async function rotate() {
    try {
      const result = await command("token", { encounter_id: encounter.id });
      setToken(String(result.token));
      setModal("qr");
    } catch {}
  }
  return (
    <>
      <Link href="/queues" className="back-link">
        <ArrowLeft size={16} /> Patient queue
      </Link>
      <div className="page-heading">
        <div>
          <p className="page-context">
            {e.reference} · Arrived {time(e.arrived_at)}
          </p>
          <h1>{patient?.name}</h1>
          <p>
            {patient?.age ?? "Unknown age"}
            {patient?.age !== null ? " years" : ""} ·{" "}
            {patient?.sex || "Sex not recorded"} ·{" "}
            {data.departments.find((d) => d.id === e.department_id)?.name ??
              "Department not assigned"}
          </p>
        </div>
        <div className="button-row">
          {!closed && (
            <>
              <button className="button" onClick={() => void rotate()}>
                <QrCode size={16} /> New patient pass
              </button>
              {clinical && (
                <button
                  className="button primary"
                  onClick={() => setModal("assessment")}
                >
                  <ClipboardPlus size={16} /> Assess patient
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="encounter-status">
        <Badge category={e.category} />
        <Status value={e.status} />
        {e.emergency && (
          <strong className="emergency-text">
            Emergency override active — direct staff assistance required
          </strong>
        )}
      </div>
      <div className="detail-grid">
        <div>
          <section className="panel detail-panel">
            <h2>Clinical summary</h2>
            <dl>
              <div>
                <dt>Presenting complaint</dt>
                <dd>{e.symptoms || "Not yet recorded"}</dd>
              </div>
              <div>
                <dt>Assigned clinician</dt>
                <dd>
                  {data.staff.find((s) => s.user_id === e.assigned_to)
                    ?.display_name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt>Next reassessment</dt>
                <dd>
                  {e.reassessment_due
                    ? time(e.reassessment_due)
                    : "Not yet scheduled"}
                </dd>
              </div>
              <div>
                <dt>Demo score (unvalidated)</dt>
                <dd>
                  {e.score === null
                    ? "Not available — insufficient information"
                    : `${e.score.toFixed(2)} / 100`}
                </dd>
              </div>
              <div>
                <dt>Protocol</dt>
                <dd>demo-1.0-unvalidated · clinical use disabled</dd>
              </div>
            </dl>
            {e.intake && Object.keys(e.intake).length > 0 && (
              <details>
                <summary>Patient-reported intake (unverified)</summary>
                <dl>
                  {Object.entries(e.intake).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k.replaceAll("_", " ")}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </section>
          <section className="panel detail-panel spaced">
            <div className="section-title">
              <h2>Observations & assessments</h2>
              <Activity size={18} />
            </div>
            {data.assessments
              .filter((a) => a.encounter_id === id)
              .map((a) => (
                <article className="history-item" key={a.id}>
                  <div>
                    <Badge category={a.confirmed_category} />
                    <small>{time(a.created_at)}</small>
                  </div>
                  <p>{a.reason}</p>
                  {a.input &&
                    typeof a.input === "object" &&
                    !Array.isArray(a.input) &&
                    "medical_history" in a.input && (
                      <details>
                        <summary>Staff intake observations</summary>
                        <dl>
                          {Object.entries(a.input)
                            .filter(([key]) =>
                              [
                                "arrival_method",
                                "medical_history",
                                "allergies",
                                "staff_notes",
                              ].includes(key),
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <dt>{key.replaceAll("_", " ")}</dt>
                                <dd>{String(value || "Not recorded")}</dd>
                              </div>
                            ))}
                        </dl>
                      </details>
                    )}
                  <small>
                    Original recommendation: {a.proposed_category} ·{" "}
                    {
                      data.staff.find((s) => s.user_id === a.actor)
                        ?.display_name
                    }
                  </small>
                </article>
              ))}
            {!data.assessments.some((a) => a.encounter_id === id) && (
              <p className="muted">
                No clinical assessment recorded. Human assessment required.
              </p>
            )}
            {data.vitals
              .filter((v) => v.encounter_id === id)
              .map((v) => (
                <div className="vitals-row" key={v.id}>
                  <span>
                    Pulse <strong>{v.pulse ?? "—"}</strong>
                  </span>
                  <span>
                    SpO₂ <strong>{v.spo2 ?? "—"}%</strong>
                  </span>
                  <span>
                    RR <strong>{v.respiratory_rate ?? "—"}</strong>
                  </span>
                  <span>
                    BP <strong>{v.systolic ?? "—"}</strong>
                  </span>
                  <span>
                    Temp <strong>{v.temperature ?? "—"}°</strong>
                  </span>
                </div>
              ))}
          </section>
          <section className="panel detail-panel spaced">
            <div className="section-title">
              <h2>Care notes & investigations</h2>
              {clinical && !closed && (
                <button
                  className="button small"
                  onClick={() => setModal("note")}
                >
                  Add note
                </button>
              )}
            </div>
            {data.notes
              .filter((n) => n.encounter_id === id)
              .map((n) => (
                <article className="history-item" key={n.id}>
                  <strong>{n.kind}</strong>
                  <p>{n.note}</p>
                  <small>
                    {time(n.created_at)} ·{" "}
                    {
                      data.staff.find((s) => s.user_id === n.actor)
                        ?.display_name
                    }
                  </small>
                </article>
              ))}
            {!data.notes.some((n) => n.encounter_id === id) && (
              <p className="muted">No care notes yet.</p>
            )}
          </section>
        </div>
        <aside>
          <section className="panel detail-panel">
            <h2>Next step</h2>
            {clinical && !closed && (
              <div className="button-row">
                <button
                  className="button"
                  onClick={() => setModal("reassessment")}
                >
                  Report deterioration
                </button>
                <button
                  className="button"
                  onClick={() => setModal("subpriority")}
                >
                  Edit clinical subpriority
                </button>
                <button className="button" onClick={() => setModal("shortage")}>
                  Record resource shortage
                </button>
              </div>
            )}
            {data.membership.role === "doctor" && (
              <button
                className="button spaced"
                onClick={() => setModal("follow_up")}
              >
                Schedule follow-up
              </button>
            )}
            {data.reassessments
              .filter((r) => r.encounter_id === id)
              .map((r) => (
                <article className="history-item" key={r.id}>
                  <strong>
                    {r.resolved_at
                      ? "Reassessment completed"
                      : "Reassessment required"}
                  </strong>
                  <p>{r.reason}</p>
                  <small>{time(r.created_at)}</small>
                </article>
              ))}
            {data.shortages
              .filter((r) => r.encounter_id === id)
              .map((r) => (
                <article className="history-item" key={r.id}>
                  <strong>Resource shortage: {r.kind}</strong>
                  <p>{r.reason}</p>
                  <small>
                    {time(r.created_at)} · Coordination alert recorded
                  </small>
                </article>
              ))}
            {data.followUps
              .filter((r) => r.encounter_id === id)
              .map((r) => (
                <article className="history-item" key={r.id}>
                  <strong>Follow-up: {time(r.due_at)}</strong>
                  <p>{r.instructions}</p>
                </article>
              ))}
            <p>Validated transitions preserve the patient’s care history.</p>
            {!closed && (
              <button
                className="button primary full"
                onClick={() => setModal("transition")}
              >
                Update patient flow
              </button>
            )}
            {data.membership.role === "doctor" && !closed && (
              <button
                className="button full spaced"
                onClick={() => setModal("referral")}
              >
                Initiate referral
              </button>
            )}
            <Link className="button full spaced" href="/resources">
              Review available resources
            </Link>
          </section>
          <section className="panel detail-panel spaced">
            <h2>
              <History size={18} /> Encounter timeline
            </h2>
            <ol className="timeline">
              {data.events
                .filter((event) => event.encounter_id === id)
                .map((event) => (
                  <li key={event.id}>
                    <strong>
                      {event.to_status.toLowerCase().replaceAll("_", " ")}
                    </strong>
                    <p>{event.reason}</p>
                    <small>
                      {time(event.created_at)} ·{" "}
                      {data.staff.find((s) => s.user_id === event.actor)
                        ?.display_name ?? "Patient / system"}
                    </small>
                  </li>
                ))}
            </ol>
          </section>
        </aside>
      </div>
      {modal && (
        <Modal
          title={
            ["reassessment", "subpriority", "shortage", "follow_up"].includes(
              modal,
            )
              ? {
                  reassessment: "Report deterioration",
                  subpriority: "Edit clinical subpriority",
                  shortage: "Record resource shortage",
                  follow_up: "Schedule follow-up",
                }[modal]!
              : modal === "assessment"
                ? "Clinical assessment"
                : modal === "qr"
                  ? "Secure patient pass"
                  : modal === "note"
                    ? "Add care documentation"
                    : modal === "referral"
                      ? "Initiate referral"
                      : "Update patient flow"
          }
          onClose={() => {
            setModal("");
            setError("");
          }}
        >
          {modal === "assessment" ? (
            <AssessmentForm encounter={e} onComplete={() => setModal("")} />
          ) : modal === "qr" ? (
            <QRToken token={token} reference={e.reference} />
          ) : (
            <form
              className="stack-form"
              onSubmit={(event) => void formAction(event, modal)}
            >
              {[
                "reassessment",
                "subpriority",
                "shortage",
                "follow_up",
              ].includes(modal) ? (
                <>
                  <p className="form-note">
                    Urgency remains unchanged until a qualified clinician
                    reassesses. Contact staff directly for immediate help.
                  </p>
                  {modal === "subpriority" && (
                    <Field label="Clinical subpriority (0–10)">
                      <input
                        type="number"
                        name="sub_priority"
                        min="0"
                        max="10"
                        step="1"
                        required
                        defaultValue={e.sub_priority}
                      />
                    </Field>
                  )}
                  {modal === "shortage" && (
                    <Field label="Unavailable resource">
                      <select name="kind">
                        {[
                          "General bed",
                          "Emergency bed",
                          "ICU bed",
                          "Stretcher",
                          "Wheelchair",
                          "Equipment",
                        ].map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {modal === "follow_up" && (
                    <Field label="Follow-up date and time (include timezone)">
                      <input
                        name="due_at"
                        required
                        placeholder="2026-12-01T09:00:00+05:30"
                      />
                    </Field>
                  )}
                  <Field label="Reason / instructions">
                    <textarea
                      name="reason"
                      minLength={5}
                      maxLength={3000}
                      required
                    />
                  </Field>
                </>
              ) : modal === "transition" ? (
                <>
                  <Field label="Next status">
                    <select name="status" required>
                      {(
                        transitions[e.status as FlowStatus] as readonly string[]
                      )
                        .filter((s) => s !== "TRIAGE_COMPLETED")
                        .map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Assign clinician (required for staff assignment)">
                    <select name="assigned_to">
                      <option value="">Select clinician</option>
                      {data.staff
                        .filter((s) =>
                          ["doctor", "nurse", "triage_nurse"].includes(s.role),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.user_id}>
                            {s.display_name}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Handover / disposition notes and follow-up instructions">
                    <textarea
                      name="reason"
                      required
                      minLength={5}
                      maxLength={3000}
                    />
                  </Field>
                </>
              ) : modal === "note" ? (
                <>
                  <Field label="Note type">
                    <select name="kind">
                      <option>Assessment</option>
                      <option>Treatment</option>
                      {data.membership.role === "doctor" && (
                        <option>Investigation</option>
                      )}
                      <option>Handover</option>
                    </select>
                  </Field>
                  <Field label="Clinical documentation">
                    <textarea
                      name="note"
                      required
                      minLength={5}
                      maxLength={5000}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <p className="form-note">
                    External facility capacity is not verified. Record
                    receiving-team acceptance before transport.
                  </p>
                  <Field label="Receiving facility">
                    <select name="facility_id" required>
                      {data.facilities.map((f) => (
                        <option value={f.id} key={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Referral reason">
                    <textarea name="reason" required minLength={5} />
                  </Field>
                  <Field label="Clinical summary">
                    <textarea name="summary" required minLength={5} />
                  </Field>
                  <Field label="Required transport">
                    <select name="transport">
                      <option>Ambulance required</option>
                      <option>Critical-care transport required</option>
                      <option>Clinician to determine</option>
                    </select>
                  </Field>
                </>
              )}
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <button disabled={busy} className="button primary">
                Save to encounter
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
