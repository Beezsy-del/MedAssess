"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  UserRound,
} from "lucide-react";
import { Field } from "@/components/ui";
import { PublicHeader, CareMap } from "@/components/chrome";
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
  const [message, setMessage] = useState(initialMessage),
    [busy, setBusy] = useState(false);
  async function login(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      if (reset) setMessage(result.message);
      else {
        router.push(
          ["/nurse", "/doctor", "/reception", "/dashboard"].includes(
            result.redirect,
          )
            ? result.redirect
            : "/dashboard",
        );
        router.refresh();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PublicHeader />
      <main className="login-layout">
        <section className="login-story">
          <div className="login-intro">
            <p className="hero-kicker">MedCipher hospital workspace</p>
            <h1>
              Triage and patient flow,
              <br />
              in one workspace.
            </h1>
            <p>
              From the first encounter to the next handover, keep clinical
              decisions and hospital coordination together.
            </p>
            <CareMap />
            <div className="login-safety">
              <ShieldCheck size={17} />
              <span>
                Synthetic demonstration only.
                <br />
                Clinical operations are disabled.
              </span>
            </div>
          </div>
        </section>
        <section className="login-form">
          <div>
            {!reset && (
              <section
                className="portal-picker"
                aria-label="Choose your portal"
              >
                <h2>Choose your portal</h2>
                <p>
                  {demo
                    ? "Staff options open the synthetic demonstration. Use your own credentials below for your staff account."
                    : "Staff use their hospital-issued credentials below. Patients use a private encounter pass."}
                </p>
                <div className="portal-options">
                  {[
                    {
                      role: "admin",
                      title: "Administrator Portal",
                      action: "Administrator",
                      description:
                        "Patient directory, staff and hospital resources.",
                      Icon: ShieldCheck,
                    },
                    {
                      role: "doctor",
                      title: "Doctor Portal",
                      action: "Doctor",
                      description:
                        "Assigned patients, assessments and clinical care.",
                      Icon: Stethoscope,
                    },
                    {
                      role: "nurse",
                      title: "Triage Nurse Portal",
                      action: "Triage nurse",
                      description:
                        "Patient intake, reassessment and care coordination.",
                      Icon: HeartPulse,
                    },
                  ].map(({ role, title, action, description, Icon }) => (
                    <article className="portal-option" key={role}>
                      <Icon size={23} aria-hidden="true" />
                      <h3>{title}</h3>
                      <p>{description}</p>
                      <button
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
                    <UserRound size={23} aria-hidden="true" />
                    <h3>PATIENT PORTAL</h3>
                    <p>
                      Register, enter your symptoms and receive your preliminary
                      care priority.
                    </p>
                    <Link className="button primary" href="/patient-portal">
                      Enter Patient Portal
                    </Link>
                  </article>
                </div>
              </section>
            )}
            <h2>{reset ? "Reset your password" : "Staff sign in"}</h2>
            <p>
              {reset
                ? "Request a secure recovery link."
                : "Sign in with your hospital-issued account."}
            </p>
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
              <button className="button primary" disabled={busy}>
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
            <Link
              className="text-link"
              href={reset ? "/login" : "/forgot-password"}
            >
              {reset ? "Return to sign in" : "Forgot your password?"}
            </Link>
            <p className="muted">
              Need emergency assistance?{" "}
              <Link href="/emergency">Contact nearby staff now.</Link>
            </p>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        MedCipher · Synthetic hospital workflow demonstration
      </footer>
    </>
  );
}
