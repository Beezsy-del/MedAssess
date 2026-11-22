# Fourth portal on the existing login — 22 November 2026

## Implementation

The existing `/login` screen now presents Administrator Portal, Doctor Portal, Triage Nurse Portal and **PATIENT PORTAL** in one consistent four-option layout. The patient option uses a patient icon, the requested description and an **Enter Patient Portal** link. Staff buttons retain their existing synthetic sign-in actions; the hospital-issued credential form and recovery flow remain present. With demo sign-in disabled, staff options focus the credential form and never grant a chosen role.

The new public `/patient-portal` route renders the existing integrated adaptive patient interface. New QR passes point to this route with the random capability in the fragment; old `/patient/portal`, `/patient/start` and legacy intake/status routes remain supported. No new patient database or standalone dashboard was created. Patients receive QR/phone-camera, private-token and staff-assisted registration instructions in English, Kannada and Hindi. An encounter reference is not an access credential. The symptom-update action is labelled **MY SYMPTOMS HAVE CHANGED**.

The existing registration workflow creates/reuses patient identity and creates an encounter. Its hashed, expiring/revocable capability opens only the permitted encounter through server-side verification and rate limiting. Questionnaire reports, clinical history, medications, allergies and immutable preliminary assessments continue to persist through the existing transactional RPC. Nurse Realtime updates, doctor notifications, administrative redaction, OPD/referral workflows and scheduled reassessment are reused without weakening permissions.

No database migration is needed. Hosted inspection confirmed 16 applied migrations and RLS enabled on all 40 public tables. Doctor registration remains denied. Clinical operational use remains disabled.

## Acceptance mapping

| Requested test                              | Verification                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1–2: four options and patient navigation    | New four-portals browser test checks all four headings, patient link, route, mobile overflow, serious/critical accessibility findings and translated instructions                                      |
| 3–5: registration, QR/open and manual token | Existing registration UI generates the QR/pass with new route; new browser test opens its fragment, clears it from the address bar, compares QR/manual encounter reference and rejects a guessed token |
| 6: adaptive questionnaire persistence       | Portal browser workflow now enters through login's fourth option and submits to the actual isolated Supabase database; SQL and 19 portal integration groups verify persistence and history             |
| 7–9: GREEN/YELLOW/RED and notifications     | Synthetic reviewed fixtures exercise categories, escalation, recipient notifications and emergency acknowledgement; no real clinical validity asserted                                                 |
| 10–11: dashboards and changing symptoms     | Browser verifies medical brief, dynamic escalation without manual refresh, administrative privacy; SQL checks events and scheduled review                                                              |
| 12: isolation                               | Guessed credential revokes the previous browser capability; SQL and Auth/RPC integration cover wrong/expired/revoked tokens and hospital/role isolation                                                |
| 13: three staff portals                     | Existing role-login, clinical, intake, directory/resource and authorization regression scenarios retained                                                                                              |

## Limitations

- QR acceptance opens the generated URL. Physical camera scanning on actual Android/iPhone hardware is not certified; the instructions use the phone's camera and do not claim a built-in scanner.
- GREEN/YELLOW/RED automation is verified using explicitly synthetic reviewed fixtures. Real clinician-approved protocols and native-language/clinical translation review remain required. Missing or unreviewed information remains assessment-required, never assumed GREEN.
- Patient status is limited to permitted encounter fields. No clinical notes or staff communications are exposed. Broad system limitations in TECHNICAL_GAP_RELEASE.md remain unchanged.
- The deployed target remains the user-confirmed MedCipher project, not the MedVita hostname in the template.

Final test, GitHub, preview and production evidence is appended after verification.

Initial verification: formatting, lint, strict TypeScript, all 94 unit tests and production build passed. Rollback-only SQL and all 19 portal integration groups passed. The first browser run passed 25 scenarios but lost the first bed scenario's shared nurse session when an overlapping integration script performed its default global sign-out. The browser suite is rerun sequentially; no product checks were disabled or relaxed. Screenshots of desktop login and mobile patient entry were reviewed.

The sequential full browser rerun passed **26/26**. Hosted preview then found a same-document QR edge case: changing only the fragment while already on the patient page did not rerun the access exchange. The portal now reloads on a newly opened QR fragment so the existing verified exchange runs without retaining another encounter's unsaved state. The QR browser regression explicitly covers this path and passes. Static checks, 94 unit tests and the production build passed again after the fix. A timing-only hosted assertion was also corrected to wait for client navigation before checking its URL.
