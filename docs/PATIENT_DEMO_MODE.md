# Patient Portal Demo Mode

## Access and isolation

Open `/login` → Patient Portal → **Explore Demo Mode**. The exact demo route is `/patient-portal/demo`. No account, token, QR scan or login is needed. The other option, **Real Patient Access**, opens the existing secure portal at `/patient/start`. Existing issued QR links still open their protected encounter.

The demo uses an in-memory browser store. It makes no patient API or Supabase calls, writes no database records, and sends no SMS, email, push or hospital alerts. Refreshing the page starts a fresh demo. Reset Demo clears the scenario, answers, classifications, notes, timeline and simulated notifications. The demo QR contains only `MEDCIPHER-DEMO-NOT-VALID-FOR-PATIENT-ACCESS`; the real token validator rejects it.

The public demo route does not run staff authentication. This exemption does not change real patient credential checks or staff route/API/database permissions. No migration, demo database tenant, service key or special production environment variable is needed for the presentation.

## Working features

- Fictional patient profile, encounter reference, age, contact, visit time and history.
- Six-step questionnaire with symptoms, conditional follow-ups, pain, history, medicines, allergies, review and consent.
- Explicitly simulated GREEN/YELLOW/RED cards with reason, timestamp, symptoms and next workflow step.
- Symptom changes with previous/new category, escalation history and simulated alerts. Ordinary submission cannot silently downgrade a higher category.
- Immediate emergency demonstration without finishing the form; real emergency guidance stays visible.
- Timeline that changes with registration, submission, classification, notifications, acknowledgement, nurse review and doctor documentation.
- Simulated notifications with pending/acknowledged status and timestamps.
- Medical history view and shared simulated nurse/doctor handover.
- Nurse acknowledgement/reassessment and gated doctor assessment, referral or treatment-plan documentation.
- Non-access QR illustration and explanation of the real pass workflow.
- Scenario selector, reset, start from beginning, timeline, notifications, home and exit controls.

## Five judge scenarios

| Scenario                   | Presentation flow                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| GREEN — General Waiting    | Review prefilled fictional answers, submit, see GREEN and the general waiting workflow                                                  |
| YELLOW — Urgent Assessment | Review the urgent presentation script, submit, see YELLOW and simulated nurse/doctor alerts                                             |
| RED — Emergency            | Activate an immediate RED presentation, staff-help instructions and simulated emergency/transport events                                |
| Dynamic Escalation         | Start GREEN, choose a scripted worsening update for YELLOW, then a separate emergency update for RED                                    |
| Existing Medical History   | Review fictional diabetes, hypertension, sample medicine, allergy and procedure details; see the same report in the simulated care team |

These are **presentation scripts, not medical rules**. Selected scenarios determine the result. Questionnaire answers do not generate a diagnosis, score or clinical urgency threshold. No claim is made that these scripts have medical approval. Actual clinical operation remains disabled until qualified professionals provide and review protocols. Waiting time does not change the simulated category.

## Scope and limitations

This is an interactive local-browser demonstration, not live hospital coordination. State is intentionally not saved across refreshes, tabs or devices. The demo is in English; the existing real questionnaire retains English, Kannada and Hindi. All patient details and documentation are fictional. The sample QR cannot grant access. Clinical and language review and real provider setup remain requirements for any operational use, not requirements to run this isolated presentation.

## Verification

- Formatting, lint, strict TypeScript checks and production build passed.
- 102 unit tests passed, including all scripts, escalation, reset, nurse/doctor gating and rejection of the illustrative QR by real token validation.
- 28 local browser tests passed against isolated local Supabase. These cover all five demo scenarios, manual questionnaire, emergency bypass, simulated handover, reset, zero patient API/Supabase traffic, no patient/staff cookies, mobile overflow and accessibility, plus the existing three staff portals, real token/QR access, patient report persistence, bed management and role restrictions.
- Preview and production verification are pending deployment. No database schema change is required.
