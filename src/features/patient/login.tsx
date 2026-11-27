"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck, QrCode, AlertTriangle } from "lucide-react";
import { Field } from "@/components/ui";
import { PublicHeader, CareMap } from "@/components/chrome";
import {
  AcuityShieldIcon,
  AuditSealIcon,
  PatientPortalIcon,
  StethoscopeCrossIcon,
} from "@/components/icons";

export function Login({
  demo = false,
  reset = false,
  initialMessage = "",
}: {
  demo?: boolean;
  reset?: boolean;
  initialMessage?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  async function login(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (reset) setMessage(result.message);
      else {
        router.push(
          [
            "/registration",
            "/nurse",
            "/doctor",
            "/reception",
            "/dashboard",
          ].includes(result.redirect)
            ? result.redirect
            : "/dashboard",
        );
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  const portals = [
    {
      role: "doctor",
      title: "Doctor Portal",
      action: "Doctor",
      meta: "Clinical diagnosis & notes",
      Icon: StethoscopeCrossIcon,
    },
    {
      role: "nurse",
      title: "Triage Nurse Portal",
      action: "Triage nurse",
      meta: "Vitals intake & reassessment",
      Icon: AcuityShieldIcon,
    },
    {
      role: "admin",
      title: "Administrator Portal",
      action: "Administrator",
      meta: "Beds, staffing & audit trail",
      Icon: AuditSealIcon,
    },
  ] as const;

  return (
    <>
      <PublicHeader />
      <main className="login-layout">
        <section className="login-story">
          <div className="login-intro">
            <span className="story-badge">
              <span className="story-dot" aria-hidden="true" />
              MedCipher Clinical Command · Synthetic Prototype
            </span>
            <h1>Clinical triage and bed flow, built for shift speed.</h1>
            <p>
              Unite patient intake passes, priority-ranked acuity queues,
              real-time reassessment alerts, and ward bay allocation in a single
              auditable workspace.
            </p>
            <CareMap />
            <div
              className="login-pill-strip"
              aria-label="Operational capabilities"
            >
              <span>ESI-style priority queue</span>
              <span>Multilingual QR intake</span>
              <span>Bed bay telemetry</span>
              <span>Human-first override</span>
            </div>
            <div className="login-safety">
              <ShieldCheck size={17} aria-hidden="true" />
              <span>
                Synthetic demonstration only. Clinical operations are disabled
                and require qualified staff judgement.
              </span>
            </div>
          </div>
        </section>

        <section className="login-form">
          <div className="login-panel-stack">
            {!reset && (
              <section
                className="portal-picker"
                aria-label="Choose your portal"
              >
                <div className="portal-picker-head">
                  <div>
                    <h2>Choose your portal</h2>
                    <p>
                      {demo
                        ? "Launch an interactive clinical role instantly, or enter patient self-intake."
                        : "Select your staff portal below, or open patient intake with an encounter pass."}
                    </p>
                  </div>
                </div>

                <div className="portal-options">
                  {portals.map(({ role, title, action, meta, Icon }) => (
                    <article className="portal-option" key={role}>
                      <div className="portal-option-top">
                        <span className="portal-icon-chip" aria-hidden="true">
                          <Icon size={20} />
                        </span>
                        <div>
                          <h3>{title}</h3>
                          <p>{meta}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="button"
                        disabled={busy}
                        onClick={() => {
                          if (demo) void login({ action: "demo", role });
                          else document.getElementById("staff-email")?.focus();
                        }}
                      >
                        {action}
                      </button>
                    </article>
                  ))}

                  <article className="portal-option portal-option-patient">
                    <div className="portal-option-top">
                      <span
                        className="portal-icon-chip portal-icon-gold"
                        aria-hidden="true"
                      >
                        <PatientPortalIcon size={20} />
                      </span>
                      <div>
                        <h3>Patient Intake Portal</h3>
                        <p>
                          Self-intake simulator, symptoms &amp; QR pass entry
                        </p>
                      </div>
                    </div>
                    <div className="portal-patient-actions">
                      <Link className="button primary" href="/patient-portal">
                        Enter patient intake
                        <ArrowRight size={15} />
                      </Link>
                      <Link className="portal-pass-link" href="/patient/start">
                        <QrCode size={14} aria-hidden="true" />
                        QR pass help
                      </Link>
                    </div>
                  </article>
                </div>
              </section>
            )}

            <section className="staff-signin-card">
              <div className="signin-head">
                <h2>{reset ? "Reset your password" : "Staff sign in"}</h2>
                <p>
                  {reset
                    ? "Request a secure recovery link."
                    : "Sign in with your hospital-issued email and password."}
                </p>
              </div>

              <form
                className="stack-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void login({
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                    action: reset ? "reset" : "login",
                  });
                }}
              >
                <Field label="Work email">
                  <input
                    id="staff-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </Field>
                {!reset && (
                  <Field label="Password">
                    <input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      minLength={8}
                    />
                  </Field>
                )}
                <button
                  type="submit"
                  className="button primary"
                  disabled={busy}
                >
                  {busy
                    ? "Please wait…"
                    : reset
                      ? "Request recovery email"
                      : "Sign in"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {message && (
                <p className="form-note" role="status">
                  {message}
                </p>
              )}

              <div className="login-links-row">
                <Link
                  className="text-link"
                  href={reset ? "/login" : "/forgot-password"}
                >
                  {reset ? "Return to sign in" : "Forgot your password?"}
                </Link>
                <Link className="emergency-inline-link" href="/emergency">
                  <AlertTriangle size={14} aria-hidden="true" />
                  Immediate emergency help
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        MedCipher · Clinical Triage &amp; Flow Prototype
      </footer>
    </>
  );
}
