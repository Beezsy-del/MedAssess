"use client";
import { useState } from "react";
import { useWorkspace } from "./context";
import { protocolSchema } from "@/features/questionnaire/rules";
import { Modal } from "@/components/ui";
export function StaffAccess() {
  const { data, command, busy, setMessage, refresh } = useWorkspace();
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const member = data.staff.find((s) => s.user_id === selected);
  return (
    <section>
      <h1>Staff access</h1>
      <p>
        Active hospital membership controls access. Department assignments limit
        clinical records to eligible teams.
      </p>
      <details className="panel panel-copy spaced">
        <summary>Create a synthetic staff account</summary>
        <p>
          Provision an account and hospital membership. Share credentials
          through your approved private channel; this form sends no email.
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const values = new FormData(form);
            if (creating) return;
            setCreating(true);
            try {
              const response = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  hospital: data.hospital.id,
                  operation_id: crypto.randomUUID(),
                  email: values.get("email"),
                  password: values.get("password"),
                  display_name: values.get("display_name"),
                  role: values.get("role"),
                }),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              form.reset();
              await refresh();
              setMessage(
                "Staff account and membership created. Assign department access before clinical work.",
              );
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Account creation failed",
              );
            } finally {
              setCreating(false);
            }
          }}
        >
          <label className="field">
            Display name
            <input name="display_name" required maxLength={160} />
          </label>
          <label className="field">
            Staff email
            <input name="email" type="email" required autoComplete="off" />
          </label>
          <label className="field">
            Initial password
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            Staff role
            <select name="role">
              {[
                "doctor",
                "nurse",
                "triage_nurse",
                "receptionist",
                "resource_manager",
                "emergency_coordinator",
              ].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <button className="button primary" disabled={busy || creating}>
            Create account and membership
          </button>
        </form>
      </details>
      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Role</th>
              <th>Account access</th>
              <th>Departments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.staff.map((s) => (
              <tr key={s.id}>
                <td>{s.display_name}</td>
                <td>{s.role.replaceAll("_", " ")}</td>
                <td>{s.active ? "Active" : "Disabled"}</td>
                <td>
                  {data.departmentMemberships
                    .filter((m) => m.user_id === s.user_id)
                    .map(
                      (m) =>
                        data.departments.find((d) => d.id === m.department_id)
                          ?.name,
                    )
                    .join(", ") || "None assigned"}
                </td>
                <td>
                  <button
                    className="button"
                    onClick={() => setSelected(s.user_id)}
                  >
                    Manage access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        New account provisioning requires the server-only Supabase
        administrative credential. Existing memberships can be managed
        independently.
      </p>
      {member && (
        <Modal
          title={`Access for ${member.display_name}`}
          onClose={() => setSelected(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await command("staff_access", {
                  operation_id: crypto.randomUUID(),
                  user_id: member.user_id,
                  role: f.get("role"),
                  active: f.get("active") === "on",
                  reason: f.get("reason"),
                });
                setSelected(null);
              } catch (err) {
                setMessage(
                  err instanceof Error ? err.message : "Access update failed",
                );
              }
            }}
          >
            <label className="field">
              Role
              <select
                name="role"
                defaultValue={member.role}
                disabled={
                  member.role === "super_admin" ||
                  member.user_id === data.userId
                }
              >
                {[
                  "hospital_admin",
                  "doctor",
                  "nurse",
                  "triage_nurse",
                  "receptionist",
                  "resource_manager",
                  "emergency_coordinator",
                  "super_admin",
                ].map((role) => (
                  <option key={role} disabled={role === "super_admin"}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                name="active"
                type="checkbox"
                defaultChecked={member.active}
              />{" "}
              Active membership
            </label>
            <label className="field">
              Reason
              <input name="reason" required minLength={5} />
            </label>
            <button
              disabled={
                busy ||
                member.role === "super_admin" ||
                member.user_id === data.userId
              }
              className="button primary"
            >
              Save role and access
            </button>
          </form>
          <hr />
          <h3>Department membership</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await command("department_access", {
                  operation_id: crypto.randomUUID(),
                  user_id: member.user_id,
                  department_id: f.get("department_id"),
                  enabled: f.get("enabled") === "true",
                  reason: f.get("reason"),
                });
              } catch (err) {
                setMessage(
                  err instanceof Error
                    ? err.message
                    : "Department access update failed",
                );
              }
            }}
          >
            <label className="field">
              Department
              <select name="department_id" required>
                {data.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Access
              <select name="enabled">
                <option value="true">Grant department access</option>
                <option value="false">Remove department access</option>
              </select>
            </label>
            <label className="field">
              Reason
              <input name="reason" required minLength={5} />
            </label>
            <button className="button" disabled={busy || !member.active}>
              Save department access
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
export function ProtocolConfiguration() {
  const { data, command, busy, setMessage } = useWorkspace();
  const [configuration, setConfiguration] = useState("");
  const [review, setReview] = useState<string | null>(null);
  return (
    <section>
      <h1>Clinical protocol configuration</h1>
      <p>
        Only approved, referenced criteria may be activated. Activation records
        the responsible clinician; this synthetic prototype remains disabled for
        clinical operational use.
      </p>
      <div className="panel panel-copy">
        <h2>Import a reviewed protocol draft</h2>
        <p>
          Provide the hospital-approved configuration, including version, source
          reference, explicit rule requirements and reassessment intervals. No
          diagnostic thresholds are supplied by this application.
        </p>
        <details>
          <summary>Configuration format</summary>
          <p>
            Required properties: name, version, reference (URL), rules (id,
            category, explanation, requires, all), considerations (label,
            symptoms, limitations, reference), reassessment_minutes (RED,
            YELLOW, GREEN, ASSESSMENT_REQUIRED). Each condition contains field,
            operator (equals, contains, gte, lte), and value. Intervals are in
            minutes.
          </p>
        </details>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              const parsed = protocolSchema.parse(JSON.parse(configuration));
              await command("protocol_save", {
                operation_id: crypto.randomUUID(),
                configuration: parsed,
                reason: f.get("reason"),
              });
              setConfiguration("");
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Invalid configuration",
              );
            }
          }}
        >
          <label className="field">
            Approved configuration JSON
            <textarea
              value={configuration}
              onChange={(e) => setConfiguration(e.target.value)}
              rows={12}
              required
              spellCheck={false}
            />
          </label>
          <label className="field">
            Review provenance / reason
            <input name="reason" required minLength={5} />
          </label>
          <button className="button primary" disabled={busy}>
            Save immutable draft
          </button>
        </form>
      </div>
      <section className="panel panel-copy spaced">
        <h2>Protocol versions</h2>
        {data.protocols.map((p) => (
          <article className="history-item" key={p.id}>
            <h3>
              {p.name} · {p.version}
            </h3>
            <p>
              {p.status} ·{" "}
              {p.approved_at
                ? `Reviewed ${new Date(p.approved_at).toLocaleString()}`
                : "Not approved"}
            </p>
            {p.reference && (
              <a href={p.reference} rel="noreferrer" target="_blank">
                Source reference
              </a>
            )}
            <details>
              <summary>Review exact configuration</summary>
              <pre className="report-json">
                {JSON.stringify(p.configuration, null, 2)}
              </pre>
            </details>
            {p.status === "draft" && (
              <button className="button" onClick={() => setReview(p.id)}>
                Review and activate
              </button>
            )}
          </article>
        ))}
      </section>
      <section className="panel panel-copy spaced">
        <h2>OPD routing review</h2>
        <p>
          RED cannot be routed to general OPD. Review each destination’s
          clinical eligibility independently of capacity.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await command("department_routing", {
                operation_id: crypto.randomUUID(),
                department_id: f.get("department_id"),
                categories: f.getAll("categories"),
                reviewed: f.get("reviewed") === "on",
                reason: f.get("reason"),
              });
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Routing update failed",
              );
            }
          }}
        >
          <label className="field">
            Department
            <select required name="department_id">
              {data.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input type="checkbox" name="categories" value="GREEN" /> GREEN
            appropriate for this destination
          </label>
          <label>
            <input type="checkbox" name="categories" value="YELLOW" /> YELLOW
            urgent pathway explicitly supported
          </label>
          <label className="field">
            Reviewed protocol / reason
            <textarea name="reason" required minLength={5} />
          </label>
          <label>
            <input name="reviewed" type="checkbox" required /> I reviewed the
            destination and permitted urgency categories.
          </label>
          <button className="button" disabled={busy}>
            Record routing review
          </button>
        </form>
      </section>
      {review && (
        <Modal
          title="Activate reviewed protocol"
          onClose={() => setReview(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await command("protocol_review", {
                  operation_id: crypto.randomUUID(),
                  id: review,
                  reviewed: f.get("reviewed") === "on",
                  reason: f.get("reason"),
                });
                setReview(null);
              } catch (err) {
                setMessage(
                  err instanceof Error ? err.message : "Activation failed",
                );
              }
            }}
          >
            <p>
              The current active version will be retired. Historical assessments
              retain their protocol version.
            </p>
            <label>
              <input type="checkbox" required name="reviewed" /> I am the
              responsible clinician and have reviewed the complete configuration
              and source protocol.
            </label>
            <label className="field">
              Approval record / reason
              <textarea required minLength={5} name="reason" />
            </label>
            <button className="button primary" disabled={busy}>
              Activate reviewed version
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
