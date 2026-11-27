import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
import { PatientPortalIcon } from "@/components/icons";
import { QrCode, Smartphone, ShieldAlert, ArrowRight } from "lucide-react";

export default function Start() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <div className="gateway-icon-wrap" aria-hidden="true">
          <PatientPortalIcon size={26} />
        </div>
        <h1>Hospital Encounter Pass</h1>
        <p>
          Visit reception to receive a private QR encounter pass. Scan the QR
          code on your printed pass to share symptoms directly with your care
          team.
        </p>
        <div className="detail-grid spaced">
          <div className="form-note">
            <strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <QrCode size={17} aria-hidden="true" /> Using your QR pass
            </strong>
            Enter or scan the private link from your printed pass in your
            browser. Do not share it with others.
          </div>
          <div className="form-note">
            <strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Smartphone size={17} aria-hidden="true" /> No smartphone? No
              problem.
            </strong>
            A receptionist or nurse can register you and record your
            information. You do not need an account to receive care.
          </div>
        </div>
        <div className="button-row">
          <Link className="button primary" href="/patient-portal">
            Open patient portal &amp; demo <ArrowRight size={15} />
          </Link>
          <Link className="button emergency-button" href="/emergency">
            <ShieldAlert size={16} aria-hidden="true" />
            Need help immediately?
          </Link>
          <Link className="button" href="/login">
            Staff sign in
          </Link>
        </div>
      </main>
      <footer className="public-footer">
        MedCipher · Synthetic demonstration only
      </footer>
    </>
  );
}
