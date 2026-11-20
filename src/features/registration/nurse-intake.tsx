"use client";
import { BedManagement } from "@/features/beds/bed-management";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowRight,
  Check,
  Save,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { useWorkspace, CommandError } from "@/features/workspace/context";
import { Badge, Field, Status, time } from "@/components/ui";
import { ClinicalFields } from "@/features/clinical/assessment-form";
import { assess } from "@/features/clinical/engine";
import { intakeSchema } from "@/features/commands/schema";
import { rankQueue } from "@/features/queue/rank";
import { PatientTable } from "@/features/workspace/patient-table";
import {
  listOutbox,
  saveOutbox,
  removeDraft,
  type OutboxItem,
} from "@/features/offline/outbox";
import type { Row } from "@/lib/data";
import {
  emptyIntake,
  categories,
  type IntakeDraft,
  type IntakeReceipt,
} from "./intake-model";
const terminal = ["DISCHARGED", "ADMITTED", "TRANSFERRED", "CANCELLED"];
export function NurseIntake() {
  const { data, command, online, busy } = useWorkspace();
  const [draft, setDraft] = useState(() => emptyIntake(crypto.randomUUID()));
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [step, setStep] = useState(0),
    [query, setQuery] = useState("");
  const [rawMatches, setMatches] = useState<Row<"patients">[]>([]),
    [selected, setSelected] = useState<Row<"patients"> | null>(null);
  const [matchedQuery, setMatchedQuery] = useState("");
  const [searching, setSearching] = useState(false),
    [hasMore, setHasMore] = useState(false),
    [searchError, setSearchError] = useState("");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState<IntakeReceipt | null>(null),
    [drafts, setDrafts] = useState<OutboxItem[]>([]);
  const [savingDraft, setSavingDraft] = useState(false),
    [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<IntakeDraft | null>(null),
    [confirmed, setConfirmed] = useState(false);
  const [filter, setFilter] = useState("Recent registrations"),
    [boardQuery, setBoardQuery] = useState("");
  const locked = useRef(false),
    changed = useRef(false);
  const formRef = useRef<HTMLFormElement>(null),
    headingRef = useRef<HTMLHeadingElement>(null);
  const allowed = ["nurse", "triage_nurse", "doctor"].includes(
    data.membership.role,
  );
  function update(patch: Partial<IntakeDraft>) {
    changed.current = true;
    setDraft((d) => ({ ...d, ...patch }));
    setConfirmed(false);
    setError("");
  }
  async function loadDrafts() {
    setDrafts(
      (await listOutbox(data.userId, data.hospital.id)).filter(
        (d) => d.kind === "intake-draft",
      ),
    );
  }
  useEffect(() => {
    void listOutbox(data.userId, data.hospital.id)
      .then((rows) => setDrafts(rows.filter((d) => d.kind === "intake-draft")))
      .catch(() =>
        setError(
          "Device drafts could not be opened. Keep this device and retry.",
        ),
      );
  }, [data.userId, data.hospital.id]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (changed.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const lookup =
    mode === "existing" ? query : draft.unidentified ? "" : draft.name;
  const matches = matchedQuery === lookup ? rawMatches : [];
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setMatches([]);
      setSearchError("");
      setHasMore(false);
      setSearching(false);
      if (lookup.trim().length < 2 || !allowed || !online) return;
      setSearching(true);
      void fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital: data.hospital.id, query: lookup }),
        signal: controller.signal,
      })
        .then(async (r) => {
          const value = await r.json();
          if (!r.ok) throw new Error(value.error);
          if (!controller.signal.aborted) {
            setMatches(value.patients);
            setMatchedQuery(lookup);
            setHasMore(value.hasMore);
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted)
            setSearchError(
              e instanceof Error ? e.message : "Patient search unavailable.",
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [lookup, allowed, online, data.hospital.id]);
  const activeForPatient = data.encounters.filter(
    (e) => e.patient_id === draft.patient_id && !terminal.includes(e.status),
  );
  const recommendation = assess(draft.input);
  function choose(p: Row<"patients">) {
    setSelected(p);
    setMode("existing");
    update({
      ...emptyIntake(draft.operation_id),
      patient_id: p.id,
      name: p.name,
      age: p.date_of_birth ? null : p.age,
      date_of_birth: p.date_of_birth,
      sex: p.sex ?? "",
      phone: p.phone ?? "",
      identifier: p.identifier ?? "",
      emergency_contact: p.emergency_contact ?? "",
      unidentified: p.unidentified,
      identity_confirmed: false,
      encounter_id: undefined,
      version: undefined,
      new_visit_reason: "",
    });
  }
  function resumeEncounter(e: Row<"patient_encounters">) {
    const p = data.patients.find((p) => p.id === e.patient_id);
    if (!p) return;
    choose(p);
    setReceipt(null);
    setStep(0);
    update({
      operation_id: crypto.randomUUID(),
      encounter_id: e.id,
      version: e.version,
      department_id: e.department_id ?? "",
      input: { ...emptyIntake(draft.operation_id).input, symptoms: e.symptoms },
      category: "",
      reason: "",
    });
    formRef.current?.scrollIntoView({ block: "start" });
  }
  function navigate(next: number) {
    setStep(next);
    setError("");
    setTimeout(() => headingRef.current?.focus(), 0);
  }
  function identify() {
    if (!formRef.current?.reportValidity()) return;
    if (mode === "existing" && !draft.patient_id) {
      setError("Search for and select the patient before continuing.");
      return;
    }
    if (!draft.identity_confirmed) {
      setError("Confirm the patient's identity before continuing.");
      return;
    }
    if (draft.date_of_birth && draft.age !== null) {
      setError("Use date of birth or age, not both.");
      return;
    }
    if (
      activeForPatient.length &&
      !draft.encounter_id &&
      draft.new_visit_reason.trim().length < 5
    ) {
      setError(
        "Choose an active visit to assess, or explain why a new encounter is needed.",
      );
      return;
    }
    navigate(1);
  }
  function review() {
    if (!formRef.current?.reportValidity()) return;
    const parsed = intakeSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    navigate(2);
  }
  async function saveDraft() {
    setSavingDraft(true);
    setError("");
    try {
      await saveOutbox({
        id: draft.operation_id,
        user: data.userId,
        hospital: data.hospital.id,
        createdAt: new Date().toISOString(),
        attempts: 0,
        kind: "intake-draft",
        data: { draft, mode, selected, step, pending },
      });
      changed.current = false;
      await loadDrafts();
      setNotice(
        pending
          ? "Recovery draft saved. The hospital may already have received this submission; retry its unchanged confirmation to verify the outcome."
          : "Draft saved on this device. It has not been submitted or assigned to a queue. Reopen it here to review and confirm.",
      );
    } catch {
      setError(
        "Draft could not be saved. Your entries remain on this screen; do not close it.",
      );
    } finally {
      setSavingDraft(false);
    }
  }
  function resumeLocal(item: OutboxItem) {
    if (
      changed.current &&
      !window.confirm(
        "Replace the current unsaved entries with this saved draft?",
      )
    )
      return;
    const saved = item.data;
    setDraft(saved.draft as IntakeDraft);
    setSelected(saved.selected as Row<"patients"> | null);
    setMode(saved.mode as "new" | "existing");
    setStep(Number(saved.step) || 0);
    setPending((saved.pending as IntakeDraft | null) ?? null);
    setConfirmed(false);
    setReceipt(null);
    setError("");
    setNotice(
      "Draft restored. Review the patient and observations before confirming.",
    );
    changed.current = false;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current || !online || (!confirmed && !pending)) return;
    const payload = pending ?? draft;
    const parsed = intakeSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    locked.current = true;
    setSubmitting(true);
    setError("");
    setPending(payload);
    try {
      const result = await command("intake", parsed.data);
      setReceipt(result as IntakeReceipt);
      setPending(null);
      changed.current = false;
      try {
        await removeDraft(payload.operation_id, data.userId, data.hospital.id);
        await loadDrafts();
      } catch {
        setNotice(
          "Hospital submission succeeded. A local draft remains; retrying it cannot create another encounter.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Submission not confirmed. Your entries are retained.",
      );
      if (e instanceof CommandError && e.status < 500) setPending(null);
    } finally {
      locked.current = false;
      setSubmitting(false);
    }
  }
  function another() {
    setDraft(emptyIntake(crypto.randomUUID()));
    setSelected(null);
    setMode("new");
    setStep(0);
    setReceipt(null);
    setPending(null);
    setConfirmed(false);
    setQuery("");
    setError("");
    setNotice("");
    changed.current = false;
  }
  const board = data.encounters
    .filter((e) => {
      const p = data.patients.find((p) => p.id === e.patient_id);
      if (
        !`${p?.name} ${e.reference} ${e.patient_id}`
          .toLowerCase()
          .includes(boardQuery.toLowerCase())
      )
        return false;
      if (filter === "Awaiting assessment")
        return (
          !terminal.includes(e.status) &&
          (e.category === "ASSESSMENT_REQUIRED" ||
            e.status === "TRIAGE_PENDING")
        );
      if (filter === "Recently assigned")
        return (
          e.category !== "ASSESSMENT_REQUIRED" && !terminal.includes(e.status)
        );
      if (filter === "Reassessment")
        return (
          !terminal.includes(e.status) &&
          (e.deteriorating ||
            !!data.reassessments.find(
              (r) => r.encounter_id === e.id && !r.resolved_at,
            ))
        );
      return filter !== "Active queue" || !terminal.includes(e.status);
    })
    .sort(
      (a, b) =>
        Date.parse(
          filter === "Recently assigned" ? b.updated_at : b.arrived_at,
        ) -
        Date.parse(
          filter === "Recently assigned" ? a.updated_at : a.arrived_at,
        ),
    );
  if (!allowed)
    return (
      <section className="panel panel-copy">
        <h1>Clinical intake access required</h1>
        <p>
          A nurse, triage nurse or doctor must perform and confirm the
          assessment.
        </p>
        <Link href="/dashboard">Return to overview</Link>
      </section>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Nursing workspace</p>
          <h1>Patient registration</h1>
          <p>
            Identify the patient, assess their needs and confirm the next step.
          </p>
        </div>
        <Link className="button" href="/triage">
          Active triage queue <ArrowRight size={16} />
        </Link>
      </div>
      <div className="info-strip">
        <AlertCircle size={20} />
        <span>
          Synthetic demonstration. Emergency care must never wait for
          registration or a score.
        </span>
        <Link href="/emergency">Get help now</Link>
      </div>
      {notice && (
        <p className="form-note" role="status">
          {notice}
        </p>
      )}
      {receipt && (
        <BedManagement key={receipt.id} encounterId={receipt.id} embedded />
      )}
      {receipt ? (
        <section
          className="panel intake-success"
          aria-label="Registration confirmation"
        >
          <div className="success-title">
            <Check size={24} />
            <div>
              <h2>Registration and triage saved</h2>
              <p>
                The encounter is in the{" "}
                {receipt.category === "ASSESSMENT_REQUIRED"
                  ? "awaiting assessment"
                  : receipt.category.toLowerCase() + " priority"}{" "}
                workflow.
              </p>
            </div>
          </div>
          <div className="intake-identity">
            <UserRound size={24} />
            <div>
              <strong>{receipt.name}</strong>
              <small>Patient ID {receipt.patient_id}</small>
              <small>
                Encounter {receipt.reference} · {receipt.id}
              </small>
            </div>
            <Badge category={receipt.category} />
          </div>
          <dl className="intake-review">
            <div>
              <dt>Destination</dt>
              <dd>{receipt.department}</dd>
            </div>
            <div>
              <dt>Encounter status</dt>
              <dd>
                <Status value={receipt.status} />
              </dd>
            </div>
            <div>
              <dt>Registered</dt>
              <dd>{time(receipt.registered_at)}</dd>
            </div>
            <div>
              <dt>Assessment confirmed</dt>
              <dd>
                {time(receipt.confirmed_at)} · {receipt.actor_name}
              </dd>
            </div>
            <div>
              <dt>Presenting complaint</dt>
              <dd>{receipt.symptoms || "Not recorded"}</dd>
            </div>
            <div>
              <dt>Clinical reasoning</dt>
              <dd>{receipt.reason}</dd>
            </div>
          </dl>
          <div className="button-row">
            <button className="button primary" onClick={another}>
              <Plus size={16} /> Register another patient
            </button>
            <Link className="button" href={`/encounters/${receipt.id}`}>
              View encounter details
            </Link>
            <Link className="button" href="/triage">
              Updated triage queue
            </Link>
          </div>
        </section>
      ) : (
        <section className="panel intake-workspace">
          <ol className="intake-steps" aria-label="Registration progress">
            {[
              "Identify patient",
              "Initial assessment",
              "Confirm assignment",
            ].map((label, i) => (
              <li key={label} aria-current={i === step ? "step" : undefined}>
                <span>{i < step ? <Check size={16} /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          {step > 0 && (
            <div className="intake-identity">
              <UserRound size={22} />
              <div>
                <strong>{draft.name || "Unidentified patient"}</strong>
                <small>
                  {draft.patient_id
                    ? `Patient ID ${draft.patient_id}`
                    : "New patient record"}{" "}
                  ·{" "}
                  {draft.encounter_id ? "Existing encounter" : "New encounter"}
                </small>
              </div>
              <button
                type="button"
                className="button"
                disabled={!!pending}
                onClick={() => navigate(0)}
              >
                Review identity
              </button>
            </div>
          )}
          <form ref={formRef} onSubmit={submit} className="intake-form">
            <h2 ref={headingRef} tabIndex={-1}>
              {
                [
                  "Identify the patient",
                  "Assess and select priority",
                  "Review before confirming",
                ][step]
              }
            </h2>
            <fieldset
              disabled={submitting || !!pending}
              className="intake-fields"
            >
              {step === 0 && (
                <>
                  <div
                    className="intake-mode"
                    role="group"
                    aria-label="Patient registration type"
                  >
                    <button
                      type="button"
                      aria-pressed={mode === "new"}
                      onClick={() => {
                        setMode("new");
                        setSelected(null);
                        update({
                          ...emptyIntake(draft.operation_id),
                          patient_id: undefined,
                          encounter_id: undefined,
                          version: undefined,
                          name: "",
                          age: null,
                          date_of_birth: null,
                          phone: "",
                          identifier: "",
                          identity_confirmed: false,
                        });
                      }}
                    >
                      <Plus size={18} />
                      <span>
                        New patient<small>Create a patient record</small>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={mode === "existing"}
                      onClick={() => {
                        setMode("existing");
                        update({ identity_confirmed: false });
                      }}
                    >
                      <Search size={18} />
                      <span>
                        Find existing patient
                        <small>Use their saved hospital record</small>
                      </span>
                    </button>
                  </div>
                  {mode === "new" ? (
                    <>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={draft.unidentified}
                          onChange={(e) =>
                            update({
                              unidentified: e.target.checked,
                              name: e.target.checked
                                ? "Unidentified patient"
                                : "",
                              identity_confirmed: false,
                            })
                          }
                        />
                        Unidentified emergency patient / details unavailable
                      </label>
                      <div className="form-grid">
                        <Field label="Full name">
                          <input
                            autoComplete="off"
                            value={draft.name}
                            required={!draft.unidentified}
                            disabled={draft.unidentified}
                            maxLength={160}
                            onChange={(e) =>
                              update({
                                name: e.target.value,
                                identity_confirmed: false,
                              })
                            }
                          />
                        </Field>
                        <Field label="Date of birth (if known)">
                          <input
                            type="date"
                            value={draft.date_of_birth ?? ""}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(e) =>
                              update({
                                date_of_birth: e.target.value || null,
                                age: null,
                                identity_confirmed: false,
                              })
                            }
                          />
                        </Field>
                        <Field label="Age (if date of birth unknown)">
                          <input
                            type="number"
                            min={0}
                            max={130}
                            disabled={!!draft.date_of_birth}
                            value={draft.age ?? ""}
                            onChange={(e) =>
                              update({
                                age:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </Field>
                        <Field label="Sex (if relevant)">
                          <select
                            value={draft.sex}
                            onChange={(e) => update({ sex: e.target.value })}
                          >
                            <option value="">Not recorded</option>
                            <option>Female</option>
                            <option>Male</option>
                            <option>Intersex</option>
                            <option>Prefer not to say</option>
                          </select>
                        </Field>
                      </div>
                      <details className="intake-optional">
                        <summary>
                          Contact and identification details (optional)
                        </summary>
                        <div className="form-grid">
                          <Field label="Phone number">
                            <input
                              type="tel"
                              value={draft.phone}
                              maxLength={40}
                              onChange={(e) =>
                                update({ phone: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Existing hospital identifier / MRN">
                            <input
                              value={draft.identifier}
                              maxLength={80}
                              onChange={(e) =>
                                update({ identifier: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Emergency contact">
                            <input
                              value={draft.emergency_contact}
                              maxLength={300}
                              onChange={(e) =>
                                update({ emergency_contact: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                      </details>
                    </>
                  ) : (
                    <Field label="Search by patient ID, MRN, name, date of birth or phone">
                      <input
                        value={query}
                        placeholder="Name, ID, YYYY-MM-DD or phone"
                        maxLength={160}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setSelected(null);
                          update({
                            patient_id: undefined,
                            encounter_id: undefined,
                            version: undefined,
                            identity_confirmed: false,
                          });
                        }}
                      />
                    </Field>
                  )}
                  {searching && (
                    <p role="status">Searching hospital records…</p>
                  )}
                  {searchError && (
                    <p role="alert" className="error-text">
                      {searchError}
                    </p>
                  )}
                  {mode === "existing" &&
                    lookup.trim().length >= 2 &&
                    matchedQuery === lookup &&
                    !searching &&
                    !searchError &&
                    matches.length === 0 && (
                      <p role="status">
                        No matching patient records. Try another identifier or
                        choose New patient.
                      </p>
                    )}
                  {matches.length > 0 && (
                    <section
                      className="patient-matches"
                      aria-label="Matching patient records"
                    >
                      <h3>
                        {mode === "new"
                          ? "Check possible existing records"
                          : "Matching records"}
                      </h3>
                      <p>
                        Verify the patient ID and another known detail. Similar
                        names do not prove identity.
                      </p>
                      {matches.map((p) => (
                        <div key={p.id} className="patient-match">
                          <div>
                            <strong>{p.name}</strong>
                            <small>ID {p.id}</small>
                            <small>
                              {p.identifier ? `MRN ${p.identifier} · ` : ""}
                              {p.date_of_birth ??
                                (p.age !== null
                                  ? `Age ${p.age}`
                                  : "Age unknown")}{" "}
                              · {p.sex || "Sex not recorded"} ·{" "}
                              {p.phone || "Phone not recorded"}
                            </small>
                          </div>
                          <button
                            type="button"
                            className="button"
                            onClick={() => choose(p)}
                          >
                            Select patient
                          </button>
                        </div>
                      ))}
                      {hasMore && (
                        <p>
                          More matches exist. Refine the search with another
                          identifier.
                        </p>
                      )}
                    </section>
                  )}
                  {mode === "new" &&
                    matches.some(
                      (p) =>
                        p.name.trim().toLowerCase() ===
                        draft.name.trim().toLowerCase(),
                    ) && (
                      <Field label="If this is a different person, explain the identity check">
                        <textarea
                          value={draft.duplicate_reason}
                          minLength={10}
                          maxLength={1000}
                          onChange={(e) =>
                            update({ duplicate_reason: e.target.value })
                          }
                        />
                      </Field>
                    )}
                  {selected && mode === "existing" && (
                    <div className="intake-identity">
                      <UserRound size={22} />
                      <div>
                        <strong>Selected: {selected.name}</strong>
                        <small>Patient ID {selected.id}</small>
                        <small>
                          {selected.date_of_birth ??
                            `Age ${selected.age ?? "unknown"}`}{" "}
                          · {selected.phone || "No phone recorded"}
                        </small>
                      </div>
                    </div>
                  )}
                  {activeForPatient.length > 0 && (
                    <section className="active-visits">
                      <h3>This patient has an active visit</h3>
                      {activeForPatient.map((e) => (
                        <div className="list-row" key={e.id}>
                          <span>
                            {e.reference}
                            <small>
                              {time(e.arrived_at)} ·{" "}
                              {e.status.toLowerCase().replaceAll("_", " ")}
                            </small>
                          </span>
                          {["REGISTERED", "TRIAGE_PENDING"].includes(
                            e.status,
                          ) ? (
                            <button
                              type="button"
                              className="button"
                              onClick={() =>
                                update({
                                  encounter_id: e.id,
                                  version: e.version,
                                  department_id: e.department_id ?? "",
                                  input: {
                                    ...draft.input,
                                    symptoms: e.symptoms,
                                  },
                                })
                              }
                            >
                              {draft.encounter_id === e.id
                                ? "Selected visit"
                                : "Assess this visit"}
                            </button>
                          ) : (
                            <Link href={`/encounters/${e.id}`}>View visit</Link>
                          )}
                        </div>
                      ))}
                      {draft.encounter_id ? (
                        <button
                          type="button"
                          className="button"
                          onClick={() =>
                            update({
                              encounter_id: undefined,
                              version: undefined,
                            })
                          }
                        >
                          Create a separate new visit instead
                        </button>
                      ) : (
                        <Field label="Reason for a separate new encounter">
                          <textarea
                            value={draft.new_visit_reason}
                            minLength={5}
                            maxLength={1000}
                            required
                            onChange={(e) =>
                              update({ new_visit_reason: e.target.value })
                            }
                          />
                        </Field>
                      )}
                    </section>
                  )}
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={draft.identity_confirmed}
                      onChange={(e) =>
                        update({ identity_confirmed: e.target.checked })
                      }
                    />
                    {draft.unidentified
                      ? "I confirm this is a temporary record for an unidentified patient."
                      : "I verified the patient's identity and selected the correct record or new patient."}
                  </label>
                </>
              )}
              {step === 1 && (
                <>
                  <div className="form-grid">
                    <Field label="Arrival method (if known)">
                      <select
                        value={draft.arrival_method}
                        onChange={(e) =>
                          update({ arrival_method: e.target.value })
                        }
                      >
                        <option value="">Not recorded</option>
                        <option>Walk-in</option>
                        <option>Ambulance</option>
                        <option>Transfer</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="Department / destination">
                      <select
                        value={draft.department_id ?? ""}
                        onChange={(e) =>
                          update({ department_id: e.target.value })
                        }
                      >
                        <option value="">Awaiting assignment</option>
                        {data.departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <ClinicalFields
                    input={draft.input}
                    setInput={(input) => update({ input })}
                  />
                  <details className="intake-optional">
                    <summary>History, allergies and additional notes</summary>
                    <Field label="Relevant medical history">
                      <textarea
                        value={draft.history}
                        maxLength={3000}
                        onChange={(e) => update({ history: e.target.value })}
                      />
                    </Field>
                    <Field label="Allergies (blank means unknown)">
                      <textarea
                        value={draft.allergies}
                        maxLength={1000}
                        onChange={(e) => update({ allergies: e.target.value })}
                      />
                    </Field>
                    <Field label="Additional clinical notes">
                      <textarea
                        value={draft.notes}
                        maxLength={3000}
                        onChange={(e) => update({ notes: e.target.value })}
                      />
                    </Field>
                  </details>
                  <section className="intake-guidance">
                    <h3>Demonstration rule output</h3>
                    <Badge category={recommendation.category} />
                    <p>
                      {recommendation.emergency
                        ? "Emergency signs reported: get staff assistance immediately. Nurses cannot downgrade an emergency without doctor review."
                        : "No validated automatic recommendation is available. A human must select the final category; missing observations remain unknown."}
                    </p>
                    <small>
                      Unvalidated protocol. Blank fields are not normal
                      findings.
                    </small>
                  </section>
                  <fieldset className="category-options">
                    <legend>Choose the final triage category</legend>
                    {categories.map(([value, label, description]) => (
                      <label
                        key={value}
                        className={`category-option ${value.toLowerCase()}`}
                      >
                        <input
                          type="radio"
                          name="triage-category"
                          required
                          value={value}
                          checked={draft.category === value}
                          onChange={() => update({ category: value })}
                        />
                        <span>
                          <strong>
                            {value === "ASSESSMENT_REQUIRED"
                              ? label
                              : `${value} — ${label}`}
                          </strong>
                          <small>{description}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <Field label="Clinical justification / reason for override">
                    <textarea
                      required
                      minLength={5}
                      maxLength={3000}
                      value={draft.reason}
                      onChange={(e) => update({ reason: e.target.value })}
                    />
                  </Field>
                </>
              )}
              {step === 2 && (
                <>
                  <p>
                    Confirm the selected patient and priority. This submits
                    registration and assessment together.
                  </p>
                  {draft.category && <Badge category={draft.category} />}
                  <dl className="intake-review">
                    <div>
                      <dt>Patient</dt>
                      <dd>{draft.name}</dd>
                    </div>
                    <div>
                      <dt>Visit</dt>
                      <dd>
                        {draft.encounter_id
                          ? data.encounters.find(
                              (e) => e.id === draft.encounter_id,
                            )?.reference
                          : "New encounter"}
                      </dd>
                    </div>
                    <div>
                      <dt>Presenting complaint</dt>
                      <dd>{draft.input.symptoms || "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Destination</dt>
                      <dd>
                        {data.departments.find(
                          (d) => d.id === draft.department_id,
                        )?.name ?? "Awaiting assignment"}
                      </dd>
                    </div>
                    <div>
                      <dt>Warning signs</dt>
                      <dd>
                        {draft.input.warningSigns.join(", ") ||
                          "No signs selected; this does not establish normal findings"}
                      </dd>
                    </div>
                    <div>
                      <dt>Observations</dt>
                      <dd>
                        Pulse {draft.input.vitals.pulse ?? "unknown"} · SpO₂{" "}
                        {draft.input.vitals.spo2 ?? "unknown"} · Respiratory
                        rate {draft.input.vitals.respiratoryRate ?? "unknown"} ·
                        Systolic BP {draft.input.vitals.systolic ?? "unknown"} ·
                        Temperature{" "}
                        {draft.input.vitals.temperature ?? "unknown"} · Pain{" "}
                        {draft.input.pain ?? "unknown"}
                      </dd>
                    </div>
                    <div>
                      <dt>Clinical reasoning</dt>
                      <dd>{draft.reason}</dd>
                    </div>
                    <div>
                      <dt>Responsible clinician</dt>
                      <dd>{data.membership.display_name}</dd>
                    </div>
                  </dl>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    I confirm this patient, encounter and triage assignment.
                  </label>
                </>
              )}
            </fieldset>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            {pending && !submitting && (
              <p className="form-note">
                The server acknowledgement is uncertain. Retry the same
                submission to check its outcome safely. Entries are locked to
                prevent a second or changed assignment.
              </p>
            )}
            {!online && (
              <p className="form-note">
                Offline: save a device draft and review it after reconnecting.
                No assignment or notification has been sent. Contact staff
                directly for emergencies.
              </p>
            )}
            <div className="intake-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="button"
                  disabled={submitting || !!pending}
                  onClick={() => navigate(step - 1)}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="button"
                disabled={savingDraft || submitting}
                onClick={() => void saveDraft()}
              >
                <Save size={16} />
                {savingDraft ? "Saving draft…" : "Save device draft"}
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  className="button primary"
                  onClick={step === 0 ? identify : review}
                >
                  {step === 0 ? "Continue to assessment" : "Review assignment"}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="button primary"
                  disabled={
                    !online || busy || submitting || (!confirmed && !pending)
                  }
                >
                  {submitting
                    ? "Confirming…"
                    : pending
                      ? "Retry confirmation"
                      : "Confirm registration & triage"}
                </button>
              )}
            </div>
          </form>
        </section>
      )}
      {drafts.length > 0 && (
        <section className="panel spaced panel-copy">
          <h2>Saved device drafts</h2>
          <p>
            These drafts have not been automatically submitted. Sign-out clears
            device drafts.
          </p>
          {drafts.map((d) => (
            <div className="list-row" key={d.id}>
              <span>Registration draft · {time(d.createdAt)}</span>
              <button
                type="button"
                className="button"
                disabled={submitting}
                onClick={() => resumeLocal(d)}
              >
                Resume draft
              </button>
            </div>
          ))}
        </section>
      )}
      <section
        className="panel spaced intake-board"
        hidden={step > 0 && !receipt}
      >
        <div className="section-title">
          <h2>Patient flow</h2>
          <div className="button-row">
            <button
              className="button"
              disabled={!!pending || submitting}
              onClick={() => {
                if (
                  changed.current &&
                  !confirm(
                    "Start another registration? Save a device draft first to keep these entries.",
                  )
                )
                  return;
                another();
                window.scrollTo({ top: 0 });
              }}
            >
              Quick patient registration
            </button>
            <input
              aria-label="Search nursing patient flow"
              placeholder="Search patient or encounter"
              value={boardQuery}
              onChange={(e) => setBoardQuery(e.target.value)}
            />
          </div>
        </div>
        <div
          className="tabs"
          role="group"
          aria-label="Nursing patient flow filters"
        >
          {[
            "Recent registrations",
            "Awaiting assessment",
            "Recently assigned",
            "Reassessment",
            "Active queue",
          ].map((f) => (
            <button
              key={f}
              type="button"
              className={f === filter ? "selected" : ""}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {filter === "Awaiting assessment" &&
          board.slice(0, 8).map((e) => (
            <div className="list-row intake-resume" key={e.id}>
              <span>
                {data.patients.find((p) => p.id === e.patient_id)?.name}
                <small>{e.reference}</small>
              </span>
              {["REGISTERED", "TRIAGE_PENDING"].includes(e.status) ? (
                <button
                  className="button"
                  disabled={!!pending || submitting}
                  onClick={() => {
                    if (
                      changed.current &&
                      !confirm(
                        "Replace unsaved entries? Save a device draft first to retain them.",
                      )
                    )
                      return;
                    resumeEncounter(e);
                  }}
                >
                  Assess in registration
                </button>
              ) : (
                <Link href={`/encounters/${e.id}`}>Review encounter</Link>
              )}
            </div>
          ))}
        <PatientTable
          preserveOrder
          encounters={(filter === "Active queue"
            ? rankQueue(board)
            : board
          ).slice(0, 30)}
        />
        <p className="panel-copy">
          Showing {Math.min(board.length, 30)} of {board.length} matching
          encounters in the current hospital snapshot.{" "}
          <Link href="/triage">Open full triage queue</Link>
        </p>
      </section>
    </>
  );
}
