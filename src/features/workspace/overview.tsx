"use client";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Clock3,
  ShieldCheck,
  BedDouble,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "./context";
import { PatientTable } from "./patient-table";
import { Metric, SectionTitle, Empty } from "@/components/ui";
import { terminalStatuses } from "@/features/flow/machine";
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
  const [filter, setFilter] = useState("All patients"),
    [search, setSearch] = useState(initialQuery),
    [department, setDepartment] = useState(""),
    [assignment, setAssignment] = useState("");
  const active = data.encounters.filter(
    (e) => !terminalStatuses.includes(e.status),
  );
  const critical = active.filter((e) => e.category === "RED");
  const pending = active.filter((e) => e.category === "ASSESSMENT_REQUIRED");
  const overdue = active.filter(
    (e) =>
      e.deteriorating ||
      (e.reassessment_due !== null &&
        Date.parse(e.reassessment_due) < Date.parse(data.loadedAt)),
  );
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
        `${data.patients.find((p) => p.id === e.patient_id)?.name} ${e.reference} ${e.symptoms}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
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
                ? "Connected to hospital"
                : "Offline — last received data"}
            </span>
          </p>
          <h1>{title}</h1>
          <p>
            A clear view of your patients, priorities, and hospital capacity.
          </p>
        </div>
        <Link href="/reception" className="button primary">
          <Plus size={17} /> Register patient
        </Link>
      </div>
      <div className="demo-notice">
        <ShieldCheck size={17} />
        <span>
          Synthetic demonstration data. Clinical decisions require qualified
          staff. This protocol is not validated.
        </span>
        <Link href="/settings/triage-protocol">
          View protocol <ArrowRight size={14} />
        </Link>
      </div>
      <div className="metrics">
        <Metric
          label="Active encounters"
          value={active.length.toString().padStart(2, "0")}
          detail="Across all departments"
        />
        <Metric
          label="Critical / urgent"
          value={
            <>
              <span className="critical-number">
                {critical.length.toString().padStart(2, "0")}
              </span>
              <span className="metric-divider">/</span>
              {active
                .filter((e) => e.category === "YELLOW")
                .length.toString()
                .padStart(2, "0")}
            </>
          }
          detail="Red / yellow clinical categories"
        />
        <Metric
          label="Awaiting assessment"
          value={pending.length.toString().padStart(2, "0")}
          detail="Human triage required"
        />
        <Metric
          label="Available beds"
          value={data.resources
            .filter((r) => r.kind.includes("bed") && r.status === "AVAILABLE")
            .length.toString()
            .padStart(2, "0")}
          detail={`${data.resources.filter((r) => r.kind.includes("bed")).length} beds in registered inventory`}
        />
      </div>
      <div className={`overview-grid ${queue ? "full-width" : ""}`}>
        <section className="panel queue-panel">
          <SectionTitle title="Patient queue">
            <span className="count-label">
              {active.length} active encounters
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
                key={x}
                className={filter === x ? "selected" : ""}
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
              </button>
            ))}
          </div>
          <div className="table-toolbar">
            <input
              aria-label="Filter patients"
              placeholder="Search name or encounter ID"
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
          </div>
          <PatientTable encounters={displayed} />
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
                  <Activity size={17} /> Needs attention
                </h2>
                <span className="count-label">
                  {critical.length + overdue.length}
                </span>
              </div>
              {critical.map((e) => (
                <Link
                  key={e.id}
                  href={`/encounters/${e.id}`}
                  className="attention-item"
                >
                  <span className="alert-line" />
                  <div>
                    <strong>Emergency assessment</strong>
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
              <Link href="/emergency-center" className="rail-link">
                Open coordination centre <ArrowRight size={15} />
              </Link>
            </section>
            <section className="panel capacity-panel">
              <SectionTitle title="Department capacity" />
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
            <div className="handover-note">
              <BedDouble size={21} />
              <div>
                <strong>Keep the next step clear.</strong>
                <p>Record every handover and disposition in SmartFlow.</p>
                <Link href="/smartflow">
                  Open SmartFlow <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>
      <section className="flow-summary">
        <div>
          <h2>The patient journey</h2>
          <p>Every transition recorded. Every handover accountable.</p>
        </div>
        <div className="flow-steps">
          {[
            ["TRIAGE_PENDING", "Awaiting triage"],
            ["WAITING", "Waiting"],
            ["ASSESSMENT", "Assessment"],
            ["TREATMENT", "Treatment"],
            ["DISCHARGED", "Discharged"],
          ].map(([status, label], i) => (
            <Link key={status} href="/smartflow">
              <span className="step-index">{i + 1}</span>
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
