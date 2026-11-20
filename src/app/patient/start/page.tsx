import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
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
        <h2>No smartphone? No problem.</h2>
        <p>
          A receptionist or nurse can register you and record your information.
          You do not need an account to receive care.
        </p>
        <p>
          Enter the private link from your printed pass in your browser. Do not
          share it with others.
        </p>
        <Link className="button emergency-button" href="/emergency">
          Need help immediately?
        </Link>
        <Link className="button" href="/login">
          Staff sign in
        </Link>
      </main>
      <footer className="public-footer">
        MedCipher · Synthetic demonstration only
      </footer>
    </>
  );
}
