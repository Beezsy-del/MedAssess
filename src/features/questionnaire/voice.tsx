"use client";
import { useEffect, useRef, useState } from "react";
import { usePatientCopy, type PatientLanguageCode } from "./language";
type Speech = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
export function Dictation({
  language,
  onText,
}: {
  language: PatientLanguageCode;
  onText: (value: string) => void;
}) {
  const t = usePatientCopy();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const current = useRef<Speech | null>(null);
  useEffect(
    () => () => {
      current.current?.stop();
    },
    [],
  );
  function toggle() {
    if (listening) {
      current.current?.stop();
      return;
    }
    const api = window as unknown as {
      SpeechRecognition?: new () => Speech;
      webkitSpeechRecognition?: new () => Speech;
    };
    const Constructor = api.SpeechRecognition ?? api.webkitSpeechRecognition;
    if (!Constructor) {
      setError(
        language === "kn"
          ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ. ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಸಿಬ್ಬಂದಿಯ ಸಹಾಯ ಕೇಳಿ."
          : language === "hi"
            ? "इस ब्राउज़र में आवाज़ से लिखना उपलब्ध नहीं है। टाइप करें या कर्मचारियों से मदद लें।"
            : "Voice input is unavailable. Type or ask staff for help.",
      );
      return;
    }
    const recognition = new Constructor();
    recognition.lang = { en: "en-IN", kn: "kn-IN", hi: "hi-IN" }[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      onText(event.results[0][0].transcript);
    };
    recognition.onerror = () => {
      setError(
        language === "kn"
          ? "ಧ್ವನಿ ದಾಖಲಿಸಲಾಗಲಿಲ್ಲ. ಟೈಪ್ ಮಾಡಿ."
          : language === "hi"
            ? "आवाज़ दर्ज नहीं हुई। कृपया टाइप करें।"
            : "Dictation failed. Please type your answer.",
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    current.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setError("");
    } catch {
      setError("Microphone unavailable. Please type your answer.");
    }
  }
  return (
    <div>
      <button type="button" className="button" onClick={toggle}>
        {t(listening ? "Stop dictation" : "Dictate main concern")}
      </button>
      <p>
        {language === "kn"
          ? "ಐಚ್ಛಿಕ: ಬ್ರೌಸರ್ ಧ್ವನಿಯನ್ನು ತನ್ನ ಸೇವೆಯ ಮೂಲಕ ಸಂಸ್ಕರಿಸಬಹುದು. ಕಳುಹಿಸುವ ಮೊದಲು ಪಠ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ."
          : language === "hi"
            ? "वैकल्पिक: ब्राउज़र अपनी सेवा से आवाज़ संसाधित कर सकता है। भेजने से पहले पाठ जाँचें।"
            : "Optional: your browser may process speech through its provider. Review the text before sending."}
      </p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
