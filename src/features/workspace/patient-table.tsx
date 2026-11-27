"use client";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge, Empty, Status, minutes } from "@/components/ui";
import { useWorkspace } from "./context";
import { rankQueue, queueExplanation } from "@/features/queue/rank";
import type { Row } from "@/lib/data";

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
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label="Patient encounter table"
    >
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient / encounter</th>
            <th>Priority</th>
            <th>Department</th>
            <th>Waiting</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(preserveOrder ? encounters : rankQueue(encounters)).map((e) => {
            const p = data.patients.find((p) => p.id === e.patient_id);
            const overdue =
              e.reassessment_due &&
              Date.parse(e.reassessment_due) < Date.parse(data.loadedAt);
            return (
              <tr key={e.id}>
                <td>
                  <Link className="patient-cell" href={`/encounters/${e.id}`}>
                    <span>
                      <strong>{p?.name ?? "Patient"}</strong>
                      <small>
                        <span className="mono">{e.reference}</span>{" "}
                        <span>·</span>{" "}
                        {p?.age == null ? "Age unknown" : `${p?.age} yrs`}
                      </small>
                    </span>
                  </Link>
                </td>
                <td title={queueExplanation(e)}>
                  <Badge category={e.category} />
                  {e.emergency && (
                    <small className="cell-caption">Emergency override</small>
                  )}
                </td>
                <td>
                  {data.departments.find((d) => d.id === e.department_id)
                    ?.name ?? "Awaiting assignment"}
                </td>
                <td>
                  <span className="wait-time">
                    <Clock3 size={14} aria-hidden="true" />
                    {minutes(e.arrived_at, data.loadedAt)} min
                  </span>
                  {overdue && (
                    <small className="cell-caption review">
                      Reassessment due
                    </small>
                  )}
                </td>
                <td>
                  <Status value={e.status} />
                </td>
                <td>
                  <Link
                    href={`/encounters/${e.id}`}
                    className="icon-button"
                    aria-label={`Open ${p?.name ?? e.reference}`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
