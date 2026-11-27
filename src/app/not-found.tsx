import Link from "next/link";
import { PublicHeader } from "@/components/chrome";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <h1>This page isn’t available.</h1>
        <p>
          Check the address or return to your workspace. If you have a patient
          pass, use the complete private link printed on it.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/dashboard">
            Open workspace
          </Link>
          <Link className="button" href="/emergency">
            Emergency help
          </Link>
        </div>
      </main>
    </>
  );
}
