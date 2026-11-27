"use client";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mic, MicOff, ShieldCheck } from "lucide-react";
import { Field, Skeleton, Status } from "@/components/ui";
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
  onend: (() => void) | null;
};

const stageIndex = (status: string) => {
  if (["REGISTERED", "TRIAGE_PENDING"].includes(status)) return 1;
  if (["TRIAGE_COMPLETED", "WAITING", "STAFF_ASSIGNED"].includes(status))
    return 2;
  return 3;
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
    [loadedToken, setLoadedToken] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [listening, setListening] = useState(false),
    [busy, setBusy] = useState(false);
  const loading = loadedToken !== token && !error;
  const recognitionRef = useRef<SpeechInstance | null>(null);
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
          setLoadedToken(token);
        }
      })
      .catch(() => {
        if (active) {
          setError("Connection unavailable. Ask hospital staff for help.");
          setLoadedToken(token);
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function emergency() {
    if (busy) return;
    setWarning("yes");
    setError("");
    setMessage(t.emergency);
    setBusy(true);
    try {
      await call("emergency");
      setMessage(t.sent);
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
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
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
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
    recognitionRef.current = recognition;
    recognition.lang =
      language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (e) =>
      setSymptoms((previous) =>
        `${previous} ${e.results[0][0].transcript}`.trim(),
      );
    recognition.onerror = () => {
      setListening(false);
      setMessage(t.voiceUnavailable);
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  const currentStage = status ? stageIndex(status.status) : 0;

  return (
    <main
      lang={language}
      className={`patient-page ${large ? "large-text" : ""}`}
    >
      <header className="patient-header">
        <Brand />
        <div className="button-row">
          <ThemeToggle />
          <select
            aria-label={t.language}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
          <button
            type="button"
            className={`button small ${large ? "primary" : ""}`}
            aria-pressed={large}
            onClick={() => setLarge(!large)}
          >
            {t.large}
          </button>
        </div>
      </header>

      <p className="translation-note">
        Prototype only · Kannada and Hindi clinical wording requires human
        review.
      </p>

      <div className="patient-emergency">
        <div className="patient-emergency-copy">
          <strong>{t.emergency}</strong>
        </div>
        <button
          type="button"
          className="button emergency-button"
          disabled={busy}
          onClick={() => void emergency()}
        >
          {t.help}
        </button>
      </div>

      {error && (
        <div className="error-text spaced" role="alert">
          {error}
        </div>
      )}
      {message && (
        <p className="form-note spaced" role="status">
          {message}
        </p>
      )}

      {loading && !status && !error && (
        <section className="panel patient-form" aria-busy="true">
          <Skeleton height={16} width="35%" />
          <div style={{ marginTop: 14 }}>
            <Skeleton height={32} width="70%" />
          </div>
          <div style={{ marginTop: 18 }}>
            <Skeleton height={90} />
          </div>
          <div style={{ marginTop: 18 }}>
            <Skeleton height={44} width="45%" />
          </div>
        </section>
      )}

      {status && (status.submitted || statusOnly) ? (
        <section className="panel patient-form">
          <ShieldCheck size={32} aria-hidden="true" />
          <h1>{status.submitted ? t.saved : t.status}</h1>
          <p className="mono">{status.reference}</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "12px 0",
            }}
          >
            <span>{t.status}:</span>
            <Status value={status.status} />
          </div>
          <ol className="patient-progress" aria-label="Visit progress">
            <li className="is-done">1. Pass issued</li>
            <li
              className={
                currentStage > 1
                  ? "is-done"
                  : currentStage === 1
                    ? "is-active"
                    : ""
              }
            >
              2. Triage queue
            </li>
            <li
              className={
                currentStage > 2
                  ? "is-done"
                  : currentStage === 2
                    ? "is-active"
                    : ""
              }
            >
              3. Clinician review
            </li>
            <li className={currentStage >= 3 ? "is-active" : ""}>
              4. Care & next step
            </li>
          </ol>
          <p>{t.instruction}</p>
        </section>
      ) : (
        status && (
          <section className="panel patient-form">
            <p className="page-context mono">{status.reference}</p>
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
              <div className="button-row">
                <button
                  type="button"
                  className={`button ${listening ? "primary" : ""}`}
                  aria-pressed={listening}
                  onClick={dictate}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {listening ? "Stop voice input" : t.voice}
                </button>
              </div>
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
              <button type="submit" className="button primary" disabled={busy}>
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
