"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Clock3, Eye, X } from "lucide-react";
import { Badge, Empty, Status, minutes, time } from "@/components/ui";
import {
  AcuityShieldIcon,
  BedBayIcon,
  PatientIntakeIcon,
  VitalsMonitorIcon,
} from "@/components/icons";
import { useWorkspace } from "./context";
import { rankQueue, queueExplanation } from "@/features/queue/rank";
import type { Row } from "@/lib/data";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PatientTable({
  encounters,
  preserveOrder = false,
  onReset,
}: {
  encounters: Row<"patient_encounters">[];
  preserveOrder?: boolean;
  onReset?: () => void;
}) {
  const { data } = useWorkspace();
  const [inspectId, setInspectId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  function closeDrawer() {
    setInspectId(null);
    requestAnimationFrame(() => {
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
    });
  }

  useEffect(() => {
    if (!inspectId) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspectId]);

  const inspectedEncounter = inspectId
    ? (data.encounters.find((item) => item.id === inspectId) ?? null)
    : null;
  const inspectedPatient = inspectedEncounter
    ? data.patients.find((p) => p.id === inspectedEncounter.patient_id)
    : undefined;
  const inspectedVitals = inspectedEncounter
    ? data.vitals.filter((v) => v.encounter_id === inspectedEncounter.id)
    : [];
  const inspectedAssessments = inspectedEncounter
    ? data.assessments.filter((a) => a.encounter_id === inspectedEncounter.id)
    : [];
  const inspectedNotes = inspectedEncounter
    ? data.notes.filter((n) => n.encounter_id === inspectedEncounter.id)
    : [];
  const inspectedBedRes = inspectedEncounter
    ? data.reservations.find(
        (r) =>
          r.encounter_id === inspectedEncounter.id &&
          r.is_bed &&
          !r.released_at,
      )
    : undefined;
  const inspectedBed = inspectedBedRes
    ? data.resources.find((res) => res.id === inspectedBedRes.resource_id)
    : undefined;
  const inspectedStaff = inspectedEncounter?.assigned_to
    ? data.staff.find((s) => s.user_id === inspectedEncounter.assigned_to)
    : undefined;

  if (!encounters.length)
    return (
      <Empty
        title="The queue is clear"
        description="Register a patient or adjust the active filters to view encounters."
        action={
          onReset ? (
            <button type="button" className="button small" onClick={onReset}>
              Reset filters
            </button>
          ) : undefined
        }
      />
    );

  return (
    <>
      <div
        className="table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Patient encounter table"
      >
        <table className="patient-table track-board">
          <thead>
            <tr>
              <th>Patient &amp; complaint</th>
              <th>Acuity</th>
              <th>Milestones &amp; unit</th>
              <th>Wait</th>
              <th>Stage &amp; team</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(preserveOrder ? encounters : rankQueue(encounters)).map((e) => {
              const p = data.patients.find((item) => item.id === e.patient_id);
              const dept = data.departments.find(
                (d) => d.id === e.department_id,
              );
              const staffMember = e.assigned_to
                ? data.staff.find((s) => s.user_id === e.assigned_to)
                : undefined;
              const latestVitals = data.vitals.find(
                (v) => v.encounter_id === e.id,
              );
              const hasAssessment = data.assessments.some(
                (a) => a.encounter_id === e.id,
              );
              const bedRes = data.reservations.find(
                (r) => r.encounter_id === e.id && r.is_bed && !r.released_at,
              );
              const bed = bedRes
                ? data.resources.find((r) => r.id === bedRes.resource_id)
                : undefined;
              const waitMins = minutes(e.arrived_at, data.loadedAt);
              const overdue =
                Boolean(e.deteriorating) ||
                (e.reassessment_due !== null &&
                  Date.parse(e.reassessment_due) < Date.parse(data.loadedAt));
              const waitTier =
                overdue || waitMins >= 60
                  ? "critical"
                  : waitMins >= 30
                    ? "elevated"
                    : "normal";

              return (
                <tr
                  key={e.id}
                  data-category={e.category.toLowerCase()}
                  className={
                    inspectId === e.id ? "track-row selected-row" : "track-row"
                  }
                >
                  <td className="acuity-rail-cell">
                    <Link className="patient-cell" href={`/encounters/${e.id}`}>
                      <span>
                        <strong>{p?.name ?? "Patient"}</strong>
                        <small>
                          <span className="mono">{e.reference}</span>{" "}
                          <span aria-hidden="true">·</span>{" "}
                          {p?.age == null ? "Age unknown" : `${p?.age} yrs`}
                          {e.symptoms ? ` · ${e.symptoms}` : ""}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td title={queueExplanation(e)}>
                    <Badge category={e.category} />
                    {e.emergency && (
                      <small className="cell-caption">Emergency override</small>
                    )}
                    {e.deteriorating && !e.emergency && (
                      <small className="cell-caption review">
                        Deteriorating
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="track-unit-name">
                      {dept?.name ?? "Awaiting unit"}
                    </div>
                    <div
                      className="milestone-row"
                      aria-label="Clinical milestones"
                    >
                      <span
                        className={`milestone-glyph ${latestVitals ? "done" : ""}`}
                        title={
                          latestVitals
                            ? `Vitals: SpO2 ${latestVitals.spo2 ?? "—"}% · HR ${latestVitals.pulse ?? "—"} · BP ${latestVitals.systolic ?? "—"}`
                            : "No vitals recorded yet"
                        }
                      >
                        <VitalsMonitorIcon size={13} />
                        <span>Vitals</span>
                      </span>
                      <span
                        className={`milestone-glyph ${hasAssessment ? "done" : ""}`}
                        title={
                          hasAssessment
                            ? "Clinician assessment recorded"
                            : "Awaiting triage assessment"
                        }
                      >
                        <AcuityShieldIcon size={13} />
                        <span>Triage</span>
                      </span>
                      <span
                        className={`milestone-glyph ${bed ? "done" : ""}`}
                        title={
                          bed ? `Bed bay: ${bed.name}` : "No bed allocated"
                        }
                      >
                        <BedBayIcon size={13} />
                        <span>{bed ? bed.name : "No bed"}</span>
                      </span>
                      {e.intake && Object.keys(e.intake).length > 0 && (
                        <span
                          className="milestone-glyph done"
                          title="Patient self-intake submitted"
                        >
                          <PatientIntakeIcon size={13} />
                          <span>Intake</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`wait-time wait-${waitTier}`}>
                      <Clock3 size={14} aria-hidden="true" />
                      {waitMins} min
                    </span>
                    {overdue && (
                      <small className="cell-caption review">
                        Reassessment due
                      </small>
                    )}
                  </td>
                  <td>
                    <Status value={e.status} />
                    <div className="clinician-chip-inline">
                      {staffMember ? (
                        <>
                          <span className="mini-avatar" aria-hidden="true">
                            {initials(staffMember.display_name)}
                          </span>
                          <small>{staffMember.display_name}</small>
                        </>
                      ) : (
                        <small className="muted">Unassigned</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="track-row-actions">
                      <button
                        type="button"
                        className="icon-button peek-btn"
                        aria-label={`Quick peek ${p?.name ?? e.reference}`}
                        aria-expanded={inspectId === e.id}
                        aria-pressed={inspectId === e.id}
                        title="Quick clinical brief"
                        onClick={(event) => {
                          triggerRef.current = event.currentTarget;
                          setInspectId((curr) => (curr === e.id ? null : e.id));
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <Link
                        href={`/encounters/${e.id}`}
                        className="icon-button"
                        aria-label={`Open ${p?.name ?? e.reference}`}
                        title="Open full encounter chart"
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inspectedEncounter && (
        <>
          <div
            className="drawer-backdrop"
            aria-hidden="true"
            onClick={closeDrawer}
          />
          <aside
            className="quick-peek-drawer"
            role="region"
            aria-label={`Clinical quick brief for ${inspectedPatient?.name ?? inspectedEncounter.reference}`}
          >
            <div className="drawer-header">
              <div>
                <span className="mono drawer-ref">
                  {inspectedEncounter.reference}
                </span>
                <h3>{inspectedPatient?.name ?? "Patient"}</h3>
                <p className="muted">
                  {inspectedPatient?.age == null
                    ? "Age unknown"
                    : `${inspectedPatient.age} yrs`}{" "}
                  ·{" "}
                  {data.departments.find(
                    (d) => d.id === inspectedEncounter.department_id,
                  )?.name ?? "Awaiting unit"}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="icon-button"
                onClick={closeDrawer}
                aria-label="Close clinical quick brief"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body" tabIndex={0}>
              <div className="drawer-badges">
                <Badge category={inspectedEncounter.category} />
                <Status value={inspectedEncounter.status} />
              </div>

              <div className="drawer-section">
                <h4>Presenting symptoms &amp; triage explanation</h4>
                <p className="drawer-complaint">
                  {inspectedEncounter.symptoms || "No symptoms documented yet."}
                </p>
                <small className="muted">
                  {queueExplanation(inspectedEncounter)}
                </small>
              </div>

              <div className="drawer-section">
                <h4>Latest vitals ({inspectedVitals.length} recorded)</h4>
                {inspectedVitals[0] ? (
                  <div className="drawer-vitals-grid">
                    <div>
                      <span>Pulse</span>
                      <strong>{inspectedVitals[0].pulse ?? "—"}</strong>
                    </div>
                    <div>
                      <span>SpO₂</span>
                      <strong>
                        {inspectedVitals[0].spo2 != null
                          ? `${inspectedVitals[0].spo2}%`
                          : "—"}
                      </strong>
                    </div>
                    <div>
                      <span>Systolic BP</span>
                      <strong>{inspectedVitals[0].systolic ?? "—"}</strong>
                    </div>
                    <div>
                      <span>Resp / Temp</span>
                      <strong>
                        {inspectedVitals[0].respiratory_rate ?? "—"} /{" "}
                        {inspectedVitals[0].temperature ?? "—"}°
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="muted">
                    No vitals recorded yet for this encounter.
                  </p>
                )}
              </div>

              <div className="drawer-section">
                <h4>Assignment &amp; bed allocation</h4>
                <dl className="drawer-kv">
                  <div>
                    <dt>Clinician</dt>
                    <dd>{inspectedStaff?.display_name ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Bed bay</dt>
                    <dd>
                      {inspectedBed
                        ? `${inspectedBed.name} (${inspectedBed.location || "Unit"})`
                        : "None reserved"}
                    </dd>
                  </div>
                  <div>
                    <dt>Arrived</dt>
                    <dd>
                      {time(inspectedEncounter.arrived_at)} (
                      {minutes(inspectedEncounter.arrived_at, data.loadedAt)}{" "}
                      min ago)
                    </dd>
                  </div>
                </dl>
              </div>

              {inspectedAssessments[0] && (
                <div className="drawer-section">
                  <h4>Latest assessment</h4>
                  <p className="drawer-note-text">
                    {inspectedAssessments[0].reason}
                  </p>
                </div>
              )}

              {inspectedNotes[0] && (
                <div className="drawer-section">
                  <h4>Latest clinical note</h4>
                  <p className="drawer-note-text">{inspectedNotes[0].note}</p>
                </div>
              )}
            </div>

            <div className="drawer-actions">
              <Link
                href={`/encounters/${inspectedEncounter.id}`}
                className="button primary full"
              >
                Open full encounter chart
                <ArrowUpRight size={15} />
              </Link>
              <Link
                href={`/beds?encounter=${inspectedEncounter.id}`}
                className="button full"
              >
                Manage bed allocation
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
