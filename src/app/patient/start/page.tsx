import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
import { QrCode, Smartphone, ShieldAlert } from "lucide-react";

export default function Start() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <h1>Welcome to MedCipher</h1>
        <p>
          Visit reception to receive a secure encounter pass. Scan the QR code
          on your pass to share your symptoms with your care team.
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
            Enter the private link from your printed pass in your browser. Do
            not share it with others.
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
