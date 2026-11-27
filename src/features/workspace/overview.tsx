"use client";

import Link from "next/link";
import { ArrowRight, Plus, Clock3 } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "./context";
import { PatientTable } from "./patient-table";
import { Metric, SectionTitle, Empty } from "@/components/ui";
import { terminalStatuses } from "@/features/flow/machine";
import {
  AcuityShieldIcon,
  BedBayIcon,
  EmergencyBeaconIcon,
  FlowJunctionIcon,
  PatientIntakeIcon,
  StethoscopeCrossIcon,
} from "@/components/icons";

export function Overview({
  queue = false,
  title = "Hospital overview",
  initialQuery = "",
}: {
  queue?: boolean;
  title?: string;
  initialQuery?: string;
}) {
  const { data, online } = useWorkspace();
  const [filter, setFilter] = useState("All patients");
  const [search, setSearch] = useState(initialQuery);
  const [department, setDepartment] = useState("");
  const [assignment, setAssignment] = useState("");

  const active = data.encounters.filter(
    (e) => !terminalStatuses.includes(e.status),
  );
  const critical = active.filter((e) => e.category === "RED");
  const urgent = active.filter((e) => e.category === "YELLOW");
  const standard = active.filter((e) => e.category === "GREEN");
  const pending = active.filter((e) => e.category === "ASSESSMENT_REQUIRED");
  const overdue = active.filter(
    (e) =>
      e.deteriorating ||
      (e.reassessment_due !== null &&
        Date.parse(e.reassessment_due) < Date.parse(data.loadedAt)),
  );
  const allBeds = data.resources.filter((r) => r.kind.includes("bed"));
  const freeBeds = allBeds.filter((r) => r.status === "AVAILABLE");
  const bedOccupancyPct = allBeds.length
    ? Math.round(((allBeds.length - freeBeds.length) / allBeds.length) * 100)
    : 0;

  const displayed = active.filter(
    (e) =>
      (filter === "All patients" ||
        (filter === "Awaiting triage"
          ? e.category === "ASSESSMENT_REQUIRED"
          : filter === "Reassessment due"
            ? overdue.includes(e)
            : e.category === filter)) &&
      (!department || e.department_id === department) &&
      (!assignment ||
        (assignment === "mine"
          ? e.assigned_to === data.userId
          : e.assigned_to === null)) &&
      (!search ||
        `${data.patients.find((p) => p.id === e.patient_id)?.name ?? ""} ${e.reference} ${e.symptoms}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  const hasFilters =
    filter !== "All patients" || !!search || !!department || !!assignment;
  function clearFilters() {
    setFilter("All patients");
    setSearch("");
    setDepartment("");
    setAssignment("");
  }

  const totalBar = Math.max(active.length, 1);

  const date = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.loadedAt));

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">
            {date}{" "}
            <span className="live-label">
              <span />{" "}
              {online
                ? `Synced ${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }).format(new Date(data.loadedAt))}`
                : "Offline — cached shift view"}
            </span>
          </p>
          <h1>{title}</h1>
          <p>
            Acuity-ranked track board, clinical handovers, and live ward
            capacity.
          </p>
        </div>
        <div className="heading-actions">
          <Link href="/patient-portal" className="button">
            Patient self-intake
          </Link>
          <Link href="/reception" className="button primary">
            <Plus size={17} /> Register patient
          </Link>
        </div>
      </div>

      {!queue && (
        <section
          className="command-pulse"
          aria-label="Live acuity census and quick launches"
        >
          <div className="pulse-acuity-panel">
            <div className="pulse-head">
              <div>
                <strong>Shift Acuity Census</strong>
                <small>
                  Click any priority tier to focus the track board · Emergency
                  ranked first
                </small>
              </div>
              <span className="pulse-bed-pill">
                <BedBayIcon size={15} />
                {freeBeds.length} / {allBeds.length} beds free (
                {bedOccupancyPct}% occ)
              </span>
            </div>

            <div
              className="acuity-spectrum-bar"
              role="img"
              aria-label={`Acuity mix: ${critical.length} critical, ${urgent.length} urgent, ${standard.length} non-immediate, ${pending.length} awaiting triage`}
            >
              {critical.length > 0 && (
                <span
                  className="seg-red"
                  style={{ width: `${(critical.length / totalBar) * 100}%` }}
                />
              )}
              {urgent.length > 0 && (
                <span
                  className="seg-yellow"
                  style={{ width: `${(urgent.length / totalBar) * 100}%` }}
                />
              )}
              {pending.length > 0 && (
                <span
                  className="seg-unassessed"
                  style={{ width: `${(pending.length / totalBar) * 100}%` }}
                />
              )}
              {standard.length > 0 && (
                <span
                  className="seg-green"
                  style={{ width: `${(standard.length / totalBar) * 100}%` }}
                />
              )}
            </div>

            <div className="acuity-chip-row">
              <button
                type="button"
                className={`acuity-stat-chip chip-red ${filter === "RED" ? "active" : ""}`}
                onClick={() =>
                  setFilter((curr) => (curr === "RED" ? "All patients" : "RED"))
                }
              >
                <span className="chip-dot" />
                <strong>{critical.length}</strong>
                <span>Critical (RED)</span>
              </button>
              <button
                type="button"
                className={`acuity-stat-chip chip-yellow ${filter === "YELLOW" ? "active" : ""}`}
                onClick={() =>
                  setFilter((curr) =>
                    curr === "YELLOW" ? "All patients" : "YELLOW",
                  )
                }
              >
                <span className="chip-dot" />
                <strong>{urgent.length}</strong>
                <span>Urgent (YELLOW)</span>
              </button>
              <button
                type="button"
                className={`acuity-stat-chip chip-green ${filter === "GREEN" ? "active" : ""}`}
                onClick={() =>
                  setFilter((curr) =>
                    curr === "GREEN" ? "All patients" : "GREEN",
                  )
                }
              >
                <span className="chip-dot" />
                <strong>{standard.length}</strong>
                <span>Standard (GREEN)</span>
              </button>
              <button
                type="button"
                className={`acuity-stat-chip chip-blue ${filter === "Awaiting triage" ? "active" : ""}`}
                onClick={() =>
                  setFilter((curr) =>
                    curr === "Awaiting triage"
                      ? "All patients"
                      : "Awaiting triage",
                  )
                }
              >
                <span className="chip-dot" />
                <strong>{pending.length}</strong>
                <span>Awaiting triage</span>
              </button>
            </div>
          </div>

          <div className="pulse-shortcuts">
            <Link href="/registration" className="quick-tile">
              <PatientIntakeIcon size={19} />
              <div>
                <strong>Nursing intake</strong>
                <small>Vitals &amp; initial screen</small>
              </div>
              <ArrowRight size={14} />
            </Link>
            <Link href="/doctor" className="quick-tile">
              <StethoscopeCrossIcon size={19} />
              <div>
                <strong>Clinical workspace</strong>
                <small>Notes &amp; disposition</small>
              </div>
              <ArrowRight size={14} />
            </Link>
            <Link href="/resources" className="quick-tile">
              <BedBayIcon size={19} />
              <div>
                <strong>Bed &amp; bay map</strong>
                <small>Ward allocation &amp; holds</small>
              </div>
              <ArrowRight size={14} />
            </Link>
            <Link href="/smartflow" className="quick-tile">
              <FlowJunctionIcon size={19} />
              <div>
                <strong>SmartFlow board</strong>
                <small>Stage-by-stage journey</small>
              </div>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      <div className="metrics">
        <Metric
          label="Active encounters"
          value={active.length.toString()}
          detail="Across all departments"
        />
        <Metric
          label="Critical / urgent"
          value={
            <>
              <span className="critical-number">
                {critical.length.toString()}
              </span>
              <span className="metric-divider">/</span>
              {urgent.length.toString()}
            </>
          }
          detail="Red / yellow clinical categories"
        />
        <Metric
          label="Awaiting assessment"
          value={pending.length.toString()}
          detail="Human triage required"
        />
        <Metric
          label="Available beds"
          value={freeBeds.length.toString()}
          detail={`${allBeds.length} beds in registered inventory`}
        />
      </div>

      <div className={`overview-grid ${queue ? "full-width" : ""}`}>
        <section className="panel queue-panel">
          <SectionTitle title="Patient queue">
            <span className="count-label">
              {active.length} active · click eye icon to quick-peek
            </span>
          </SectionTitle>
          <div className="tabs" role="group" aria-label="Filter patient queue">
            {[
              "All patients",
              "Awaiting triage",
              "RED",
              "YELLOW",
              "GREEN",
              "Reassessment due",
            ].map((x) => (
              <button
                type="button"
                key={x}
                className={filter === x ? "selected" : ""}
                aria-pressed={filter === x}
                onClick={() => setFilter(x)}
              >
                {x === "RED"
                  ? "Critical"
                  : x === "YELLOW"
                    ? "Urgent"
                    : x === "GREEN"
                      ? "Non-immediate"
                      : x}
                {x === "Awaiting triage" && <span>{pending.length}</span>}
                {x === "Reassessment due" && overdue.length > 0 && (
                  <span>{overdue.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="table-toolbar">
            <input
              aria-label="Filter patients"
              placeholder="Search name, complaint, or encounter ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Filter department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All departments</option>
              {data.departments.map((d) => (
                <option value={d.id} key={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter assignment"
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
            >
              <option value="">All assignments</option>
              <option value="mine">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                className="button small"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
          <PatientTable
            encounters={displayed}
            onReset={hasFilters ? clearFilters : undefined}
          />
          <div className="panel-foot">
            <span>
              {displayed.length} encounters · Clinical urgency always comes
              first
            </span>
            <Link href="/smartflow">
              View patient flow <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {!queue && (
          <aside className="right-rail">
            <section className="attention-panel">
              <div className="section-title">
                <h2>
                  <EmergencyBeaconIcon size={18} /> Review flags
                </h2>
                <span className="count-label">
                  {critical.length + overdue.length}
                </span>
              </div>
              <div
                className="attention-list"
                tabIndex={0}
                role="region"
                aria-label="Clinical review flags"
              >
                {critical.map((e) => (
                  <Link
                    key={e.id}
                    href={`/encounters/${e.id}`}
                    className="attention-item"
                  >
                    <span className="alert-line" />
                    <div>
                      <strong>Critical assessment</strong>
                      <p>
                        {data.patients.find((p) => p.id === e.patient_id)?.name}
                      </p>
                      <small>{e.symptoms}</small>
                    </div>
                    <ArrowRight size={15} />
                  </Link>
                ))}
                {overdue.map((e) => (
                  <Link
                    key={e.id}
                    href={`/encounters/${e.id}`}
                    className="attention-item"
                  >
                    <Clock3 size={18} />
                    <div>
                      <strong>Reassessment overdue</strong>
                      <p>
                        {data.patients.find((p) => p.id === e.patient_id)?.name}
                      </p>
                      <small>Review observations and current priority</small>
                    </div>
                  </Link>
                ))}
                {!critical.length && !overdue.length && (
                  <Empty title="No current review flags" />
                )}
              </div>
              <Link href="/emergency-center" className="rail-link">
                Open coordination centre <ArrowRight size={15} />
              </Link>
            </section>

            <section className="panel capacity-panel">
              <SectionTitle title="Department capacity">
                <AcuityShieldIcon size={16} />
              </SectionTitle>
              {data.departments.map((d) => {
                const count = active.filter(
                  (e) => e.department_id === d.id,
                ).length;
                return (
                  <div className="capacity-row" key={d.id}>
                    <div>
                      <span>{d.name}</span>
                      <strong>
                        {count}
                        <small> / {d.capacity}</small>
                      </strong>
                    </div>
                    <meter
                      min={0}
                      max={d.capacity}
                      value={count}
                      aria-label={`${d.name} occupancy`}
                    />
                  </div>
                );
              })}
              <Link className="rail-link" href="/departments">
                Manage departments <ArrowRight size={15} />
              </Link>
            </section>
          </aside>
        )}
      </div>

      <section className="flow-summary">
        <div>
          <h2>Patient flow</h2>
          <p>Live encounter progression across clinical stages.</p>
        </div>
        <div className="flow-steps">
          {[
            ["TRIAGE_PENDING", "Awaiting triage"],
            ["WAITING", "Waiting"],
            ["ASSESSMENT", "Assessment"],
            ["TREATMENT", "Treatment"],
            ["DISCHARGED", "Discharged"],
          ].map(([status, label]) => (
            <Link key={status} href="/smartflow">
              <span>
                {label}
                <strong>
                  {data.encounters.filter((e) => e.status === status).length}
                </strong>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
