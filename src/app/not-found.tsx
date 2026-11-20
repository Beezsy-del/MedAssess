import Link from "next/link";
import { PublicHeader } from "@/components/chrome";
export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <span className="eyebrow">Page not found</span>
        <h1>This page isn’t available.</h1>
        <p>
          Check the address or return to your workspace. If you have a patient
          pass, use the complete private link printed on it.
        </p>
        <Link className="button primary" href="/dashboard">
          Open workspace
        </Link>
        <Link className="button" href="/emergency">
          Emergency help
        </Link>
      </main>
    </>
  );
}
