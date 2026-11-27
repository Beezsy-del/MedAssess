"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Play, QrCode, ShieldAlert } from "lucide-react";
import { PublicHeader } from "@/components/chrome";
import { PatientPortalIcon, PatientIntakeIcon } from "@/components/icons";

function extractToken(raw: string): string | null {
  const cleaned = raw.trim();
  const match = cleaned.match(/[a-f0-9]{64}/i);
  return match ? match[0].toLowerCase() : null;
}

export default function PatientPortalGatewayPage() {
  const router = useRouter();
  const [passInput, setPassInput] = useState("");
  const [error, setError] = useState("");

  function openPass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const token = extractToken(passInput);
    if (!token) {
      setError(
        "Enter the 64-character access token or full encounter pass link provided by hospital reception.",
      );
      return;
    }
    router.push(`/patient/intake/${token}`);
  }

  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <div className="gateway-header">
          <span className="story-badge">
            <PatientPortalIcon size={15} />
            Patient Intake &amp; Encounter Pass
          </span>
          <h1>Patient Portal</h1>
          <p>
            Complete guided self-intake in our interactive clinical workflow
            demo, or open your private hospital encounter pass issued by
            reception.
          </p>
        </div>

        <div className="patient-access-options">
          <section className="panel panel-copy gateway-card featured">
            <div className="gateway-icon-wrap" aria-hidden="true">
              <PatientIntakeIcon size={24} />
            </div>
            <h2>Interactive Patient Intake Demo</h2>
            <p>
              Walk through the multilingual self-triage questionnaire (English,
              ಕನ್ನಡ, हिन्दी), generate an illustrative QR visit pass, and test
              live priority escalation — with synthetic data only.
            </p>
            <div className="button-row">
              <Link className="button primary" href="/patient-portal/demo">
                <Play size={15} /> Launch intake simulator
              </Link>
              <Link className="button" href="/login">
                Staff portals
              </Link>
            </div>
          </section>

          <section className="panel panel-copy gateway-card">
            <div className="gateway-icon-wrap" aria-hidden="true">
              <QrCode size={24} />
            </div>
            <h2>Hospital Encounter QR Pass</h2>
            <p>
              Paste the private token or link printed on your hospital reception
              pass to complete intake or check encounter status.
            </p>
            <form className="stack-form" onSubmit={openPass}>
              <label className="field">
                <span>Private pass link or 64-character token</span>
                <input
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="https://…/patient/intake/… or token"
                  aria-label="Private pass link or token"
                />
              </label>
              {error && (
                <p className="form-note" role="alert">
                  {error}
                </p>
              )}
              <div className="button-row">
                <button type="submit" className="button">
                  <KeyRound size={15} /> Open encounter pass
                </button>
                <Link className="text-link" href="/patient/start">
                  QR instructions <ArrowRight size={14} />
                </Link>
              </div>
            </form>
          </section>
        </div>

        <div className="patient-emergency">
          <div className="patient-emergency-copy">
            <strong>
              <ShieldAlert size={18} aria-hidden="true" />
              Need urgent or emergency medical help right now?
            </strong>
            <p>
              Do not wait for an online form. Alert nearby hospital staff or
              call local emergency services immediately.
            </p>
          </div>
          <Link className="button emergency-button" href="/emergency">
            Emergency assistance
          </Link>
        </div>
      </main>
      <footer className="public-footer">
        MedCipher · Clinical Triage &amp; Patient Intake Portal
      </footer>
    </>
  );
}
