import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  MediRouteLogo,
  PatientIntakeIcon,
  StethoscopeCrossIcon,
  FlowJunctionIcon,
  VitalsMonitorIcon,
} from "./icons";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand-symbol" aria-hidden="true">
        <MediRouteLogo size={28} />
      </span>
      <span className="brand-wordmark">
        <strong>MediRoute</strong>
        <small>Triage &amp; Flow</small>
      </span>
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="public-topbar">
      <Brand />
      <nav className="public-nav" aria-label="Public access">
        <Link href="/login">Staff sign in</Link>
        <Link href="/patient-portal">Patient intake</Link>
        <Link href="/patient/start">QR pass</Link>
      </nav>
      <div className="topbar-actions">
        <span className="environment-label">
          <ShieldCheck size={14} aria-hidden="true" /> Synthetic demo
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
      role="region"
      aria-label={
        counts
          ? "Current encounter stages"
          : "Registration, assessment and coordination workflow"
      }
    >
      <div className="map-caption">
        <span>{counts ? "Encounter stages" : "Care pipeline"}</span>
        <span>{counts ? "Hospital snapshot" : "Door-to-disposition"}</span>
      </div>
      <div className="map-nodes">
        <div className="map-node">
          <span className="map-icon" aria-hidden="true">
            <PatientIntakeIcon size={20} />
          </span>
          <strong>{counts ? counts.pending : "01 · Intake"}</strong>
          <small>
            {counts ? "Awaiting triage" : "QR pass or desk check-in"}
          </small>
        </div>
        <span className="map-connector" aria-hidden="true" />
        <div className="map-node center">
          <span className="map-icon" aria-hidden="true">
            <StethoscopeCrossIcon size={22} />
          </span>
          <strong>{counts ? counts.assessment : "02 · Triage"}</strong>
          <small>{counts ? "In assessment" : "Acuity & vitals review"}</small>
        </div>
        <span className="map-connector" aria-hidden="true" />
        <div className="map-node">
          <span className="map-icon" aria-hidden="true">
            <FlowJunctionIcon size={20} />
          </span>
          <strong>{counts ? counts.treatment : "03 · Flow"}</strong>
          <small>{counts ? "In treatment" : "Bed bay & handover"}</small>
        </div>
      </div>
      <div className="map-foot">
        <VitalsMonitorIcon size={15} />
        <span>
          {counts
            ? "Counts reflect recorded status, not clinical recommendations."
            : "Clinician-verified triage · Auditable handovers"}
        </span>
      </div>
    </div>
  );
}
