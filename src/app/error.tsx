"use client";
import { PublicHeader } from "@/components/chrome";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <h1>We couldn’t load this page.</h1>
        <p>
          Check your connection and try again. For emergency assistance, contact
          nearby staff directly.
        </p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </main>
    </>
  );
}
