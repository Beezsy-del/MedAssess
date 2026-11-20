import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  ClipboardPlus,
  Stethoscope,
  Workflow,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand-symbol">
        <Activity size={24} />
      </span>
      <span>MedCipher</span>
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className="public-topbar">
      <Brand />
      <div className="topbar-actions">
        <span className="environment-label">
          <ShieldCheck size={14} /> Synthetic demo
        </span>
        <ThemeToggle />
        <Link className="public-help" href="/emergency">
          Emergency help
        </Link>
      </div>
    </header>
  );
}
export function CareMap({
  counts,
}: {
  counts?: { pending: number; assessment: number; treatment: number };
}) {
  return (
    <div
      className="care-map"
      aria-label={
        counts
          ? "Current encounter stages"
          : "Registration, assessment and coordination workflow"
      }
    >
      <div className="map-caption">
        <span>{counts ? "Encounter stages" : "Care coordination"}</span>
        <span>{counts ? "Hospital snapshot" : "Workflow overview"}</span>
      </div>
      <div className="map-nodes">
        <div className="map-node">
          <span className="map-icon">
            <ClipboardPlus size={23} />
          </span>
          <strong>{counts ? counts.pending : "Register"}</strong>
          <small>{counts ? "Awaiting triage" : "Create the encounter"}</small>
        </div>
        <span className="map-connector" aria-hidden="true" />
        <div className="map-node center">
          <span className="map-icon">
            <Stethoscope size={25} />
          </span>
          <strong>{counts ? counts.assessment : "Assess"}</strong>
          <small>{counts ? "In assessment" : "Review clinical urgency"}</small>
        </div>
        <span className="map-connector" aria-hidden="true" />
        <div className="map-node">
          <span className="map-icon">
            <Workflow size={23} />
          </span>
          <strong>{counts ? counts.treatment : "Coordinate"}</strong>
          <small>{counts ? "In treatment" : "Document the next step"}</small>
        </div>
      </div>
      <div className="map-foot">
        <Activity size={14} />
        <span>
          {counts
            ? "Counts reflect recorded status, not clinical recommendations."
            : "Human decisions. Documented handovers."}
        </span>
      </div>
    </div>
  );
}
