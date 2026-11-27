"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Field } from "@/components/ui";
import { PublicHeader, CareMap } from "@/components/chrome";

export function Login({
  demo = false,
  reset = false,
}: {
  demo?: boolean;
  reset?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(""),
    [isError, setIsError] = useState(false),
    [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false);

  async function login(payload: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      if (reset) {
        setMessage(result.message);
      } else {
        router.push(
          result.redirect === "/registration" ? "/registration" : "/dashboard",
        );
        router.refresh();
      }
    } catch (e) {
      setIsError(true);
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
              <ShieldCheck size={17} aria-hidden="true" />
              <span>
                Synthetic demonstration only. Clinical operations are disabled.
              </span>
            </div>
          </div>
        </section>

        <section className="login-form">
          <div>
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="clinician@hospital.example"
                  required
                />
              </Field>
              {!reset && (
                <Field label="Password">
                  <div className="password-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              )}
              <button type="submit" className="button primary" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : reset
                    ? "Request recovery email"
                    : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
            {message && (
              <p
                className={
                  isError ? "error-text spaced" : "success-text spaced"
                }
                role={isError ? "alert" : "status"}
              >
                {message}
              </p>
            )}
            <Link
              className="text-link"
              href={reset ? "/login" : "/forgot-password"}
            >
              {reset ? "Return to sign in" : "Forgot your password?"}
            </Link>
            {demo && !reset && (
              <div className="demo-login">
                <div>
                  <ShieldCheck size={17} aria-hidden="true" />
                  <strong>Try a staff role</strong>
                </div>
                <p>
                  Explore with synthetic patients. Changes are saved in the
                  demo.
                </p>
                <div className="button-row">
                  {["doctor", "nurse", "admin"].map((role) => (
                    <button
                      type="button"
                      className="button"
                      key={role}
                      disabled={busy}
                      onClick={() => void login({ action: "demo", role })}
                    >
                      {role === "admin"
                        ? "Administrator"
                        : role === "doctor"
                          ? "Doctor"
                          : "Triage nurse"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="muted spaced">
              Need emergency assistance?{" "}
              <Link href="/emergency" className="back-link">
                Contact nearby staff now
              </Link>
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
