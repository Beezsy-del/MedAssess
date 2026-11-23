import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
import { Activity } from "lucide-react";
export default function Emergency() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <Activity size={36} />
        <h1>Get help from hospital staff now.</h1>
        <p>
          If someone is unresponsive, struggling to breathe, bleeding heavily,
          or appears seriously unwell, alert the nearest nurse, doctor,
          reception desk, or emergency team immediately.
        </p>
        <div className="patient-emergency">
          <strong>
            Do not wait to scan a QR code, create an account, or complete a
            form.
          </strong>
          <p>This website is not an emergency dispatch service.</p>
        </div>
        <p>
          If you are outside a hospital, contact your local emergency services
          or ask someone nearby to help.
        </p>
        <Link className="button" href="/patient/start">
          Patient registration information
        </Link>
        <Link className="button primary" href="/login">
          Staff sign in
        </Link>
      </main>
      <footer className="public-footer">
        MediRoute · Synthetic demonstration only
      </footer>
    </>
  );
}
