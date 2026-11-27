"use client";
import { useState } from "react";
import { useWorkspace } from "./context";
import { Modal } from "@/components/ui";
import { canCommand } from "@/features/access/policy";
export function ResourceRequests({ encounterId }: { encounterId?: string }) {
  const { data, command, busy, setMessage } = useWorkspace();
  const [selected, setSelected] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const request = data.resourceRequests.find((r) => r.id === selected?.id);
  return (
    <section className="panel panel-copy spaced">
      <h2>Assistance resource requests</h2>
      <p>
        A request is not an allocation. Fulfillment checks current inventory
        availability.
      </p>
      {data.resourceRequests
        .filter((r) => !encounterId || r.encounter_id === encounterId)
        .map((r) => (
          <article key={r.id} className="history-item">
            <h3>
              {r.kind} ·{" "}
              {data.encounters.find((e) => e.id === r.encounter_id)?.reference}
            </h3>
            <p>{r.reason}</p>
            <p>
              {r.status} ·{" "}
              {r.acknowledged_by
                ? data.staff.find((s) => s.user_id === r.acknowledged_by)
                    ?.display_name
                : "Not acknowledged"}
            </p>
            {canCommand(data.membership.role, "resource_request_status") &&
              ["REQUESTED", "ACKNOWLEDGED"].includes(r.status) && (
                <div className="button-row">
                  <button
                    className="button"
                    onClick={() =>
                      setSelected({
                        id: r.id,
                        status:
                          r.status === "REQUESTED"
                            ? "ACKNOWLEDGED"
                            : "FULFILLED",
                      })
                    }
                  >
                    {r.status === "REQUESTED"
                      ? "Acknowledge"
                      : "Allocate matching resource"}
                  </button>
                  <button
                    className="button"
                    onClick={() =>
                      setSelected({ id: r.id, status: "CANCELLED" })
                    }
                  >
                    Cancel with reason
                  </button>
                </div>
              )}
          </article>
        ))}
      {!data.resourceRequests.some(
        (r) => !encounterId || r.encounter_id === encounterId,
      ) && <p>No requests recorded.</p>}
      {selected && request && (
        <Modal
          title={
            selected.status === "FULFILLED"
              ? "Allocate requested resource"
              : "Record request status"
          }
          onClose={() => setSelected(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await command("resource_request_status", {
                  operation_id: crypto.randomUUID(),
                  id: selected.id,
                  status: selected.status,
                  reason: f.get("reason"),
                  ...(selected.status === "FULFILLED"
                    ? { resource_id: f.get("resource_id") }
                    : {}),
                });
                setSelected(null);
              } catch (err) {
                setMessage(
                  err instanceof Error ? err.message : "Request update failed",
                );
              }
            }}
          >
            {selected.status === "FULFILLED" && (
              <label className="field">
                Available {request.kind}
                <select name="resource_id" required defaultValue="">
                  <option value="" disabled>
                    Choose an appropriate available resource
                  </option>
                  {data.resources
                    .filter(
                      (r) =>
                        r.kind === request.kind && r.status === "AVAILABLE",
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {r.location}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="field">
              Reason / verification
              <textarea name="reason" required minLength={5} />
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
