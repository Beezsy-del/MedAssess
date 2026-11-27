"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Languages,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react";
import { PublicHeader } from "@/components/chrome";
import {
  AcuityShieldIcon,
  PatientIntakeIcon,
  StethoscopeCrossIcon,
  VitalsMonitorIcon,
} from "@/components/icons";
import { emergencySigns } from "@/features/clinical/engine";
import { translations, type Language } from "./translations";

type DemoCategory = "GREEN" | "YELLOW" | "RED";

type TimelineEntry = {
  id: number;
  time: string;
  actor: string;
  title: string;
  detail: string;
};

const QUICK_SYMPTOMS = [
  "Chest discomfort",
  "Shortness of breath",
  "High fever & chills",
  "Sprained ankle / minor fall",
  "Dizziness or weakness",
  "Persistent abdominal pain",
] as const;

const SCENARIO_PRESETS = [
  {
    id: "green",
    label: "Walk-in · General Waiting",
    category: "GREEN" as DemoCategory,
    name: "Asha Example",
    age: "42",
    complaint: "Mild ankle twist while walking; no chest pain or dizziness.",
    duration: "2 hours",
    pain: 3,
    worsening: false,
    warningSigns: [] as string[],
    history: "None reported",
  },
  {
    id: "yellow",
    label: "Urgent · Persistent Pain",
    category: "YELLOW" as DemoCategory,
    name: "Karthik Example",
    age: "58",
    complaint: "Persistent upper abdominal pain and dizziness since morning.",
    duration: "5 hours",
    pain: 7,
    worsening: true,
    warningSigns: [] as string[],
    history: "Type 2 diabetes, hypertension",
  },
  {
    id: "red",
    label: "Emergency · Critical Warning",
    category: "RED" as DemoCategory,
    name: "Meera Example",
    age: "66",
    complaint: "Sudden shortness of breath and chest heaviness at rest.",
    duration: "25 minutes",
    pain: 9,
    worsening: true,
    warningSigns: ["Severe breathing difficulty"],
    history: "Asthma",
  },
] as const;

function nowLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function PatientDemoPortal() {
  const [language, setLanguage] = useState<Language>("en");
  const [largeText, setLargeText] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("Asha Example");
  const [age, setAge] = useState("42");
  const [complaint, setComplaint] = useState(
    "Mild ankle twist while walking; able to speak comfortably.",
  );
  const [selectedChips, setSelectedChips] = useState<string[]>([
    "Sprained ankle / minor fall",
  ]);
  const [warningSigns, setWarningSigns] = useState<string[]>([]);
  const [duration, setDuration] = useState("2 hours");
  const [pain, setPain] = useState<number>(3);
  const [worsening, setWorsening] = useState<boolean>(false);
  const [history, setHistory] = useState("No chronic conditions reported");
  const [allergies, setAllergies] = useState("None known");
  const [medications, setMedications] = useState("None");
  const [consent, setConsent] = useState(true);

  const [submittedCategory, setSubmittedCategory] =
    useState<DemoCategory | null>(null);
  const [stage, setStage] = useState<
    | "Drafting"
    | "Submitted · Triage Pending"
    | "Nurse Reviewed"
    | "Emergency Override"
  >("Drafting");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      id: 1,
      time: "09:00:00",
      actor: "Portal",
      title: "Synthetic intake session started",
      detail:
        "Isolated patient simulation active. No live hospital alerts are dispatched.",
    },
  ]);
  const [qrUrl, setQrUrl] = useState("");
  const [voiceNote, setVoiceNote] = useState("");

  const t = translations[language];
  const passReference = `DEMO-PASS-${
    name
      .slice(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "M") || "MED"
  }-042`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(`MEDCIPHER-SYNTHETIC-DEMO://${passReference}`, {
      width: 176,
      margin: 2,
      color: { dark: "#651D38", light: "#FFFFFF" },
    })
      .then((url) => {
        if (active) setQrUrl(url);
      })
      .catch(() => {
        if (active) setQrUrl("");
      });
    return () => {
      active = false;
    };
  }, [passReference]);

  function addEvent(actor: string, title: string, detail: string) {
    setTimeline((prev) => [
      { id: prev.length + 1, time: nowLabel(), actor, title, detail },
      ...prev,
    ]);
  }

  function applyPreset(presetId: string) {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setName(preset.name);
    setAge(preset.age);
    setComplaint(preset.complaint);
    setDuration(preset.duration);
    setPain(preset.pain);
    setWorsening(preset.worsening);
    setWarningSigns([...preset.warningSigns]);
    setHistory(preset.history);
    setSubmittedCategory(null);
    setStage("Drafting");
    setStep(1);
    addEvent(
      "Preset",
      `Loaded scenario: ${preset.label}`,
      "Form fields pre-populated for demonstration.",
    );
  }

  function toggleChip(chip: string) {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((x) => x !== chip) : [...prev, chip],
    );
    if (!complaint.toLowerCase().includes(chip.toLowerCase())) {
      setComplaint((prev) => (prev ? `${prev.trim()}; ${chip}` : chip));
    }
  }

  function toggleWarning(sign: string) {
    setWarningSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign],
    );
  }

  function dictate() {
    setVoiceNote("");
    const Speech =
      (window as unknown as { SpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;
    if (!Speech) {
      setVoiceNote(t.voiceUnavailable);
      return;
    }
    const rec = new Speech() as {
      lang: string;
      onresult: (e: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void;
      onerror: () => void;
      start: () => void;
    };
    rec.lang =
      language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    rec.onresult = (e) => {
      const spoken = e.results?.[0]?.[0]?.transcript;
      if (spoken) setComplaint((prev) => (prev ? `${prev} ${spoken}` : spoken));
    };
    rec.onerror = () => setVoiceNote(t.voiceUnavailable);
    rec.start();
  }

  function computeSimulatedCategory(): DemoCategory {
    if (warningSigns.length > 0 || pain >= 9) return "RED";
    if (worsening || pain >= 6) return "YELLOW";
    return "GREEN";
  }

  function submitIntake() {
    if (!consent || !complaint.trim()) return;
    const category = computeSimulatedCategory();
    setSubmittedCategory(category);
    setStage(
      category === "RED" ? "Emergency Override" : "Submitted · Triage Pending",
    );
    setStep(4);
    addEvent(
      "Patient",
      `Intake submitted · Simulated ${category}`,
      `Symptoms: ${complaint}. Reported pain ${pain}/10.${warningSigns.length ? ` Emergency flags: ${warningSigns.join(", ")}.` : ""}`,
    );
  }

  function simulateEmergencyTrigger() {
    setWarningSigns((prev) =>
      prev.includes("Severe breathing difficulty")
        ? prev
        : [...prev, "Severe breathing difficulty"],
    );
    setSubmittedCategory("RED");
    setStage("Emergency Override");
    setStep(4);
    addEvent(
      "Emergency trigger",
      "Immediate assistance activated (simulated RED)",
      "Queued at top priority. In a real hospital, alert nearby staff directly.",
    );
  }

  function simulateReassessment(worsened: boolean) {
    if (worsened) {
      setWorsening(true);
      setPain((p) => Math.min(10, Math.max(p + 2, 8)));
      const nextCat: DemoCategory =
        submittedCategory === "YELLOW" ? "RED" : "YELLOW";
      setSubmittedCategory(nextCat);
      addEvent(
        "Reassessment",
        `Patient reported worsening symptoms -> ${nextCat}`,
        "Dynamic queue position elevated and triage nurse notified in timeline.",
      );
    } else {
      setStage("Nurse Reviewed");
      addEvent(
        "Triage nurse",
        "Vitals & human verification completed",
        "Handover ready for duty doctor assessment in Bay 03.",
      );
    }
  }

  function resetDemo() {
    applyPreset("green");
    setTimeline([
      {
        id: 1,
        time: nowLabel(),
        actor: "Portal",
        title: "Simulation reset",
        detail: "Ready for a fresh patient intake walkthrough.",
      },
    ]);
  }

  return (
    <>
      <PublicHeader />
      <main
        className={`public-page demo-portal-page ${largeText ? "large-text" : ""}`}
      >
        <div className="patient-demo-banner">
          <div>
            <span className="story-badge">
              <Sparkles size={14} aria-hidden="true" />
              Interactive Patient Intake Simulator
            </span>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <div className="portal-utility-bar">
            <label className="utility-select">
              <Languages size={15} aria-hidden="true" />
              <span className="sr-only">{t.language}</span>
              <select
                aria-label={t.language}
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>
            <button
              type="button"
              className={`button small ${largeText ? "primary" : ""}`}
              aria-pressed={largeText}
              onClick={() => setLargeText((v) => !v)}
            >
              {t.large}
            </button>
            <button type="button" className="button small" onClick={resetDemo}>
              <RotateCcw size={14} /> Reset
            </button>
            <Link href="/login" className="button small">
              <ArrowLeft size={14} /> Back to portals
            </Link>
          </div>
        </div>

        <div className="patient-emergency">
          <div className="patient-emergency-copy">
            <strong>
              <ShieldAlert size={18} aria-hidden="true" />
              {t.emergency}
            </strong>
            <p>
              Do not wait for a questionnaire in an emergency. Call or alert the
              nearest desk or staff member immediately.
            </p>
          </div>
          <div className="button-row">
            <button
              type="button"
              className="button emergency-button"
              onClick={simulateEmergencyTrigger}
            >
              <AlertTriangle size={16} />
              Simulate emergency alert (RED)
            </button>
            <Link className="button" href="/emergency">
              Real emergency guidance
            </Link>
          </div>
        </div>

        <div
          className="scenario-strip"
          role="group"
          aria-label="Demo scenario presets"
        >
          <span>Quick scenario presets:</span>
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="scenario-pill"
              onClick={() => applyPreset(preset.id)}
            >
              <span className={`dot dot-${preset.category.toLowerCase()}`} />
              {preset.label}
            </button>
          ))}
        </div>

        <div className="demo-portal-grid">
          <section className="panel demo-intake-card">
            <div className="stepper" role="tablist" aria-label="Intake steps">
              {[
                { id: 1 as const, label: "1. Identity & signs" },
                { id: 2 as const, label: "2. Symptoms & severity" },
                { id: 3 as const, label: "3. Medical history" },
                { id: 4 as const, label: "4. Live pass & status" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={step === s.id}
                  className={step === s.id ? "step-tab active" : "step-tab"}
                  onClick={() => {
                    if (s.id === 4 && !submittedCategory) return;
                    setStep(s.id);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {step === 1 && (
              <div className="intake-step-body" key="step-1">
                <div className="step-title-row">
                  <PatientIntakeIcon size={22} />
                  <div>
                    <h2>Patient identity &amp; red-flag screen</h2>
                    <p>
                      Check any severe emergency signs first before answering
                      non-urgent questions.
                    </p>
                  </div>
                </div>

                <div className="form-grid-2">
                  <label className="field">
                    <span>Full name (synthetic demo)</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Age (years)</span>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </label>
                </div>

                <div className="warning-check-box">
                  <strong>{t.warning}</strong>
                  <div className="chip-grid">
                    {emergencySigns.map((sign) => {
                      const active = warningSigns.includes(sign);
                      return (
                        <button
                          key={sign}
                          type="button"
                          aria-pressed={active}
                          className={`symptom-chip danger ${active ? "selected" : ""}`}
                          onClick={() => toggleWarning(sign)}
                        >
                          {sign}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="step-actions">
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setStep(2)}
                  >
                    Continue to symptoms
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="intake-step-body" key="step-2">
                <div className="step-title-row">
                  <VitalsMonitorIcon size={22} />
                  <div>
                    <h2>{t.symptoms}</h2>
                    <p>
                      Select common complaints, type details, or dictate by
                      voice.
                    </p>
                  </div>
                </div>

                <div
                  className="chip-grid"
                  role="group"
                  aria-label="Common symptoms"
                >
                  {QUICK_SYMPTOMS.map((chip) => {
                    const active = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        aria-pressed={active}
                        className={`symptom-chip ${active ? "selected" : ""}`}
                        onClick={() => toggleChip(chip)}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                <label className="field">
                  <div className="field-inline-head">
                    <span>Symptom description</span>
                    <button
                      type="button"
                      className="button small"
                      onClick={dictate}
                    >
                      <Volume2 size={14} /> {t.voice}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    required
                  />
                </label>
                {voiceNote && <p className="form-note">{voiceNote}</p>}

                <div className="form-grid-2">
                  <label className="field">
                    <span>{t.duration}</span>
                    <input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Pain score: {pain} / 10</span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={pain}
                      onChange={(e) => setPain(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="field">
                  <span>{t.progression}</span>
                  <div className="button-row">
                    <button
                      type="button"
                      className={`button small ${!worsening ? "primary" : ""}`}
                      onClick={() => setWorsening(false)}
                    >
                      {t.same}
                    </button>
                    <button
                      type="button"
                      className={`button small ${worsening ? "primary" : ""}`}
                      onClick={() => setWorsening(true)}
                    >
                      {t.worse}
                    </button>
                  </div>
                </div>

                <div className="step-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setStep(3)}
                  >
                    Continue to medical history
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="intake-step-body" key="step-3">
                <div className="step-title-row">
                  <StethoscopeCrossIcon size={22} />
                  <div>
                    <h2>Medical context &amp; consent</h2>
                    <p>{t.review}</p>
                  </div>
                </div>

                <label className="field">
                  <span>{t.history}</span>
                  <input
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                  />
                </label>
                <div className="form-grid-2">
                  <label className="field">
                    <span>{t.allergies}</span>
                    <input
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{t.medications}</span>
                    <input
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                    />
                  </label>
                </div>

                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{t.consent}</span>
                </label>

                <div className="step-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    disabled={!consent || !complaint.trim()}
                    onClick={submitIntake}
                  >
                    {t.submit}
                    <CheckCircle2 size={15} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && submittedCategory && (
              <div className="intake-step-body" key="step-4">
                <div
                  className="result-callout"
                  data-cat={submittedCategory.toLowerCase()}
                >
                  <div className="result-badge-row">
                    <AcuityShieldIcon size={24} />
                    <div>
                      <span className="hero-kicker">
                        Simulated intake priority · Unvalidated demo
                      </span>
                      <h2>
                        {submittedCategory === "RED"
                          ? "RED · Immediate Emergency Priority"
                          : submittedCategory === "YELLOW"
                            ? "YELLOW · Urgent Triage Assessment"
                            : "GREEN · General Waiting Queue"}
                      </h2>
                    </div>
                  </div>
                  <p>
                    {t.saved}. {t.instruction}
                  </p>
                  <div className="result-stage-pill">
                    Current state: <strong>{stage}</strong>
                  </div>
                </div>

                <div className="reassessment-sim-box">
                  <h3>Test dynamic care-team interactions</h3>
                  <p>
                    Simulate what happens while waiting when a patient feels
                    worse or a triage nurse completes vitals check-in.
                  </p>
                  <div className="button-row">
                    <button
                      type="button"
                      className="button small"
                      onClick={() => simulateReassessment(false)}
                    >
                      Simulate nurse vitals verification
                    </button>
                    <button
                      type="button"
                      className="button small"
                      onClick={() => simulateReassessment(true)}
                    >
                      Report worsening symptoms
                    </button>
                    <button
                      type="button"
                      className="button small"
                      onClick={() => setStep(2)}
                    >
                      Edit intake details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="demo-portal-rail">
            <section className="panel qr-pass-card">
              <div className="section-title">
                <h2>
                  <QrCode size={17} aria-hidden="true" /> Illustrative QR Pass
                </h2>
                <span className="mono">{passReference}</span>
              </div>
              <div className="qr-frame">
                {qrUrl ? (
                  <Image
                    src={qrUrl}
                    alt="Illustrative synthetic patient QR visit pass"
                    width={176}
                    height={176}
                    unoptimized
                  />
                ) : (
                  <div className="qr-placeholder">Generating pass…</div>
                )}
              </div>
              <p className="muted">
                Demonstration QR only — never grants access to real hospital
                records.
              </p>
              <Link className="button small" href="/patient/start">
                Real hospital QR instructions
              </Link>
            </section>

            <section className="panel timeline-sim-card">
              <div className="section-title">
                <h2>Live Care-Team Timeline</h2>
                <span>{timeline.length} events</span>
              </div>
              <div className="sim-timeline-list">
                {timeline.map((item) => (
                  <div className="sim-timeline-item" key={item.id}>
                    <div className="sim-timeline-meta">
                      <span className="mono">{item.time}</span>
                      <strong>{item.actor}</strong>
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <footer className="public-footer">
        MedCipher · Synthetic Patient Portal Demonstration
      </footer>
    </>
  );
}
