"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Plus,
  BedDouble,
  ArrowRight,
  Download,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/features/workspace/context";
import {
  Badge,
  Status,
  Field,
  Modal,
  Empty,
  Metric,
  time,
} from "@/components/ui";
import { terminalStatuses } from "@/features/flow/machine";
import { ProfileSettings } from "@/features/workspace/profile";
import { forecast } from "@/features/analytics/forecast";
export function SmartFlow() {
  const { data } = useWorkspace();
  const [department, setDepartment] = useState("");
  const stages = [
    ["Arrival & triage", ["REGISTERED", "TRIAGE_PENDING", "TRIAGE_COMPLETED"]],
    ["Waiting & assignment", ["WAITING", "STAFF_ASSIGNED"]],
    ["Assessment & diagnostics", ["ASSESSMENT", "DIAGNOSTICS"]],
    ["Treatment & disposition", ["TREATMENT", "DISPOSITION"]],
    [
      "Onward care",
      ["ADMITTED", "REFERRED", "TRANSFERRED", "DISCHARGED", "CANCELLED"],
    ],
  ] as const;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">MedCipher SmartFlow</p>
          <h1>Every patient. Every next step.</h1>
          <p>
            Follow the care journey with accountable, timestamped handovers.
          </p>
        </div>
        <select
          aria-label="Department filter"
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
      </div>
      <div className="flow-board">
        {stages.map(([name, statuses]) => {
          const encounters = data.encounters.filter(
            (e) =>
              (statuses as readonly string[]).includes(e.status) &&
              (!department || e.department_id === department),
          );
          return (
            <section key={name} className="flow-column">
              <h2>
                {name}
                <span>{encounters.length}</span>
              </h2>
              {encounters.map((e) => (
                <Link
                  key={e.id}
                  href={`/encounters/${e.id}`}
                  className="flow-card"
                >
                  <Badge category={e.category} />
                  <h3>
                    {data.patients.find((p) => p.id === e.patient_id)?.name}
                  </h3>
                  <small>{e.reference}</small>
                  <p>{e.symptoms || "Awaiting intake"}</p>
                  <Status value={e.status} />
                  <small>Updated {time(e.updated_at)}</small>
                </Link>
              ))}
              {!encounters.length && (
                <p className="column-empty">No patients in this stage</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
export function Resources() {
  const { data, command, busy } = useWorkspace();
  const [resource, setResource] = useState(""),
    [error, setError] = useState(""),
    [kind, setKind] = useState("");
  async function reserve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await command("reserve", {
        resource_id: resource,
        encounter_id: new FormData(event.currentTarget).get("encounter_id"),
      });
      setResource("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reservation failed");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Hospital operations</p>
          <h1>Beds & resources</h1>
          <p>
            Reserve safely. Release after handover. Confirm cleaning before
            reuse.
          </p>
        </div>
        <select
          aria-label="Resource type"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">All resources</option>
          {Array.from(new Set(data.resources.map((r) => r.kind))).map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      <div className="metrics">
        <Metric
          label="Available"
          value={data.resources.filter((r) => r.status === "AVAILABLE").length}
          detail="Ready for allocation"
        />
        <Metric
          label="Reserved"
          value={data.resources.filter((r) => r.status === "RESERVED").length}
          detail="Assigned to an encounter"
        />
        <Metric
          label="Occupied"
          value={data.resources.filter((r) => r.status === "OCCUPIED").length}
          detail="Currently in use"
        />
        <Metric
          label="Cleaning / maintenance"
          value={
            data.resources.filter((r) =>
              ["CLEANING", "MAINTENANCE"].includes(r.status),
            ).length
          }
          detail="Unavailable until released"
        />
      </div>
      <div className="resource-grid">
        {data.resources
          .filter((r) => !kind || r.kind === kind)
          .map((r) => {
            const reservation = data.reservations.find(
              (x) => x.resource_id === r.id,
            );
            const encounter = data.encounters.find(
              (e) => e.id === reservation?.encounter_id,
            );
            return (
              <section className="resource-card" key={r.id}>
                <div className="resource-icon">
                  <BedDouble size={24} />
                  <Status value={r.status} />
                </div>
                <h2>{r.name}</h2>
                <p>
                  {r.location} · {r.kind}
                </p>
                {encounter && (
                  <Link href={`/encounters/${encounter.id}`}>
                    {encounter.reference}
                  </Link>
                )}
                <button
                  disabled={busy}
                  className={`button full ${r.status === "AVAILABLE" ? "primary" : ""}`}
                  onClick={() =>
                    r.status === "AVAILABLE"
                      ? (setResource(r.id), setError(""))
                      : void command("release", { resource_id: r.id }).catch(
                          () => {},
                        )
                  }
                >
                  {r.status === "AVAILABLE"
                    ? "Reserve resource"
                    : r.status === "CLEANING"
                      ? "Confirm cleaned & available"
                      : "Release for cleaning"}
                </button>
              </section>
            );
          })}
      </div>
      <p className="form-note spaced">
        If the appropriate resource is unavailable, contact the emergency
        coordinator and review referral options. Resource shortages never reduce
        clinical priority.
      </p>
      {resource && (
        <Modal title="Reserve resource" onClose={() => setResource("")}>
          <form className="stack-form" onSubmit={reserve}>
            <Field label="Patient encounter">
              <select name="encounter_id" required>
                {data.encounters
                  .filter((e) => !terminalStatuses.includes(e.status))
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {data.patients.find((p) => p.id === e.patient_id)?.name} ·{" "}
                      {e.reference} · {e.category}
                    </option>
                  ))}
              </select>
            </Field>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              Confirm reservation
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Alerts() {
  const { data, command, busy } = useWorkspace();
  const [selected, setSelected] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  const [all, setAll] = useState(false);
  const alerts = data.notifications.filter(
    (n) => all || !["RESOLVED", "CANCELLED"].includes(n.status),
  );
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await command("alert", {
        id: selected,
        status,
        reason: new FormData(event.currentTarget).get("reason"),
      });
      setSelected("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Alert update failed");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Emergency coordination</p>
          <h1>Response & notifications</h1>
          <p>Track acknowledgement, response, escalation, and resolution.</p>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={all}
            onChange={(e) => setAll(e.target.checked)}
          />
          Include resolved alerts
        </label>
      </div>
      <div className="info-strip">
        <ShieldCheck size={20} />
        <span>
          In-app delivery is active. SMS and browser push are not configured; no
          external messages are being sent.
        </span>
      </div>
      <div className="alert-list">
        {alerts.map((n) => {
          const e = data.encounters.find((e) => e.id === n.encounter_id);
          const overdue =
            Date.parse(data.loadedAt) - Date.parse(n.created_at) >
              data.settings.alert_minutes * 60000 && !n.acknowledged_at;
          return (
            <section className="panel alert-card" key={n.id}>
              <div>
                {e && <Badge category={e.category} />}
                <Status value={n.status} />
                {overdue && (
                  <span className="review">Acknowledgement overdue</span>
                )}
              </div>
              <h2>{n.title}</h2>
              <Link href={`/encounters/${n.encounter_id}`}>
                {data.patients.find((p) => p.id === e?.patient_id)?.name} ·{" "}
                {e?.reference}
              </Link>
              <p>
                Recipients:{" "}
                {n.recipient_roles
                  .map((r) => r.replaceAll("_", " "))
                  .join(", ")}
              </p>
              <small>
                {time(n.created_at)}
                {n.acknowledged_at
                  ? ` · Acknowledged ${time(n.acknowledged_at)}`
                  : ""}
              </small>
              <div className="button-row spaced">
                {(n.status === "CREATED" || n.status === "ESCALATED") && (
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() =>
                      void command("alert", {
                        id: n.id,
                        status: "ACKNOWLEDGED",
                      }).catch(() => {})
                    }
                  >
                    Acknowledge
                  </button>
                )}
                {n.status === "ACKNOWLEDGED" && (
                  <button
                    className="button primary"
                    onClick={() =>
                      void command("alert", {
                        id: n.id,
                        status: "IN_PROGRESS",
                      }).catch(() => {})
                    }
                  >
                    Response in progress
                  </button>
                )}
                {n.status === "IN_PROGRESS" && (
                  <button
                    className="button"
                    onClick={() => {
                      setSelected(n.id);
                      setStatus("RESOLVED");
                    }}
                  >
                    Resolve with notes
                  </button>
                )}
                {["CREATED", "ACKNOWLEDGED", "IN_PROGRESS"].includes(
                  n.status,
                ) && (
                  <button
                    className="button"
                    onClick={() =>
                      void command("alert", {
                        id: n.id,
                        status: "ESCALATED",
                      }).catch(() => {})
                    }
                  >
                    Escalate to backup team
                  </button>
                )}
              </div>
              {n.resolution && <p>{n.resolution}</p>}
            </section>
          );
        })}
        {!alerts.length && (
          <Empty
            title="No open alerts"
            description="New clinical notifications will appear here."
          />
        )}
      </div>
      {selected && (
        <Modal title="Resolve alert" onClose={() => setSelected("")}>
          <form className="stack-form" onSubmit={save}>
            <Field label="Response and resolution notes">
              <textarea name="reason" required minLength={5} />
            </Field>
            {error && <p role="alert">{error}</p>}
            <button className="button primary">Save resolution</button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Departments() {
  const { data } = useWorkspace();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Hospital operations</p>
          <h1>Departments & workload</h1>
          <p>
            Patient volume from current encounters; capacity from hospital
            configuration.
          </p>
        </div>
        <Link href="/settings/hospital" className="button">
          Configure departments
        </Link>
      </div>
      <div className="resource-grid">
        {data.departments.map((d) => {
          const active = data.encounters.filter(
            (e) =>
              e.department_id === d.id && !terminalStatuses.includes(e.status),
          );
          return (
            <section className="resource-card" key={d.id}>
              <Users size={25} />
              <h2>{d.name}</h2>
              <p>{d.location}</p>
              <strong className="big-count">
                {active.length}
                <small> / {d.capacity} capacity</small>
              </strong>
              <meter
                max={d.capacity}
                value={active.length}
                aria-label={`${d.name} workload`}
              />
              <dl>
                <div>
                  <dt>Awaiting assessment</dt>
                  <dd>
                    {
                      active.filter((e) => e.category === "ASSESSMENT_REQUIRED")
                        .length
                    }
                  </dd>
                </div>
                <div>
                  <dt>In treatment</dt>
                  <dd>
                    {active.filter((e) => e.status === "TREATMENT").length}
                  </dd>
                </div>
              </dl>
            </section>
          );
        })}
      </div>
    </>
  );
}
export function Referrals() {
  const { data, command } = useWorkspace();
  const [selected, setSelected] = useState(""),
    [error, setError] = useState("");
  const next: Record<string, string> = {
    REQUESTED: "CONTACTED",
    CONTACTED: "ACCEPTED",
    ACCEPTED: "DEPARTED",
    DEPARTED: "ARRIVED",
    ARRIVED: "COMPLETED",
  };
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ref = data.referrals.find((r) => r.id === selected)!;
    try {
      await command("referral_status", {
        id: ref.id,
        encounter_id: ref.encounter_id,
        status: next[ref.status],
        reason: new FormData(event.currentTarget).get("reason"),
      });
      setSelected("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Inter-facility coordination</p>
          <h1>Referrals & transfers</h1>
          <p>Document acceptance and transport at every step.</p>
        </div>
        <Link href="/doctor" className="button primary">
          Open clinical workspace
        </Link>
      </div>
      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>Active referrals</h2>
          {data.referrals.map((r) => (
            <article className="history-item" key={r.id}>
              <Status value={r.status} />
              <h3>
                {data.facilities.find((f) => f.id === r.facility_id)?.name}
              </h3>
              <p>{r.reason}</p>
              <p>{r.summary}</p>
              <small>{r.transport}</small>
              <p>
                {r.acknowledgement ??
                  "Receiving facility has not yet acknowledged."}
              </p>
              <div className="button-row">
                <Link className="button" href={`/encounters/${r.encounter_id}`}>
                  View encounter
                </Link>
                {next[r.status] && (
                  <button
                    className="button primary"
                    onClick={() => {
                      setSelected(r.id);
                      setError("");
                    }}
                  >
                    Record {next[r.status].toLowerCase()}
                  </button>
                )}
              </div>
            </article>
          ))}
          {!data.referrals.length && (
            <Empty
              title="No referrals recorded"
              description="A doctor can initiate a referral from a patient's encounter."
            />
          )}
        </section>
        <section className="panel detail-panel">
          <h2>Destination directory</h2>
          {data.facilities.map((f) => (
            <article className="history-item" key={f.id}>
              <h3>{f.name}</h3>
              <p>{f.services}</p>
              <p>{f.contact}</p>
              <small>{f.availability_note}</small>
            </article>
          ))}
        </section>
      </div>
      {selected && (
        <Modal title="Record referral progress" onClose={() => setSelected("")}>
          <form className="stack-form" onSubmit={save}>
            <Field label="Contact, acceptance or handover evidence">
              <textarea name="reason" minLength={5} required />
            </Field>
            {error && <p role="alert">{error}</p>}
            <button className="button primary">Save referral event</button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Analytics() {
  const { data } = useWorkspace();
  const [days, setDays] = useState(7);
  const cutoff = Date.parse(data.loadedAt) - days * 86400000;
  const records = data.encounters.filter(
    (e) => Date.parse(e.arrived_at) >= cutoff,
  );
  const completed = records.filter((e) => terminalStatuses.includes(e.status));
  const result = forecast(
    records.map((e) => e.arrived_at),
    Math.min(
      days,
      Math.floor(
        (Date.parse(data.loadedAt) - Date.parse(data.hospital.created_at)) /
          86400000,
      ),
    ),
  );
  const count = (status: string) =>
    records.filter((e) => e.status === status).length;
  function csv() {
    const rows = [
      ["Metric", "Count"],
      ["Encounters", String(records.length)],
      ["Discharged", String(count("DISCHARGED"))],
      ["Admitted", String(count("ADMITTED"))],
      ["Transferred", String(count("TRANSFERRED"))],
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "medcipher-synthetic-aggregate-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Operational intelligence</p>
          <h1>Analytics & forecasting</h1>
          <p>
            Aggregate hospital activity. No individual clinical predictions.
          </p>
        </div>
        <div className="button-row">
          <select
            aria-label="Reporting period"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value="1">Last day</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button className="button" onClick={csv}>
            <Download size={16} />
            Export aggregate CSV
          </button>
          <button className="button" onClick={() => window.print()}>
            Print report
          </button>
        </div>
      </div>
      <div className="metrics">
        <Metric
          label="Registrations"
          value={records.length}
          detail={`Past ${days} days`}
        />
        <Metric
          label="Discharges"
          value={count("DISCHARGED")}
          detail="Documented dispositions"
        />
        <Metric
          label="Admissions"
          value={count("ADMITTED")}
          detail="Bed-linked admissions"
        />
        <Metric
          label="Completed encounters"
          value={completed.length}
          detail="Includes onward transfers"
        />
      </div>
      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>Patient volume by department</h2>
          {data.departments.map((d) => {
            const n = records.filter((e) => e.department_id === d.id).length;
            return (
              <div className="chart-row" key={d.id}>
                <span>{d.name}</span>
                <div>
                  <i
                    style={{
                      width: `${records.length ? (n / records.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{n}</strong>
              </div>
            );
          })}
          <p className="muted">
            Counts are derived from the current reporting window, up to 500
            recent encounters.
          </p>
        </section>
        <section className="panel detail-panel">
          <h2>Arrival forecast</h2>
          {result.available ? (
            <>
              <p>{result.method}</p>
              {result.hours.map((h) => (
                <div className="forecast-hour" key={h.hour}>
                  <span>{h.hour}:00</span>
                  <meter
                    max={Math.max(...result.hours.map((x) => x.expected), 1)}
                    value={h.expected}
                  />
                  <strong>{h.expected}</strong>
                </div>
              ))}
            </>
          ) : (
            <Empty title="More history needed" description={result.reason} />
          )}
        </section>
      </div>
    </>
  );
}
export function Audit() {
  const { data } = useWorkspace();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Accountability</p>
          <h1>Audit trail</h1>
          <p>Append-only records of patient and operational actions.</p>
        </div>
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When (IST)</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.audit.map((a) => (
                <tr key={a.id}>
                  <td>{time(a.created_at)}</td>
                  <td>
                    {data.staff.find((s) => s.user_id === a.actor)
                      ?.display_name ?? "Patient / system"}
                  </td>
                  <td>{a.action}</td>
                  <td>{a.entity_id?.slice(0, 8) ?? "—"}</td>
                  <td>{JSON.stringify(a.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.audit.length && (
          <Empty
            title="No visible audit records"
            description="Audit access requires a hospital administrator role."
          />
        )}
      </section>
    </>
  );
}
export function Settings({ section }: { section: string }) {
  const { data, command } = useWorkspace();
  const [modal, setModal] = useState(""),
    [error, setError] = useState("");
  const admin = ["hospital_admin", "super_admin"].includes(
    data.membership.role,
  );
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await command(
        modal,
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setModal("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Hospital configuration</p>
          <h1>
            {section.includes("triage-protocol")
              ? "Clinical protocols"
              : section.includes("staff")
                ? "Staff & shifts"
                : "Settings"}
          </h1>
          <p>
            Trusted roles, explicit review, and hospital-specific operations.
          </p>
        </div>
      </div>
      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>{data.hospital.name}</h2>
          <p>{data.hospital.location}</p>
          <p>Current user: {data.membership.display_name}</p>
          <Status value={data.membership.role} />
          <hr />
          <h3>Operational configuration</h3>
          <p>
            Reassessment warning: {data.settings.reassessment_minutes} minutes
          </p>
          <p>
            Alert acknowledgement warning: {data.settings.alert_minutes} minutes
          </p>
          <p>Demonstration intervals are not clinical recommendations.</p>
          {admin && (
            <div className="button-row">
              {[
                ["settings", "Edit intervals"],
                ["department", "Add department"],
                ["resource", "Add resource"],
                ["facility", "Add referral facility"],
                ["shift", "Schedule shift"],
              ].map(([key, label]) => (
                <button
                  className="button"
                  key={key}
                  onClick={() => {
                    setModal(key);
                    setError("");
                  }}
                >
                  <Plus size={15} />
                  {label}
                </button>
              ))}
            </div>
          )}
          <hr />
          <h3>Clinical protocols</h3>
          {data.protocols.map((p) => (
            <div className="history-item" key={p.id}>
              <strong>{p.name}</strong>
              <p>
                {p.version} · {p.status}
              </p>
              <small>{p.reference}</small>
            </div>
          ))}
          <p className="form-note">
            Clinical operational use is disabled at the database level. No
            administrator can activate this demonstration protocol. A reviewed
            protocol and a separate safety acceptance process are required.
          </p>
        </section>
        <section className="panel detail-panel">
          <h2>Staff directory</h2>
          {data.staff.map((s) => (
            <div className="list-row" key={s.id}>
              <span>
                <strong>{s.display_name}</strong>
                <small>{s.role.replaceAll("_", " ")}</small>
              </span>
              <Status value={s.active ? "Active" : "Inactive"} />
            </div>
          ))}
          <h3 className="spaced">Duty shifts</h3>
          {data.shifts.map((s) => (
            <p key={s.id}>
              {data.staff.find((m) => m.user_id === s.user_id)?.display_name}
              <br />
              <small>
                {time(s.starts_at)} — {time(s.ends_at)}
              </small>
            </p>
          ))}
          {!data.shifts.length && (
            <p className="muted">
              No shifts scheduled. Active membership does not imply on-duty
              availability.
            </p>
          )}
          <p className="form-note">
            Account invitations and privileged role changes require secure
            administrator provisioning; self-assigned staff roles are
            prohibited.
          </p>
          <Link href="/reception" className="back-link">
            Manage device drafts <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      {!data.hospital.is_demo && <ProfileSettings />}
      {modal && (
        <Modal
          title="Update hospital configuration"
          onClose={() => setModal("")}
        >
          <form className="stack-form" onSubmit={save}>
            {modal === "settings" ? (
              <>
                <Field label="Reassessment minutes">
                  <input
                    name="reassessment_minutes"
                    type="number"
                    min="1"
                    max="240"
                    defaultValue={data.settings.reassessment_minutes}
                    required
                  />
                </Field>
                <Field label="Acknowledgement minutes">
                  <input
                    name="alert_minutes"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={data.settings.alert_minutes}
                    required
                  />
                </Field>
              </>
            ) : modal === "shift" ? (
              <>
                <Field label="Staff member">
                  <select name="user_id">
                    {data.staff.map((s) => (
                      <option value={s.user_id} key={s.id}>
                        {s.display_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Starts (include timezone, e.g. +05:30)">
                  <input
                    name="starts_at"
                    placeholder="2026-11-20T09:00:00+05:30"
                    required
                  />
                </Field>
                <Field label="Ends (include timezone)">
                  <input
                    name="ends_at"
                    placeholder="2026-11-20T17:00:00+05:30"
                    required
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Name">
                  <input name="name" required maxLength={160} />
                </Field>
                {modal !== "facility" && (
                  <Field label="Location">
                    <input name="location" required />
                  </Field>
                )}
                {modal === "department" && (
                  <Field label="Capacity">
                    <input name="capacity" type="number" min="1" required />
                  </Field>
                )}
                {modal === "resource" && (
                  <Field label="Type">
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
                {modal === "facility" && (
                  <>
                    <Field label="Contact information">
                      <input name="contact" required />
                    </Field>
                    <Field label="Services">
                      <input name="services" required />
                    </Field>
                  </>
                )}
              </>
            )}
            {error && <p role="alert">{error}</p>}
            <button className="button primary">Save configuration</button>
          </form>
        </Modal>
      )}
    </>
  );
}
