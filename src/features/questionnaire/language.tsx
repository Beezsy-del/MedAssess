"use client";
import { createContext, useContext } from "react";
export type PatientLanguageCode = "en" | "kn" | "hi";
export const PatientLanguage = createContext<PatientLanguageCode>("en");
// Prototype wording: qualified clinical and native-language review is required before use in care.
export const patientCopy: Record<string, [string, string]> = {
  "Preliminary priority:": ["ಪ್ರಾಥಮಿಕ ಆದ್ಯತೆ:", "प्रारंभिक प्राथमिकता:"],
  ". Human review required.": [
    ". ಸಿಬ್ಬಂದಿಯ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.",
    ". कर्मचारी की समीक्षा आवश्यक है।",
  ],
  "Latest clinician decision:": [
    "ವೈದ್ಯರ ಇತ್ತೀಚಿನ ನಿರ್ಧಾರ:",
    "चिकित्सक का नवीनतम निर्णय:",
  ],
  "Department:": ["ವಿಭಾಗ:", "विभाग:"],
  "Remove medicine": ["ಔಷಧಿ ತೆಗೆದುಹಾಕಿ", "दवा हटाएँ"],
  "Remove allergy": ["ಅಲರ್ಜಿ ತೆಗೆದುಹಾಕಿ", "एलर्जी हटाएँ"],
  "About you": ["ನಿಮ್ಮ ಬಗ್ಗೆ", "आपके बारे में"],
  "Your symptoms": ["ನಿಮ್ಮ ಲಕ್ಷಣಗಳು", "आपके लक्षण"],
  "Symptom details": ["ಲಕ್ಷಣಗಳ ವಿವರಗಳು", "लक्षणों का विवरण"],
  "Medical history": ["ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ", "चिकित्सा इतिहास"],
  Medicines: ["ಔಷಧಿಗಳು", "दवाएँ"],
  Allergies: ["ಅಲರ್ಜಿಗಳು", "एलर्जी"],
  "Additional information": ["ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ", "अतिरिक्त जानकारी"],
  "Review & send": ["ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿ", "समीक्षा करें और भेजें"],
  unknown: ["ತಿಳಿದಿಲ್ಲ", "पता नहीं"],
  yes: ["ಹೌದು", "हाँ"],
  no: ["ಇಲ್ಲ", "नहीं"],
  recorded: ["ವಿವರಗಳಿವೆ", "विवरण उपलब्ध है"],
  "none reported": ["ಯಾವುದೂ ತಿಳಿಸಿಲ್ಲ", "कोई नहीं बताया"],
  self: ["ಸ್ವತಃ", "स्वयं"],
  guardian: ["ಪೋಷಕರು / ಪಾಲಕರು", "अभिभावक"],
  assisted: ["ಸಹಾಯದೊಂದಿಗೆ", "सहायता से"],
  improving: ["ಸುಧಾರಿಸುತ್ತಿದೆ", "सुधार हो रहा है"],
  same: ["ಹಾಗೆಯೇ ಇದೆ", "वैसा ही है"],
  worsening: ["ಹದಗೆಡುತ್ತಿದೆ", "बिगड़ रहा है"],
  Name: ["ಹೆಸರು", "नाम"],
  "Age, if known": ["ವಯಸ್ಸು, ತಿಳಿದಿದ್ದರೆ", "उम्र, यदि ज्ञात हो"],
  "Or date of birth": ["ಅಥವಾ ಜನ್ಮ ದಿನಾಂಕ", "या जन्म तिथि"],
  sex: ["ಲಿಂಗ", "लिंग"],
  phone: ["ದೂರವಾಣಿ", "फ़ोन"],
  "emergency contact": ["ತುರ್ತು ಸಂಪರ್ಕ", "आपातकालीन संपर्क"],
  "patient identifier": ["ರೋಗಿಯ ಗುರುತು ಸಂಖ್ಯೆ", "रोगी पहचान संख्या"],
  "Who is completing this report?": [
    "ಈ ವರದಿಯನ್ನು ಯಾರು ತುಂಬುತ್ತಿದ್ದಾರೆ?",
    "यह रिपोर्ट कौन भर रहा है?",
  ],
  "Helper name": ["ಸಹಾಯ ಮಾಡುವವರ ಹೆಸರು", "सहायता करने वाले का नाम"],
  Relationship: ["ಸಂಬಂಧ", "संबंध"],
  "What is your main concern?": [
    "ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಏನು?",
    "आपकी मुख्य स्वास्थ्य समस्या क्या है?",
  ],
  "When did it start?": ["ಇದು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?", "यह कब शुरू हुआ?"],
  "How has it changed?": ["ಇದು ಹೇಗೆ ಬದಲಾಗಿದೆ?", "इसमें क्या बदलाव आया है?"],
  "Location of discomfort": [
    "ನೋವು ಅಥವಾ ತೊಂದರೆ ಇರುವ ಸ್ಥಳ",
    "दर्द या परेशानी का स्थान",
  ],
  "Pain from 0 to 10, if known": [
    "ನೋವಿನ ತೀವ್ರತೆ 0 ರಿಂದ 10, ತಿಳಿದಿದ್ದರೆ",
    "दर्द की तीव्रता 0 से 10, यदि ज्ञात हो",
  ],
  "Does it spread elsewhere?": [
    "ಇದು ಬೇರೆ ಭಾಗಕ್ಕೆ ಹರಡುತ್ತದೆಯೇ?",
    "क्या यह दूसरी जगह फैलता है?",
  ],
  "Where does it spread?": ["ಎಲ್ಲಿಗೆ ಹರಡುತ್ತದೆ?", "कहाँ फैलता है?"],
  "chest discomfort": ["ಎದೆಯಲ್ಲಿ ಅಸ್ವಸ್ಥತೆ", "सीने में परेशानी"],
  "breathing difficulty": ["ಉಸಿರಾಟದ ತೊಂದರೆ", "साँस लेने में कठिनाई"],
  fever: ["ಜ್ವರ", "बुखार"],
  bleeding: ["ರಕ್ತಸ್ರಾವ", "रक्तस्राव"],
  injury: ["ಗಾಯ", "चोट"],
  dizziness: ["ತಲೆಸುತ್ತು", "चक्कर"],
  vomiting: ["ವಾಂತಿ", "उल्टी"],
  diarrhoea: ["ಅತಿಸಾರ", "दस्त"],
  fainting: ["ಮೂರ್ಛೆ", "बेहोशी"],
  weakness: ["ದೌರ್ಬಲ್ಯ", "कमज़ोरी"],
  seizure: ["ಸೆಳೆತ", "दौरा"],
  "speech vision movement": [
    "ಮಾತು, ದೃಷ್ಟಿ ಅಥವಾ ಚಲನೆಯಲ್ಲಿ ಬದಲಾವಣೆ",
    "बोलने, देखने या हिलने में बदलाव",
  ],
  pain: ["ನೋವು", "दर्द"],
  other: ["ಇತರೆ", "अन्य"],
  "Is the chest discomfort happening now?": [
    "ಈಗ ಎದೆಯಲ್ಲಿ ಅಸ್ವಸ್ಥತೆ ಇದೆಯೇ?",
    "क्या अभी सीने में परेशानी है?",
  ],
  "Are you also having difficulty breathing?": [
    "ಉಸಿರಾಡಲು ಸಹ ತೊಂದರೆ ಇದೆಯೇ?",
    "क्या साँस लेने में भी कठिनाई है?",
  ],
  "Have you felt faint or unusually sweaty?": [
    "ಮೂರ್ಛೆ ಬರುವಂತೆ ಅಥವಾ ಅಸಾಮಾನ್ಯ ಬೆವರು ಅನಿಸಿದೆಯೇ?",
    "क्या बेहोशी जैसा लगा या असामान्य पसीना आया?",
  ],
  "Does the discomfort spread elsewhere?": [
    "ಅಸ್ವಸ್ಥತೆ ಬೇರೆ ಭಾಗಕ್ಕೆ ಹರಡುತ್ತದೆಯೇ?",
    "क्या परेशानी दूसरी जगह फैलती है?",
  ],
  "How long have you had a fever?": [
    "ಎಷ್ಟು ಸಮಯದಿಂದ ಜ್ವರವಿದೆ?",
    "कितने समय से बुखार है?",
  ],
  "Does the fever come and go?": [
    "ಜ್ವರ ಬಂದು ಹೋಗುತ್ತದೆಯೇ?",
    "क्या बुखार आता-जाता है?",
  ],
  "Have you had chills?": ["ಚಳಿ ನಡುಕ ಉಂಟಾಗಿದೆಯೇ?", "क्या ठंड लगकर कंपकंपी हुई?"],
  "What other symptoms have you noticed?": [
    "ಇನ್ನೇನು ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಿ?",
    "आपने और क्या लक्षण देखे हैं?",
  ],
  "Where is the bleeding?": ["ರಕ್ತಸ್ರಾವ ಎಲ್ಲಿದೆ?", "रक्तस्राव कहाँ हो रहा है?"],
  "Is the bleeding continuing now?": [
    "ಈಗಲೂ ರಕ್ತಸ್ರಾವವಾಗುತ್ತಿದೆಯೇ?",
    "क्या अभी रक्तस्राव जारी है?",
  ],
  "Have you been unable to stop the bleeding?": [
    "ರಕ್ತಸ್ರಾವವನ್ನು ನಿಲ್ಲಿಸಲು ಆಗಲಿಲ್ಲವೇ?",
    "क्या आप रक्तस्राव रोक नहीं पाए?",
  ],
  "Did an injury cause the bleeding?": [
    "ಗಾಯದಿಂದ ರಕ್ತಸ್ರಾವವಾಯಿತೇ?",
    "क्या चोट से रक्तस्राव हुआ?",
  ],
  "Are you having difficulty breathing now?": [
    "ಈಗ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆಯೇ?",
    "क्या अभी साँस लेने में कठिनाई है?",
  ],
  "Is the breathing difficulty getting worse?": [
    "ಉಸಿರಾಟದ ತೊಂದರೆ ಹೆಚ್ಚುತ್ತಿದೆಯೇ?",
    "क्या साँस की कठिनाई बढ़ रही है?",
  ],
  "Does breathing difficulty make it hard to speak?": [
    "ಉಸಿರಾಟದ ತೊಂದರೆಯಿಂದ ಮಾತನಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆಯೇ?",
    "क्या साँस की कठिनाई से बोलना मुश्किल है?",
  ],
  "Do you need immediate help with your breathing?": [
    "ಉಸಿರಾಟಕ್ಕೆ ತಕ್ಷಣ ಸಹಾಯ ಬೇಕೇ?",
    "क्या साँस लेने के लिए तुरंत मदद चाहिए?",
  ],
  "What caused the injury?": ["ಗಾಯ ಹೇಗೆ ಆಯಿತು?", "चोट कैसे लगी?"],
  "When did the injury happen?": ["ಗಾಯ ಯಾವಾಗ ಆಯಿತು?", "चोट कब लगी?"],
  "Which part of your body was injured?": [
    "ದೇಹದ ಯಾವ ಭಾಗಕ್ಕೆ ಗಾಯವಾಗಿದೆ?",
    "शरीर के किस हिस्से में चोट लगी?",
  ],
  "Is there bleeding?": ["ರಕ್ತಸ್ರಾವ ಇದೆಯೇ?", "क्या रक्तस्राव है?"],
  "Did you lose consciousness after the injury?": [
    "ಗಾಯದ ನಂತರ ಪ್ರಜ್ಞೆ ತಪ್ಪಿತೇ?",
    "क्या चोट के बाद होश खोया था?",
  ],
  "Known medical conditions": ["ತಿಳಿದಿರುವ ಕಾಯಿಲೆಗಳು", "ज्ञात बीमारियाँ"],
  diabetes: ["ಮಧುಮೇಹ", "मधुमेह"],
  hypertension: ["ಅಧಿಕ ರಕ್ತದೊತ್ತಡ", "उच्च रक्तचाप"],
  "heart disease": ["ಹೃದಯ ಕಾಯಿಲೆ", "हृदय रोग"],
  "respiratory condition": ["ಉಸಿರಾಟದ ಕಾಯಿಲೆ", "श्वसन रोग"],
  "kidney disease": ["ಮೂತ್ರಪಿಂಡ ಕಾಯಿಲೆ", "गुर्दे की बीमारी"],
  "neurological condition": ["ನರಸಂಬಂಧಿ ಕಾಯಿಲೆ", "तंत्रिका संबंधी बीमारी"],
  "Condition details": ["ಕಾಯಿಲೆಯ ವಿವರಗಳು", "बीमारी का विवरण"],
  surgery: ["ಹಿಂದೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಆಗಿದೆಯೇ?", "क्या पहले शल्य चिकित्सा हुई है?"],
  "similar before": ["ಹಿಂದೆ ಇದೇ ತೊಂದರೆ ಆಗಿದೆಯೇ?", "क्या पहले ऐसी परेशानी हुई है?"],
  hospitalised: ["ಹಿಂದೆ ಆಸ್ಪತ್ರೆಗೆ ದಾಖಲಾಗಿದ್ದೀರಾ?", "क्या पहले अस्पताल में भर्ती हुए हैं?"],
  "current treatment": ["ಈಗ ಚಿಕಿತ್ಸೆ ಪಡೆಯುತ್ತಿದ್ದೀರಾ?", "क्या अभी उपचार चल रहा है?"],
  "Surgery details": ["ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ವಿವರಗಳು", "शल्य चिकित्सा का विवरण"],
  "Current treatment details": ["ಈಗಿನ ಚಿಕಿತ್ಸೆಯ ವಿವರಗಳು", "वर्तमान उपचार का विवरण"],
  "Medicines you take": ["ನೀವು ತೆಗೆದುಕೊಳ್ಳುವ ಔಷಧಿಗಳು", "आप जो दवाएँ लेते हैं"],
  name: ["ಹೆಸರು", "नाम"],
  dose: ["ಪ್ರಮಾಣ", "खुराक"],
  frequency: ["ಎಷ್ಟು ಬಾರಿ", "कितनी बार"],
  details: ["ವಿವರಗಳು", "विवरण"],
  "Add medicine": ["ಔಷಧಿ ಸೇರಿಸಿ", "दवा जोड़ें"],
  "Any recent medication changes?": [
    "ಇತ್ತೀಚೆಗೆ ಔಷಧಿ ಬದಲಾವಣೆ ಆಗಿದೆಯೇ?",
    "क्या हाल में दवा बदली है?",
  ],
  "Any missed doses?": ["ಔಷಧಿಯ ಪ್ರಮಾಣ ತಪ್ಪಿಹೋಗಿದೆಯೇ?", "क्या कोई खुराक छूट गई?"],
  "Medicine taken for these symptoms": [
    "ಈ ಲಕ್ಷಣಗಳಿಗೆ ತೆಗೆದುಕೊಂಡ ಔಷಧಿ",
    "इन लक्षणों के लिए ली गई दवा",
  ],
  "Known allergies": ["ತಿಳಿದಿರುವ ಅಲರ್ಜಿಗಳು", "ज्ञात एलर्जी"],
  Substance: ["ವಸ್ತು / ಔಷಧಿ", "पदार्थ / दवा"],
  Reaction: ["ಪ್ರತಿಕ್ರಿಯೆ", "प्रतिक्रिया"],
  "Add allergy": ["ಅಲರ್ಜಿ ಸೇರಿಸಿ", "एलर्जी जोड़ें"],
  "Pregnancy, if relevant": ["ಗರ್ಭಧಾರಣೆ, ಅನ್ವಯಿಸಿದರೆ", "गर्भावस्था, यदि प्रासंगिक हो"],
  "Pregnancy details": ["ಗರ್ಭಧಾರಣೆಯ ವಿವರಗಳು", "गर्भावस्था का विवरण"],
  "Accessibility or communication assistance": [
    "ಪ್ರವೇಶ ಅಥವಾ ಸಂವಹನಕ್ಕೆ ಬೇಕಾದ ಸಹಾಯ",
    "पहुँच या संवाद के लिए सहायता",
  ],
  "Anything else your care team should know?": [
    "ನಿಮ್ಮ ಆರೈಕೆ ತಂಡಕ್ಕೆ ಇನ್ನೇನು ತಿಳಿಸಬೇಕು?",
    "आपकी देखभाल टीम को और क्या जानना चाहिए?",
  ],
  pulse: ["ನಾಡಿ / ನಿಮಿಷ", "नाड़ी / मिनट"],
  spo2: ["ಆಮ್ಲಜನಕ ಶೇಕಡಾ", "ऑक्सीजन प्रतिशत"],
  "respiratory rate": ["ಉಸಿರಾಟ / ನಿಮಿಷ", "श्वास / मिनट"],
  systolic: ["ಸಿಸ್ಟಾಲಿಕ್ ರಕ್ತದೊತ್ತಡ", "सिस्टोलिक रक्तचाप"],
  temperature: ["ತಾಪಮಾನ °C", "तापमान °C"],
  Back: ["ಹಿಂದೆ", "वापस"],
  "Save draft": ["ಕರಡು ಉಳಿಸಿ", "मसौदा सहेजें"],
  "Save & continue": ["ಉಳಿಸಿ ಮತ್ತು ಮುಂದುವರಿಸಿ", "सहेजें और जारी रखें"],
  "Send to care team": ["ಆರೈಕೆ ತಂಡಕ್ಕೆ ಕಳುಹಿಸಿ", "देखभाल टीम को भेजें"],
  "Sending…": ["ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…", "भेजा जा रहा है…"],
  "Open your patient pass": ["ನಿಮ್ಮ ರೋಗಿ ಪಾಸ್ ತೆರೆಯಿರಿ", "अपना रोगी पास खोलें"],
  "Private access token": ["ಖಾಸಗಿ ಪ್ರವೇಶ ಟೋಕನ್", "निजी पहुँच टोकन"],
  "Open encounter": ["ಈ ಭೇಟಿಯನ್ನು ತೆರೆಯಿರಿ", "यह मुलाकात खोलें"],
  "Close private session": ["ಖಾಸಗಿ ಅಧಿವೇಶನ ಮುಚ್ಚಿ", "निजी सत्र बंद करें"],
  "Report a symptom change": ["ಲಕ್ಷಣದ ಬದಲಾವಣೆ ತಿಳಿಸಿ", "लक्षण में बदलाव बताएँ"],
  "Get emergency help directly": [
    "ತುರ್ತು ಸಹಾಯವನ್ನು ನೇರವಾಗಿ ಪಡೆಯಿರಿ",
    "सीधे आपातकालीन मदद लें",
  ],
  "Notify staff: I need immediate help": [
    "ಸಿಬ್ಬಂದಿಗೆ ತಿಳಿಸಿ: ನನಗೆ ತಕ್ಷಣ ಸಹಾಯ ಬೇಕು",
    "कर्मचारियों को सूचित करें: मुझे तुरंत मदद चाहिए",
  ],
  "Synthetic demonstration only": [
    "ಕೃತಕ ಮಾಹಿತಿಯ ಪ್ರದರ್ಶನ ಮಾತ್ರ",
    "केवल कृत्रिम डेटा का प्रदर्शन",
  ],
  "This questionnaire is not a diagnosis. Emergency care must never wait for registration or this form.":
    [
      "ಈ ಪ್ರಶ್ನಾವಳಿ ರೋಗನಿರ್ಣಯವಲ್ಲ. ತುರ್ತು ಆರೈಕೆಗಾಗಿ ನೋಂದಣಿ ಅಥವಾ ಈ ಫಾರ್ಮ್ ಪೂರ್ಣಗೊಳ್ಳುವವರೆಗೆ ಕಾಯಬೇಡಿ.",
      "यह प्रश्नावली निदान नहीं है। आपातकालीन देखभाल के लिए पंजीकरण या इस फ़ॉर्म का इंतज़ार न करें।",
    ],
  "Leave unknown information as unknown. Use synthetic details only.": [
    "ತಿಳಿಯದ ಮಾಹಿತಿಯನ್ನು ತಿಳಿದಿಲ್ಲ ಎಂದೇ ಬಿಡಿ. ಕೃತಕ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.",
    "अज्ञात जानकारी को अज्ञात ही रखें। केवल कृत्रिम विवरण उपयोग करें।",
  ],
  "I have reviewed the symptom list.": [
    "ನಾನು ಲಕ್ಷಣಗಳ ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ.",
    "मैंने लक्षणों की सूची की समीक्षा की है।",
  ],
  "I reviewed my answers and consent to sharing this report with the care team.":
    [
      "ನಾನು ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ ಮತ್ತು ಆರೈಕೆ ತಂಡದೊಂದಿಗೆ ಈ ವರದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಒಪ್ಪುತ್ತೇನೆ.",
      "मैंने अपने उत्तरों की समीक्षा की है और यह रिपोर्ट देखभाल टीम से साझा करने की सहमति देता/देती हूँ।",
    ],
  "Main concern": ["ಮುಖ್ಯ ಸಮಸ್ಯೆ", "मुख्य समस्या"],
  Symptoms: ["ಲಕ್ಷಣಗಳು", "लक्षण"],
  Progression: ["ಬದಲಾವಣೆ", "बदलाव"],
  Unknown: ["ತಿಳಿದಿಲ್ಲ", "पता नहीं"],
  "This encounter is closed": ["ಈ ಭೇಟಿ ಮುಕ್ತಾಯವಾಗಿದೆ", "यह मुलाकात समाप्त है"],
  "Your care team’s updates": ["ನಿಮ್ಮ ಆರೈಕೆ ತಂಡದ ಮಾಹಿತಿ", "आपकी देखभाल टीम के अपडेट"],
  "Ask staff for a new encounter if you need further care.": [
    "ಹೆಚ್ಚಿನ ಆರೈಕೆ ಬೇಕಿದ್ದರೆ ಹೊಸ ಭೇಟಿಗಾಗಿ ಸಿಬ್ಬಂದಿಯನ್ನು ಕೇಳಿ.",
    "आगे देखभाल चाहिए तो नई मुलाकात के लिए कर्मचारियों से कहें।",
  ],
  "No additional questions for the selected symptoms. You can add details in the final section.":
    [
      "ಆಯ್ದ ಲಕ್ಷಣಗಳಿಗೆ ಹೆಚ್ಚುವರಿ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ. ಕೊನೆಯ ವಿಭಾಗದಲ್ಲಿ ವಿವರಗಳನ್ನು ಸೇರಿಸಬಹುದು.",
      "चुने गए लक्षणों के लिए अतिरिक्त प्रश्न नहीं हैं। अंतिम भाग में विवरण जोड़ सकते हैं।",
    ],
  "Optional measurements you report yourself. Staff must verify them.": [
    "ನೀವೇ ತಿಳಿಸುವ ಐಚ್ಛಿಕ ಅಳತೆಗಳು. ಸಿಬ್ಬಂದಿ ಅವುಗಳನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.",
    "आपके द्वारा बताए गए वैकल्पिक माप। कर्मचारियों को इनकी पुष्टि करनी होगी।",
  ],
  "Your encounter reference is not an access token. Keep your pass private.": [
    "ಭೇಟಿಯ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಪ್ರವೇಶ ಟೋಕನ್ ಅಲ್ಲ. ಪಾಸ್ ಅನ್ನು ಖಾಸಗಿಯಾಗಿ ಇಡಿ.",
    "मुलाकात संदर्भ संख्या पहुँच टोकन नहीं है। अपना पास निजी रखें।",
  ],
  "Use Back to correct any section. Your answers will be shared with the authorized hospital care team for this encounter.":
    [
      "ಯಾವುದೇ ವಿಭಾಗವನ್ನು ತಿದ್ದಲು ಹಿಂದೆ ಆಯ್ಕೆಮಾಡಿ. ಈ ಭೇಟಿಗಾಗಿ ಅಧಿಕೃತ ಆಸ್ಪತ್ರೆ ಆರೈಕೆ ತಂಡದೊಂದಿಗೆ ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.",
      "किसी भाग को सुधारने के लिए वापस चुनें। आपके उत्तर इस मुलाकात की अधिकृत अस्पताल देखभाल टीम से साझा किए जाएँगे।",
    ],
  "RED — emergency assistance": ["ಕೆಂಪು — ತುರ್ತು ಸಹಾಯ", "लाल — आपातकालीन सहायता"],
  "YELLOW — prompt assessment": ["ಹಳದಿ — ಶೀಘ್ರ ಮೌಲ್ಯಮಾಪನ", "पीला — शीघ्र आकलन"],
  "GREEN — non-immediate care": [
    "ಹಸಿರು — ತಕ್ಷಣವಲ್ಲದ ಆರೈಕೆ",
    "हरा — गैर-तत्काल देखभाल",
  ],
  "Human assessment required": [
    "ವೈದ್ಯಕೀಯ ಸಿಬ್ಬಂದಿಯ ಮೌಲ್ಯಮಾಪನ ಅಗತ್ಯ",
    "चिकित्सकीय कर्मचारी का आकलन आवश्यक",
  ],
  "Alert nearby hospital staff now. Do not wait for this screen to update.": [
    "ಈಗಲೇ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಸಿಬ್ಬಂದಿಗೆ ತಿಳಿಸಿ. ಈ ಪರದೆ ನವೀಕರಣಕ್ಕೆ ಕಾಯಬೇಡಿ.",
    "अभी पास के अस्पताल कर्मचारियों को बताएँ। इस स्क्रीन के अपडेट का इंतज़ार न करें।",
  ],
  "Prompt clinical assessment is required. Contact the assigned care professional.":
    [
      "ಶೀಘ್ರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನ ಅಗತ್ಯ. ನಿಯೋಜಿತ ಆರೈಕೆ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      "शीघ्र चिकित्सकीय आकलन आवश्यक है। नियुक्त देखभाल कर्मी से संपर्क करें।",
    ],
  "Follow the care team's waiting instructions. Tell staff immediately if symptoms worsen. This does not mean your condition is harmless.":
    [
      "ಆರೈಕೆ ತಂಡದ ಕಾಯುವ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ. ಲಕ್ಷಣಗಳು ಹದಗೆಟ್ಟರೆ ತಕ್ಷಣ ಸಿಬ್ಬಂದಿಗೆ ತಿಳಿಸಿ. ನಿಮ್ಮ ಸ್ಥಿತಿ ಅಪಾಯರಹಿತವೆಂದು ಇದರಿಂದ ಅರ್ಥವಲ್ಲ.",
      "देखभाल टीम के प्रतीक्षा निर्देश मानें। लक्षण बिगड़ें तो तुरंत कर्मचारियों को बताएँ। इसका अर्थ यह नहीं कि आपकी स्थिति हानिरहित है।",
    ],
  "Dictate main concern": ["ಮುಖ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಮಾತನಾಡಿ ತಿಳಿಸಿ", "मुख्य समस्या बोलकर बताएँ"],
  "Stop dictation": ["ಮಾತಿನ ದಾಖಲಾತಿ ನಿಲ್ಲಿಸಿ", "बोलकर लिखना रोकें"],
  "Complete review": ["ಸಂಪೂರ್ಣ ಪರಿಶೀಲನೆ", "पूरी समीक्षा"],
  Medicine: ["ಔಷಧಿ", "दवा"],
  Allergy: ["ಅಲರ್ಜಿ", "एलर्जी"],
  Remove: ["ತೆಗೆದುಹಾಕಿ", "हटाएँ"],
  Step: ["ಹಂತ", "चरण"],
  of: ["ರಲ್ಲಿ", "में से"],
};
export function translatePatient(text: string, language: PatientLanguageCode) {
  return language === "en"
    ? text
    : (patientCopy[text]?.[language === "kn" ? 0 : 1] ?? text);
}
export function usePatientCopy() {
  const language = useContext(PatientLanguage);
  return (text: string) => translatePatient(text, language);
}
