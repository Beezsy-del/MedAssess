"use client";
import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "./context";
import { Resources } from "@/features/operations/views";
import { BedManagement } from "@/features/beds/bed-management";
export function ResourceSummary() {
  const { data } = useWorkspace();
  const beds = data.resources.filter((r) => r.kind.includes("bed"));
  return (
    <aside className="resource-sidebar">
      <details open>
        <summary>Hospital capacity</summary>
        <h2>Beds</h2>
        <dl>
          {[
            ["Total", beds.length],
            ...[
              "AVAILABLE",
              "OCCUPIED",
              "CLEANING",
              "RESERVED",
              "MAINTENANCE",
              "BLOCKED",
            ].map((s) => [
              s === "BLOCKED" ? "Unavailable" : s.toLowerCase(),
              beds.filter((b) => b.status === s).length,
            ]),
            [
              "Awaiting admission / bed",
              data.census.awaiting_admission ??
                data.bedPlans.filter((p) => p.decision === "AWAITING").length,
            ],
          ].map(([label, count]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>
        <h2>Equipment</h2>
        <dl>
          {["Stretcher", "Wheelchair", "Equipment"].map((kind) => (
            <div key={kind}>
              <dt>{kind}</dt>
              <dd>
                {
                  data.resources.filter(
                    (r) => r.kind === kind && r.status === "AVAILABLE",
                  ).length
                }{" "}
                available /{" "}
                {
                  data.resources.filter(
                    (r) =>
                      r.kind === kind &&
                      ["OCCUPIED", "RESERVED"].includes(r.status),
                  ).length
                }{" "}
                in use
              </dd>
            </div>
          ))}
        </dl>
        <h2>Operational census</h2>
        <dl>
          {[
            ["Waiting", data.census.waiting],
            ["Critical", data.census.critical],
            ["Urgent", data.census.urgent],
          ].map(([label, count]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{count ?? "Not available"}</dd>
            </div>
          ))}
        </dl>
        <Link className="button" href="/resources">
          Manage resources
        </Link>
        <p>
          Recorded availability requires staff confirmation before allocation.
        </p>
      </details>
    </aside>
  );
}
export function AdministrativeDirectory() {
  const { data } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const rows = data.encounters.filter(
    (e) =>
      (!status || e.status === status) &&
      `${e.reference} ${data.patients.find((p) => p.id === e.patient_id)?.name ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const safePage = Math.min(page, Math.max(0, Math.ceil(rows.length / 25) - 1));
  return (
    <div className="administration-layout">
      <section>
        <div className="page-heading">
          <div>
            <h1>Patient directory</h1>
            <p>Registration, department and encounter status.</p>
          </div>
        </div>
        <div className="panel panel-copy">
          <div className="filter-bar">
            <label className="field">
              Search name or encounter
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <label className="field">
              Encounter status
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All statuses</option>
                {[...new Set(data.encounters.map((e) => e.status))]
                  .sort()
                  .map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </label>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Encounter</th>
                  <th>Patient</th>
                  <th>Registered</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(safePage * 25, safePage * 25 + 25).map((e) => (
                  <tr key={e.id}>
                    <td>{e.reference}</td>
                    <td>
                      {data.patients.find((p) => p.id === e.patient_id)?.name ??
                        "Unavailable"}
                    </td>
                    <td>
                      {new Date(e.arrived_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                    <td>
                      {data.departments.find((d) => d.id === e.department_id)
                        ?.name ?? "Unassigned"}
                    </td>
                    <td>{e.status.replaceAll("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p>No matching encounters.</p>}
          <div className="button-row">
            <button
              className="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </button>
            <span>
              {rows.length} encounters · Page {safePage + 1} of{" "}
              {Math.max(1, Math.ceil(rows.length / 25))}
            </span>
            <button
              className="button"
              disabled={(safePage + 1) * 25 >= rows.length}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </button>
          </div>
          {data.directory_truncated && (
            <p role="status">
              Showing the latest 10,000 encounters. A complete export is not
              available in this view.
            </p>
          )}
        </div>
      </section>
      <ResourceSummary />
    </div>
  );
}
export function AdministrativeResources() {
  const { data, command, busy, setMessage } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [edit, setEdit] = useState<string | null>(null);
  return (
    <div className="administration-layout">
      <section>
        <h1>Resource inventory</h1>
        <p>Recorded beds, equipment and turnover status.</p>
        <div className="panel panel-copy">
          <div className="filter-bar">
            <label className="field">
              Search resource
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label className="field">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                {[
                  "AVAILABLE",
                  "OCCUPIED",
                  "RESERVED",
                  "CLEANING",
                  "MAINTENANCE",
                  "BLOCKED",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s === "BLOCKED" ? "UNAVAILABLE" : s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Encounter</th>
                  <th>Last status change</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.resources
                  .filter(
                    (r) =>
                      (!status || r.status === status) &&
                      `${r.name} ${r.location}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((r) => {
                    const allocation = data.reservations.find(
                      (a) => a.resource_id === r.id,
                    );
                    return (
                      <tr key={r.id}>
                        <td>
                          {r.name}
                          <small>{r.kind}</small>
                        </td>
                        <td>{r.location}</td>
                        <td>
                          {r.status === "BLOCKED" ? "UNAVAILABLE" : r.status}
                        </td>
                        <td>
                          {data.encounters.find(
                            (e) => e.id === allocation?.encounter_id,
                          )?.reference ?? "—"}
                        </td>
                        <td>
                          {r.status_updated_at
                            ? new Date(r.status_updated_at).toLocaleString(
                                "en-IN",
                                { timeZone: "Asia/Kolkata" },
                              )
                            : "No change recorded"}
                        </td>
                        <td>
                          <button
                            className="button"
                            onClick={() => setEdit(r.id)}
                          >
                            Edit details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {edit && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                try {
                  await command("resource_edit", {
                    operation_id: crypto.randomUUID(),
                    resource_id: edit,
                    name: form.get("name"),
                    location: form.get("location"),
                    reason: form.get("reason"),
                  });
                  setEdit(null);
                } catch (err) {
                  setMessage(
                    err instanceof Error ? err.message : "Update failed",
                  );
                }
              }}
            >
              <h2>Edit resource details</h2>
              <label className="field">
                Name
                <input
                  name="name"
                  required
                  maxLength={160}
                  defaultValue={data.resources.find((r) => r.id === edit)?.name}
                />
              </label>
              <label className="field">
                Location
                <input
                  name="location"
                  maxLength={300}
                  defaultValue={
                    data.resources.find((r) => r.id === edit)?.location
                  }
                />
              </label>
              <label className="field">
                Reason
                <input name="reason" required minLength={5} />
              </label>
              <button className="button primary" disabled={busy}>
                Save details
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setEdit(null)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
        <details className="panel panel-copy spaced">
          <summary>Bed map, status and configuration</summary>
          <BedManagement />
        </details>
        <details className="panel panel-copy spaced">
          <summary>Add and manage equipment</summary>
          <form
            className="stack-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              try {
                await command(
                  "resource",
                  Object.fromEntries(new FormData(form)),
                );
                form.reset();
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Resource creation failed",
                );
              }
            }}
          >
            <h2>Add equipment</h2>
            <label className="field">
              Resource name
              <input name="name" required maxLength={160} />
            </label>
            <label className="field">
              Resource location
              <input name="location" required maxLength={300} />
            </label>
            <label className="field">
              Resource type
              <select name="kind">
                <option>Stretcher</option>
                <option>Wheelchair</option>
                <option>Equipment</option>
              </select>
            </label>
            <button className="button primary" disabled={busy}>
              Add equipment
            </button>
          </form>
          <Resources />
        </details>
      </section>
      <ResourceSummary />
    </div>
  );
}
