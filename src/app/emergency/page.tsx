import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
import { EmergencyBeaconIcon, PatientPortalIcon } from "@/components/icons";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function Emergency() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <div className="gateway-icon-wrap" aria-hidden="true">
          <EmergencyBeaconIcon size={28} />
        </div>
        <h1>Get help from hospital staff now.</h1>
        <p>
          If someone is unresponsive, struggling to breathe, bleeding heavily,
          or appears seriously unwell, alert the nearest nurse, doctor,
          reception desk, or emergency team immediately.
        </p>
        <div className="patient-emergency">
          <div className="patient-emergency-copy">
            <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} aria-hidden="true" />
              Do not wait to scan a QR code, create an account, or complete a
              form.
            </strong>
            <p>
              This website is not an emergency dispatch service. Speak directly
              with hospital personnel on duty.
            </p>
          </div>
        </div>
        <p>
          If you are outside a hospital, contact your local emergency services
          or ask someone nearby to help.
        </p>
        <div className="button-row">
          <Link className="button" href="/patient-portal">
            <PatientPortalIcon size={16} />
            Patient intake portal
          </Link>
          <Link className="button" href="/patient/start">
            QR registration info
          </Link>
          <Link className="button primary" href="/login">
            Staff sign in <ArrowRight size={16} />
          </Link>
        </div>
      </main>
      <footer className="public-footer">
        MediRoute · Synthetic demonstration only
      </footer>
    </>
  );
}
