"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Mic, ShieldCheck } from "lucide-react";
import { Field } from "@/components/ui";
import { translations, type Language } from "./translations";
type SpeechResult = {
  results: { [key: number]: { [key: number]: { transcript: string } } };
};
type SpeechInstance = {
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
};
export function PatientPortal({
  token,
  statusOnly = false,
}: {
  token: string;
  statusOnly?: boolean;
}) {
  const [language, setLanguage] = useState<Language>("en"),
    [large, setLarge] = useState(false),
    [symptoms, setSymptoms] = useState(""),
    [warning, setWarning] = useState(""),
    [status, setStatus] = useState<{
      reference: string;
      status: string;
      submitted: boolean;
    } | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const t = translations[language];
  async function call(action: string, data: Record<string, unknown> = {}) {
    const r = await fetch("/api/patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action, data }),
    });
    const result = await r.json();
    if (!r.ok || result.error) throw new Error(result.error ?? t.failed);
    return result;
  }
  useEffect(() => {
    let active = true;
    fetch("/api/patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "status" }),
    })
      .then((r) => r.json())
      .then((r) => {
        if (active) {
          if (r.error) setError(r.error);
          else setStatus(r);
        }
      })
      .catch(() =>
        setError("Connection unavailable. Ask hospital staff for help."),
      );
    return () => {
      active = false;
    };
  }, [token]);
  async function emergency() {
    setWarning("yes");
    setMessage(t.emergency);
    try {
      await call("emergency");
      setMessage(t.sent);
    } catch {
      setError(t.failed);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const f = Object.fromEntries(new FormData(event.currentTarget));
      await call("intake", {
        ...f,
        symptoms,
        language,
        emergency: warning === "" ? null : warning === "yes",
        consent: f.consent === "on",
      });
      setStatus(await call("status"));
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }
  function dictate() {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechInstance;
      webkitSpeechRecognition?: new () => SpeechInstance;
    };
    const Recognition = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage(t.voiceUnavailable);
      return;
    }
    const recognition = new Recognition();
    recognition.lang =
      language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (e) =>
      setSymptoms((previous) =>
        `${previous} ${e.results[0][0].transcript}`.trim(),
      );
    recognition.onerror = () => setMessage(t.voiceUnavailable);
    recognition.start();
  }
  return (
    <main
      lang={language}
      className={`patient-page ${large ? "large-text" : ""}`}
    >
      <header className="patient-header">
        <Link className="brand" href="/">
          <span className="brand-symbol">
            <Activity />
          </span>
          MedCipher
        </Link>
        <div className="button-row">
          <select
            aria-label={t.language}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
          <button className="button small" onClick={() => setLarge(!large)}>
            {t.large}
          </button>
        </div>
      </header>
      <p className="translation-note">
        Prototype only · Kannada and Hindi clinical wording requires human
        review.
      </p>
      <div className="patient-emergency">
        <strong>{t.emergency}</strong>
        <button
          className="button emergency-button"
          onClick={() => void emergency()}
        >
          {t.help}
        </button>
      </div>
      {error && (
        <div className="form-note" role="alert">
          {error}
        </div>
      )}
      {message && (
        <p className="form-note" role="status">
          {message}
        </p>
      )}
      {status && (status.submitted || statusOnly) ? (
        <section className="panel patient-form">
          <ShieldCheck size={32} />
          <h1>{status.submitted ? t.saved : t.status}</h1>
          <p>{status.reference}</p>
          <p>
            {t.status}: {status.status.replaceAll("_", " ")}
          </p>
          <p>{t.instruction}</p>
        </section>
      ) : (
        status && (
          <section className="panel patient-form">
            <p className="page-context">{status.reference}</p>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            <form className="stack-form" onSubmit={submit}>
              <Field label={t.warning}>
                <select
                  value={warning}
                  onChange={(e) => {
                    setWarning(e.target.value);
                    if (e.target.value === "yes") void emergency();
                  }}
                >
                  <option value="">{t.unknown}</option>
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </Field>
              <Field label={t.symptoms}>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                  minLength={2}
                  maxLength={3000}
                />
              </Field>
              <button type="button" className="button" onClick={dictate}>
                <Mic size={16} />
                {t.voice}
              </button>
              <div className="form-grid">
                <Field label={t.duration}>
                  <input name="duration" maxLength={200} />
                </Field>
                <Field label={t.pain}>
                  <input
                    name="pain"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </Field>
              </div>
              <Field label={t.progression}>
                <select name="progression">
                  <option>{t.unknown}</option>
                  <option>{t.better}</option>
                  <option>{t.same}</option>
                  <option>{t.worse}</option>
                </select>
              </Field>
              {(
                [
                  ["medical_history", t.history],
                  ["allergies", t.allergies],
                  ["medications", t.medications],
                  ["pregnancy", t.pregnancy],
                ] as const
              ).map(([name, label]) => (
                <Field key={name} label={label}>
                  <textarea name={name} maxLength={1000} />
                </Field>
              ))}
              <p className="form-note">{t.review}</p>
              <label className="check">
                <input name="consent" type="checkbox" required />
                {t.consent}
              </label>
              <button className="button primary" disabled={busy}>
                {busy ? t.saving : t.submit}
              </button>
            </form>
          </section>
        )
      )}
      <p className="patient-footer">{t.manual}</p>
    </main>
  );
}
