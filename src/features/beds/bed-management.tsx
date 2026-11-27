"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  BedDouble,
  Check,
  Clock,
  LockKeyhole,
  SprayCan,
  Wrench,
  X,
  RefreshCw,
} from "lucide-react";
import { useWorkspace, CommandError } from "@/features/workspace/context";
import { Badge, Field, Status, time } from "@/components/ui";
import type { Row } from "@/lib/data";
import {
  bedKinds,
  bedStatuses,
  capabilities,
  compatibility,
  label,
  zones,
} from "./model";
const clinicalRoles = ["doctor", "nurse", "triage_nurse"];
const allocationRoles = [
  ...clinicalRoles,
  "resource_manager",
  "emergency_coordinator",
];
const configurationRoles = [
  "hospital_admin",
  "super_admin",
  "resource_manager",
];
const icons = {
  AVAILABLE: Check,
  OCCUPIED: BedDouble,
  RESERVED: Clock,
  CLEANING: SprayCan,
  MAINTENANCE: Wrench,
  BLOCKED: LockKeyhole,
};
export function BedManagement({
  encounterId,
  embedded = false,
}: {
  encounterId?: string;
  embedded?: boolean;
}) {
  const { data, command, busy, online, refresh } = useWorkspace();
  const [patientId, setPatientId] = useState(encounterId ?? "");
  const [selected, setSelected] = useState("");
  const [wardFilter, setWardFilter] = useState(""),
    [zoneFilter, setZoneFilter] = useState(""),
    [statusFilter, setStatusFilter] = useState(""),
    [kindFilter, setKindFilter] = useState(""),
    [departmentFilter, setDepartmentFilter] = useState(""),
    [query, setQuery] = useState("");
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [config, setConfig] = useState(false);
  const [reason, setReason] = useState(""),
    [confirmation, setConfirmation] = useState({ value: false, stamp: "" }),
    [reassign, setReassign] = useState(false);
  const [pending, setPending] = useState<{
    action: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const sending = useRef(false),
    heading = useRef<HTMLHeadingElement>(null),
    details = useRef<HTMLElement>(null);
  useEffect(() => {
    if (embedded) {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "start" });
    }
  }, [embedded]);
  const role = data.membership.role;
  const canAllocate = allocationRoles.includes(role),
    canConfigure = configurationRoles.includes(role),
    canReview = clinicalRoles.includes(role);
  const beds = data.resources.filter((b) => b.kind.endsWith("bed"));
  const encounter = data.encounters.find((e) => e.id === patientId),
    patient = data.patients.find((p) => p.id === encounter?.patient_id);
  const plan = data.bedPlans.find((p) => p.encounter_id === patientId);
  const bed = beds.find((b) => b.id === selected),
    profile = data.bedProfiles.find((p) => p.resource_id === selected),
    ward = data.wards.find((w) => w.id === profile?.ward_id);
  const reservation = data.reservations.find((r) => r.resource_id === selected);
  const occupant = data.encounters.find(
      (e) => e.id === reservation?.encounter_id,
    ),
    occupantPatient = data.patients.find((p) => p.id === occupant?.patient_id);
  const activeBedReservation = data.reservations.find(
    (r) => r.encounter_id === patientId && r.is_bed,
  );
  const confirmationStamp = `${patientId}:${encounter?.version}:${bed?.id}:${bed?.version}:${plan?.reviewed_at}:${activeBedReservation?.id}`;
  const confirmed =
    confirmation.value && confirmation.stamp === confirmationStamp;
  function setConfirmed(value: boolean) {
    setConfirmation({ value, stamp: confirmationStamp });
  }
  const reasons = bed ? compatibility(bed, profile, ward, plan, encounter) : [];
  const ownHold =
    bed?.status === "RESERVED" &&
    reservation?.encounter_id === patientId &&
    !!reservation.hold_until &&
    Date.parse(reservation.hold_until) > Date.parse(data.loadedAt);
  const matches = (b: Row<"hospital_resources">) => {
    const p = data.bedProfiles.find((x) => x.resource_id === b.id),
      w = data.wards.find((x) => x.id === p?.ward_id),
      r = data.reservations.find((x) => x.resource_id === b.id),
      e = data.encounters.find((x) => x.id === r?.encounter_id),
      person = data.patients.find((x) => x.id === e?.patient_id);
    return (
      (!wardFilter || w?.id === wardFilter) &&
      (!zoneFilter || w?.zone === zoneFilter) &&
      (!statusFilter || b.status === statusFilter) &&
      (!kindFilter || b.kind === kindFilter) &&
      (!departmentFilter || w?.department_id === departmentFilter) &&
      `${b.name} ${b.id} ${person?.name ?? ""} ${person?.identifier ?? ""} ${person?.id ?? ""} ${e?.reference ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  };
  const recommended = beds.filter(
    (b) =>
      b.status === "AVAILABLE" &&
      compatibility(
        b,
        data.bedProfiles.find((p) => p.resource_id === b.id),
        data.wards.find(
          (w) =>
            w.id ===
            data.bedProfiles.find((p) => p.resource_id === b.id)?.ward_id,
        ),
        plan,
        encounter,
      ).length === 0,
  );
  async function run(action: string, payload: Record<string, unknown>) {
    if (sending.current) return;
    sending.current = true;
    setError("");
    setSuccess("");
    const request = pending ?? {
      action,
      payload: { ...payload, operation_id: crypto.randomUUID() },
    };
    try {
      const result = await command(request.action, request.payload);
      setPending(null);
      setConfirmed(false);
      setReassign(false);
      setSuccess(
        request.action === "bed_assign"
          ? `Bed ${String(result.status).toLowerCase()} for the selected encounter.`
          : "Bed records saved.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
      if (!(e instanceof CommandError) || e.status >= 500) setPending(request);
      else {
        setPending(null);
        setConfirmed(false);
        void refresh().catch(() => {});
      }
    } finally {
      sending.current = false;
    }
  }
  const locked = busy || !online || !!pending;
  function choose(id: string) {
    setSelected(id);
    setReason("");
    setConfirmed(false);
    setReassign(false);
    setError("");
    requestAnimationFrame(() => details.current?.focus());
  }
  function allocate(hold: boolean) {
    if (!bed || !encounter) return;
    void run("bed_assign", {
      plan_reviewed_at: plan?.reviewed_at,
      expected_reservation_id: activeBedReservation?.id ?? "",
      resource_id: bed.id,
      bed_version: bed.version,
      encounter_id: encounter.id,
      version: encounter.version,
      confirmed,
      reassign,
      hold,
      reason,
    });
  }
  if (![...allocationRoles, ...configurationRoles].includes(role))
    return (
      <section className="panel panel-copy">
        <h1>Bed management access required</h1>
        <p>Your role cannot view placement requirements or manage beds.</p>
      </section>
    );
  return (
    <section className="bed-workspace" aria-label="Bed management">
      <div className="page-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {embedded ? "Choose the next care destination" : "Hospital bed map"}
          </h1>
          <p>
            {embedded
              ? "Registration and triage are saved. Review placement needs before selecting a bed."
              : "Physical wards grouped by care level. Select a bed to inspect its status and capabilities."}
          </p>
        </div>
        <div className="button-row">
          <button
            className="button"
            onClick={() =>
              void refresh().catch(() =>
                setError("Refresh failed. Your selection is retained."),
              )
            }
          >
            <RefreshCw size={16} /> Refresh map
          </button>
          {canConfigure && (
            <button className="button" onClick={() => setConfig(!config)}>
              {config ? "Close configuration" : "Configure wards & beds"}
            </button>
          )}
        </div>
      </div>
      <p className="form-note">
        Synthetic demonstration. Matching checks recorded requirements; it is
        not clinical validation. Emergency care must not wait for a bed
        assignment.
      </p>
      {!online && (
        <p role="alert">
          Offline: bed allocation is unavailable. Coordinate care directly;
          registration remains saved.
        </p>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="bed-success">
          {success}
        </p>
      )}
      {pending && (
        <div className="info-strip">
          <p>
            The acknowledgement was lost. Retry the same request safely before
            making another change.
          </p>
          <button
            className="button primary"
            disabled={busy || !online}
            onClick={() => void run(pending.action, pending.payload)}
          >
            Retry bed operation
          </button>
        </div>
      )}
      {config && (
        <BedConfiguration
          key={selected || "new"}
          selected={bed}
          profile={profile}
          run={run}
          disabled={locked}
        />
      )}
      <div
        className="bed-census"
        role="region"
        aria-label="Hospital bed counts"
      >
        <div>
          <strong>{beds.length}</strong>
          <span>Total beds</span>
        </div>
        {bedStatuses.map((s) => (
          <div key={s}>
            <strong>{beds.filter((b) => b.status === s).length}</strong>
            <span>{label(s)}</span>
          </div>
        ))}
      </div>
      <div className="bed-legend" role="region" aria-label="Bed status legend">
        {bedStatuses.map((s) => {
          const Icon = icons[s];
          return (
            <span key={s} className={`bed-state state-${s.toLowerCase()}`}>
              <Icon size={16} />
              {label(s)}
            </span>
          );
        })}
        <span className="bed-suitability-pill">Availability ≠ suitability</span>
      </div>
      <div className="bed-layout">
        <div className="bed-map-area">
          <div className="bed-filters">
            <Field label="Search beds or patient identifiers">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bed, patient name, ID or MRN"
              />
            </Field>
            <Field label="Ward">
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="">All wards</option>
                {data.wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All departments</option>
                {data.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Care zone">
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
              >
                <option value="">All care zones</option>
                {Object.entries(zones).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bed status">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {bedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bed type">
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
              >
                <option value="">All bed types</option>
                {bedKinds.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
          </div>
          {Object.entries(zones).map(([zone, title]) => {
            const wards = data.wards.filter(
              (w) =>
                w.zone === zone &&
                (!wardFilter || w.id === wardFilter) &&
                (!departmentFilter || w.department_id === departmentFilter),
            );
            if (zoneFilter && zoneFilter !== zone) return null;
            if (!wards.length) return null;
            const all = beds.filter((b) =>
              wards.some(
                (w) =>
                  w.id ===
                  data.bedProfiles.find((p) => p.resource_id === b.id)?.ward_id,
              ),
            );
            return (
              <section
                className={`bed-zone zone-${zone}`}
                key={zone}
                aria-label={`${title} zone`}
              >
                <header>
                  <div>
                    <h2>{title}</h2>
                    <p>
                      {all.length} total ·{" "}
                      {all.filter((b) => b.status === "AVAILABLE").length}{" "}
                      available ·{" "}
                      {all.filter((b) => b.status === "OCCUPIED").length}{" "}
                      occupied
                    </p>
                  </div>
                  <span className="bed-zone-line" />
                </header>
                {wards.map((w) => {
                  const profiles = data.bedProfiles
                    .filter((p) => p.ward_id === w.id)
                    .sort(
                      (a, b) =>
                        a.row_number - b.row_number ||
                        a.column_number - b.column_number,
                    );
                  const columns = Math.max(
                    1,
                    ...profiles.map((p) => p.column_number),
                  );
                  return (
                    <div key={w.id} className="bed-ward">
                      <div className="section-title">
                        <h3>{w.name}</h3>
                        <span>
                          {w.categories.join(" / ")} ·{" "}
                          {
                            data.departments.find(
                              (d) => d.id === w.department_id,
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="bed-grid-scroll">
                        <div
                          className="bed-grid"
                          role="group"
                          style={{ "--bed-columns": columns } as CSSProperties}
                          aria-label={`${w.name} bed layout`}
                        >
                          {profiles.map((p) => {
                            const b = beds.find((x) => x.id === p.resource_id);
                            if (!b) return null;
                            const show = matches(b),
                              Icon =
                                icons[b.status as keyof typeof icons] ??
                                BedDouble;
                            const compatible =
                              !!encounter &&
                              compatibility(b, p, w, plan, encounter).length ===
                                0;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                className={`bed-tile state-${b.status.toLowerCase()} ${selected === b.id ? "is-selected" : ""} ${compatible && b.status === "AVAILABLE" ? "is-compatible" : ""}`}
                                style={{
                                  gridColumn: p.column_number,
                                  gridRow: p.row_number,
                                  visibility: show ? "visible" : "hidden",
                                }}
                                onClick={() => choose(b.id)}
                                disabled={!!pending}
                                aria-pressed={selected === b.id}
                                aria-label={`${b.name} ${label(b.status)}${compatible && b.status === "AVAILABLE" ? " Matches requirements" : ""} — ${w.name}`}
                              >
                                <BedDouble className="bed-outline" size={34} />
                                <strong>{b.name}</strong>{" "}
                                <span>
                                  <Icon size={13} />
                                  {label(b.status)}
                                </span>{" "}
                                {compatible && b.status === "AVAILABLE" && (
                                  <small>Matches requirements</small>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {!profiles.length && (
                        <p className="empty">
                          No beds configured in this ward.
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })}
          {!beds.some(matches) && (
            <p className="empty">
              No beds match these filters. Change a filter to see the rest of
              the hospital.
            </p>
          )}
          {beds.some(
            (b) => !data.bedProfiles.some((p) => p.resource_id === b.id),
          ) && (
            <section className="panel panel-copy">
              <h2>Unconfigured beds</h2>
              <p>
                These beds cannot be recommended until their ward and
                capabilities are reviewed.
              </p>
              <div className="button-row">
                {beds
                  .filter(
                    (b) =>
                      !data.bedProfiles.some((p) => p.resource_id === b.id),
                  )
                  .map((b) => (
                    <button
                      className="button"
                      key={b.id}
                      onClick={() => choose(b.id)}
                    >
                      {b.name}
                    </button>
                  ))}
              </div>
            </section>
          )}
        </div>
        <aside className="bed-sidebar">
          <section className="panel bed-patient">
            <h2>Patient placement</h2>
            {!embedded && (
              <Field label="Patient encounter for allocation">
                <select
                  value={patientId}
                  disabled={!!pending}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    setConfirmed(false);
                    setReassign(false);
                  }}
                >
                  <option value="">Choose a patient encounter</option>
                  {data.encounters
                    .filter(
                      (e) =>
                        !["DISCHARGED", "TRANSFERRED", "CANCELLED"].includes(
                          e.status,
                        ),
                    )
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {data.patients.find((p) => p.id === e.patient_id)?.name}{" "}
                        · {e.reference} · {e.category}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {encounter && patient ? (
              <>
                <div className="bed-patient-identity">
                  <strong>{patient.name}</strong>
                  <Badge category={encounter.category} />
                  <small>Patient {patient.identifier || patient.id}</small>
                  <small>Encounter {encounter.reference}</small>
                </div>
                <Link href={`/encounters/${encounter.id}`}>
                  Review or correct the saved assessment
                </Link>
                <p className="form-note">
                  Corrections remain in assessment history. Changed assessments
                  require a new placement review.
                </p>
                {canReview ? (
                  <details
                    key={plan?.reviewed_at ?? "new"}
                    open={!plan || plan.encounter_version !== encounter.version}
                    className="placement-review"
                  >
                    <summary>
                      {plan
                        ? "Edit placement requirements"
                        : "Review placement requirements"}
                    </summary>
                    <PlacementPlan
                      key={`${encounter.id}:${plan?.reviewed_at ?? ""}`}
                      encounter={encounter}
                      plan={plan}
                      run={run}
                      disabled={locked}
                    />
                  </details>
                ) : (
                  <p>
                    Ask the responsible nurse or doctor to review placement
                    requirements.
                  </p>
                )}
                {plan && (
                  <p className="form-note">
                    Last review: {time(plan.reviewed_at)} ·{" "}
                    {data.staff.find((s) => s.user_id === plan.actor)
                      ?.display_name ?? "Authorized clinician"}{" "}
                    · {label(plan.decision)}
                  </p>
                )}
                {plan?.decision === "BED_REQUIRED" && (
                  <div className="bed-recommendations">
                    <h3>Recommended available beds</h3>
                    <p className="form-note">
                      Matches the saved ward, triage category, bed type and
                      every requested capability. Staff must verify suitability.
                    </p>
                    {recommended.length ? (
                      recommended.slice(0, 6).map((b) => (
                        <button
                          key={b.id}
                          className="button full"
                          onClick={() => choose(b.id)}
                        >
                          {b.name} · all recorded requirements met
                        </button>
                      ))
                    ) : (
                      <p>
                        No compatible bed is available. Keep urgency unchanged;
                        record awaiting placement and contact the coordinator.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>
                Select a patient to review requirements and receive compatible
                options. You can inspect occupancy without selecting a patient.
              </p>
            )}
          </section>
          <section
            className="panel bed-details"
            ref={details}
            tabIndex={-1}
            aria-label="Selected bed details"
          >
            <div className="section-title">
              <h2>{bed ? bed.name : "Bed details"}</h2>
              {bed && (
                <button
                  className="icon-button"
                  aria-label="Close bed details"
                  onClick={() => setSelected("")}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {bed ? (
              <>
                <Status value={bed.status} />
                <dl>
                  <dt>Ward / zone</dt>
                  <dd>
                    {ward?.name ?? "Not configured"} ·{" "}
                    {zones[ward?.zone as keyof typeof zones] ?? "Unconfigured"}
                  </dd>
                  <dt>Bed type</dt>
                  <dd>{bed.kind}</dd>
                  <dt>Equipment, monitoring & isolation</dt>
                  <dd>
                    {profile?.capabilities.length
                      ? profile.capabilities.map(label).join(", ")
                      : "No capabilities recorded"}
                  </dd>
                  <dt>Restrictions / local checks</dt>
                  <dd>
                    {profile?.restrictions ||
                      "No additional restriction recorded; confirm with staff."}
                  </dd>
                  <dt>Configuration</dt>
                  <dd>
                    {profile?.verified
                      ? "Reviewed synthetic configuration"
                      : "Unverified — allocation unavailable"}
                  </dd>
                </dl>
                {reservation && (
                  <div className="bed-occupant">
                    <h3>
                      {bed.status === "RESERVED"
                        ? "Reserved encounter"
                        : "Current occupant"}
                    </h3>
                    <strong>
                      {occupantPatient?.name ?? "Patient record unavailable"}
                    </strong>
                    <p>{occupantPatient?.identifier || occupantPatient?.id}</p>
                    {occupant && (
                      <>
                        <Badge category={occupant.category} />
                        <p>
                          {occupant.reference} · Arrived{" "}
                          {time(occupant.arrived_at)}
                        </p>
                        <Link href={`/encounters/${occupant.id}`}>
                          Open encounter
                        </Link>
                        {!embedded && (
                          <button
                            className="button full"
                            onClick={() => setPatientId(occupant.id)}
                          >
                            Select for reassignment
                          </button>
                        )}
                      </>
                    )}
                    {reservation.hold_until && bed.status === "RESERVED" && (
                      <p>Hold expires {time(reservation.hold_until)}</p>
                    )}
                  </div>
                )}
                {encounter && reasons.length > 0 && (
                  <div className="bed-mismatch">
                    <h3>Not suitable for this plan</h3>
                    <ul>
                      {reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Field label="Bed action reason">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    minLength={5}
                    maxLength={3000}
                    placeholder="Document suitability, handover or turnover checks"
                  />
                </Field>
                {canAllocate &&
                  encounter &&
                  (bed.status === "AVAILABLE" || ownHold) && (
                    <>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        I verified this patient, ward, required equipment and
                        bed suitability.
                      </label>
                      {data.reservations.some(
                        (r) =>
                          r.encounter_id === encounter.id &&
                          r.resource_id !== bed.id &&
                          beds.some((b) => b.id === r.resource_id),
                      ) && (
                        <label className="check">
                          <input
                            type="checkbox"
                            checked={reassign}
                            onChange={(e) => setReassign(e.target.checked)}
                          />
                          Confirm reassignment; release the previous bed for
                          cleaning.
                        </label>
                      )}
                      <button
                        className="button primary full"
                        disabled={
                          locked ||
                          !confirmed ||
                          reason.trim().length < 5 ||
                          !!reasons.length
                        }
                        onClick={() => allocate(false)}
                      >
                        Confirm bed allocation
                      </button>
                      {!ownHold && (
                        <button
                          className="button full"
                          disabled={
                            locked ||
                            !confirmed ||
                            reason.trim().length < 5 ||
                            !!reasons.length ||
                            data.reservations.some(
                              (r) =>
                                r.encounter_id === encounter.id &&
                                beds.some((b) => b.id === r.resource_id),
                            )
                          }
                          onClick={() => allocate(true)}
                        >
                          Hold bed for 10 minutes
                        </button>
                      )}
                    </>
                  )}
                {canAllocate && reservation && occupant && (
                  <button
                    className="button full"
                    disabled={locked || reason.trim().length < 5}
                    onClick={() =>
                      void run("bed_release", {
                        resource_id: bed.id,
                        bed_version: bed.version,
                        encounter_id: occupant.id,
                        version: occupant.version,
                        reason,
                      })
                    }
                  >
                    Release bed for cleaning
                  </button>
                )}
                {!reservation &&
                  !["OCCUPIED", "RESERVED"].includes(bed.status) && (
                    <div className="stack-form">
                      {bed.status === "CLEANING" && (
                        <>
                          <label className="check">
                            <input
                              type="checkbox"
                              checked={confirmed}
                              onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            Cleaning, equipment and safety checks completed.
                          </label>
                          <button
                            className="button full"
                            disabled={
                              locked || !confirmed || reason.trim().length < 5
                            }
                            onClick={() =>
                              void run("bed_status", {
                                resource_id: bed.id,
                                bed_version: bed.version,
                                status: "AVAILABLE",
                                checks_confirmed: confirmed,
                                reason,
                              })
                            }
                          >
                            Confirm cleaned & available
                          </button>
                        </>
                      )}
                      {["MAINTENANCE", "BLOCKED"].includes(bed.status) && (
                        <button
                          className="button full"
                          disabled={locked || reason.trim().length < 5}
                          onClick={() =>
                            void run("bed_status", {
                              resource_id: bed.id,
                              bed_version: bed.version,
                              status: "CLEANING",
                              checks_confirmed: false,
                              reason,
                            })
                          }
                        >
                          Send for turnover checks
                        </button>
                      )}
                      {[
                        ...configurationRoles,
                        "emergency_coordinator",
                      ].includes(role) &&
                        ["AVAILABLE", "CLEANING"].includes(bed.status) && (
                          <div className="button-row">
                            {["MAINTENANCE", "BLOCKED"].map((status) => (
                              <button
                                className="button"
                                key={status}
                                disabled={locked || reason.trim().length < 5}
                                onClick={() =>
                                  void run("bed_status", {
                                    resource_id: bed.id,
                                    bed_version: bed.version,
                                    status,
                                    checks_confirmed: false,
                                    reason,
                                  })
                                }
                              >
                                Mark {label(status)}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                <details className="spaced">
                  <summary>Allocation history</summary>
                  {data.bedEvents
                    .filter((e) => e.resource_id === bed.id)
                    .slice(0, 12)
                    .map((e) => (
                      <p className="form-note" key={e.id}>
                        {label(e.action)} · {time(e.created_at)} ·{" "}
                        {data.staff.find((s) => s.user_id === e.actor)
                          ?.display_name ?? "System"}
                        {e.encounter_id && (
                          <>
                            {" "}
                            ·{" "}
                            <Link href={`/encounters/${e.encounter_id}`}>
                              Encounter
                            </Link>
                          </>
                        )}
                      </p>
                    ))}
                </details>
              </>
            ) : (
              <p>
                Choose a bed on the map to view its ward, capabilities,
                occupancy and available actions.
              </p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
type Run = (action: string, payload: Record<string, unknown>) => Promise<void>;
function PlacementPlan({
  encounter,
  plan,
  run,
  disabled,
}: {
  encounter: Row<"patient_encounters">;
  plan?: Row<"bed_placement_plans">;
  run: Run;
  disabled: boolean;
}) {
  const { data } = useWorkspace();
  const [decision, setDecision] = useState(plan?.decision ?? ""),
    [ward, setWard] = useState(plan?.ward_id ?? ""),
    [kind, setKind] = useState(plan?.bed_kind ?? "");
  return (
    <form
      className="stack-form spaced"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void run("bed_plan", {
          encounter_id: encounter.id,
          version: encounter.version,
          decision,
          ward_id: decision === "BED_REQUIRED" ? ward : "",
          bed_kind: decision === "BED_REQUIRED" ? kind : "",
          required_capabilities:
            decision === "BED_REQUIRED" ? f.getAll("capability") : [],
          reason: f.get("reason"),
          reviewed: f.get("reviewed") === "on",
        });
      }}
    >
      <Field label="Placement decision">
        <select
          required
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
        >
          <option value="">Review care destination</option>
          <option value="BED_REQUIRED">Bed required</option>
          <option value="NO_BED">No bed required</option>
          <option value="AWAITING">Awaiting suitable placement</option>
          <option value="OTHER">Another destination / referral</option>
        </select>
      </Field>
      {decision === "BED_REQUIRED" && (
        <>
          <Field label="Clinically required ward / care level">
            <select
              required
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            >
              <option value="">Select after clinical review</option>
              {data.wards.map((w) => (
                <option
                  key={w.id}
                  value={w.id}
                  disabled={
                    !w.categories.includes(encounter.category) ||
                    w.zone === "unconfigured"
                  }
                >
                  {w.name} · {w.categories.join("/")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Required bed type">
            <select
              required
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="">Select bed type</option>
              {bedKinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <fieldset>
            <legend>Required equipment, monitoring & isolation</legend>
            {capabilities.map((c) => (
              <label className="check" key={c}>
                <input
                  type="checkbox"
                  name="capability"
                  value={c}
                  defaultChecked={plan?.required_capabilities.includes(c)}
                />
                {label(c)}
              </label>
            ))}
          </fieldset>
          <p className="form-note">
            Unchecked means no requirement only after the review below. Unknown
            needs: record awaiting placement instead.
          </p>
        </>
      )}
      <Field label="Placement reasoning / destination">
        <textarea
          name="reason"
          required
          minLength={5}
          maxLength={3000}
          defaultValue={plan?.reason ?? ""}
        />
      </Field>
      <label className="check">
        <input name="reviewed" type="checkbox" required />I reviewed care level,
        ward compatibility, monitoring, isolation and equipment needs.
      </label>
      <button className="button primary full" disabled={disabled}>
        Save placement review
      </button>
    </form>
  );
}
function BedConfiguration({
  selected,
  profile,
  run,
  disabled,
}: {
  selected?: Row<"hospital_resources">;
  profile?: Row<"bed_profiles">;
  run: Run;
  disabled: boolean;
}) {
  const { data } = useWorkspace();
  return (
    <section className="panel panel-copy bed-configuration">
      <h2>Ward and bed configuration</h2>
      <p>
        Physical map coordinates and capabilities are operational records.
        Synthetic configuration is not an approved clinical protocol.
      </p>
      <div className="bed-config-grid">
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run("bed_ward", {
              name: f.get("name"),
              department_id: f.get("department"),
              zone: f.get("zone"),
              categories: f.getAll("category"),
              display_order: Number(f.get("order")),
              reason: f.get("reason"),
            });
          }}
        >
          <h3>Add a physical ward</h3>
          <Field label="Ward name">
            <input name="name" required maxLength={100} />
          </Field>
          <Field label="Ward department">
            <select name="department" required>
              {data.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ward care zone">
            <select name="zone">
              {Object.entries(zones).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <fieldset>
            <legend>Supported triage categories (local review required)</legend>
            {["RED", "YELLOW", "GREEN"].map((c) => (
              <label className="check" key={c}>
                <input type="checkbox" name="category" value={c} />
                {c}
              </label>
            ))}
          </fieldset>
          <Field label="Display order">
            <input
              type="number"
              name="order"
              min={0}
              max={100}
              defaultValue={4}
            />
          </Field>
          <Field label="Ward configuration reason">
            <input name="reason" required minLength={5} maxLength={3000} />
          </Field>
          <button className="button" disabled={disabled}>
            Create ward
          </button>
        </form>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run("bed_configure", {
              resource_id: selected?.id ?? "",
              ...(selected ? { bed_version: selected.version } : {}),
              name: selected?.name ?? f.get("name"),
              kind: selected?.kind ?? f.get("kind"),
              ward_id: f.get("ward"),
              row_number: Number(f.get("row")),
              column_number: Number(f.get("column")),
              capabilities: f.getAll("capability"),
              verified: f.get("verified") === "on",
              restrictions: f.get("restrictions"),
              reason: f.get("reason"),
            });
          }}
        >
          <h3>{selected ? `Configure ${selected.name}` : "Add a bed"}</h3>
          {!selected && (
            <>
              <Field label="New bed identifier">
                <input name="name" required maxLength={100} />
              </Field>
              <Field label="New bed type">
                <select name="kind">
                  {bedKinds.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
            </>
          )}
          <Field label="Physical ward">
            <select name="ward" required defaultValue={profile?.ward_id ?? ""}>
              <option value="">Choose ward</option>
              {data.wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Map row">
              <input
                name="row"
                type="number"
                min={1}
                max={30}
                required
                defaultValue={profile?.row_number ?? 1}
              />
            </Field>
            <Field label="Map column">
              <input
                name="column"
                type="number"
                min={1}
                max={12}
                required
                defaultValue={profile?.column_number ?? 1}
              />
            </Field>
          </div>
          <fieldset>
            <legend>Available bed capabilities</legend>
            {capabilities.map((c) => (
              <label className="check" key={c}>
                <input
                  type="checkbox"
                  name="capability"
                  value={c}
                  defaultChecked={profile?.capabilities.includes(c)}
                />
                {label(c)}
              </label>
            ))}
          </fieldset>
          <Field label="Allocation restrictions">
            <textarea
              name="restrictions"
              maxLength={1000}
              defaultValue={profile?.restrictions ?? ""}
            />
          </Field>
          <label className="check">
            <input type="checkbox" name="verified" />I verified the ward,
            location and available capabilities.
          </label>
          <Field label="Bed configuration reason">
            <input name="reason" required minLength={5} maxLength={3000} />
          </Field>
          <button
            className="button"
            disabled={
              disabled ||
              (!!selected && ["OCCUPIED", "RESERVED"].includes(selected.status))
            }
          >
            Save bed configuration
          </button>
        </form>
      </div>
    </section>
  );
}
