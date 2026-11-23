"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Play } from "lucide-react";
import { PublicHeader } from "@/components/chrome";
import { AdaptivePortal } from "../questionnaire/portal";
export function PatientEntry() {
  const [pass, setPass] = useState(false);
  useEffect(() => {
    const open = () => {
      if (window.location.hash) setPass(true);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  if (pass) return <AdaptivePortal />;
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <h1>Patient Portal</h1>
        <p>
          Choose secure access to your hospital encounter, or explore a
          fictional care journey.
        </p>
        <div className="patient-access-options">
          <section className="panel panel-copy">
            <ShieldCheck aria-hidden="true" />
            <h2>Real Patient Access</h2>
            <p>
              Use the private QR code or access token issued by authorised
              registration staff. Your encounter reference alone cannot open a
              record.
            </p>
            <Link className="button" href="/patient/start">
              Real Patient Access
            </Link>
          </section>
          <section className="panel panel-copy">
            <Play aria-hidden="true" />
            <h2>Explore Demo Mode</h2>
            <p>
              Experience the complete MediRoute patient journey without login or
              access token.
            </p>
            <p>
              Fictional patient data only. No hospital records or notifications
              are changed.
            </p>
            <Link className="button primary" href="/patient-portal/demo">
              Explore Demo Mode
            </Link>
          </section>
        </div>
        <p>
          For real emergency assistance,{" "}
          <Link href="/emergency">alert nearby hospital staff immediately</Link>
          . Do not wait for a questionnaire.
        </p>
      </main>
    </>
  );
}
