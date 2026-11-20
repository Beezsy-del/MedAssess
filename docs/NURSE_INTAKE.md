# Nurse registration and triage workflow — 21 November 2026

## Architecture and scope

The existing App Router session uses verified Supabase Auth users and protected hospital memberships. Patient records are separate from patient_encounters; triage_assessments, vital_signs, patient_status_events and audit_logs record decisions and history. Normal clients have tenant-scoped read access and mutate records through the authorized staff_command RPC. The existing clinical engine is an unvalidated demonstration and does not recommend GREEN from absent signs.

This change reuses that model, command pipeline, clinical field editor, queue algorithm, UI components and encrypted device storage. Reception's assisted registration and QR workflow remains available. Doctors and administrators retain their overview landing page. Nursing roles now land on /registration after password or demo sign-in; /nurse also opens this workspace. The nursing dock leads directly to registration, and the triage queue remains accessible.

## Workflow

1. Identify: create a new patient (name or explicit unidentified temporary record) or search the entire authorized hospital patient table by patient ID, optional MRN, name, DOB or phone. Matches show distinguishing details and require explicit identity verification. Contact/identification fields are optional. An existing active visit can be assessed directly; opening another visit requires a reason.
2. Assess: use the existing observation and warning-sign fields, add optional history/allergies/notes, choose a destination, explicitly select a category and explain the clinical reasoning. No category is preselected. Nurse emergency downgrades still require doctor review. Blank observations remain unknown.
3. Confirm: review the patient, visit, observations, destination, category and responsible clinician, then explicitly confirm. Patient creation, visit creation or update, assessment, vitals, queue status, notifications and audit entry commit in one transaction. Confirmed categories enter WAITING via the existing validated transition graph; incomplete assessments remain TRIAGE_PENDING. This is software transition validation, not clinical validation.
4. The receipt identifies patient/encounter, category, destination, registration/confirmation timestamps and responsible clinician. Register another patient, open the encounter or visit the updated queue. Corrections use the existing authorized assessment history workflow on the encounter.

The patient-flow section provides recent registrations, awaiting assessment, recently assigned, reassessment and active-queue filters, with search and direct assessment of pending visits. Recent lists preserve chronology; the active queue uses the existing urgency algorithm before truncating the displayed preview.

## Backend changes

- Additive migration `nurse_intake_workflow`: nullable patient DOB, identifier/MRN and emergency contact; unique hospital identifier index; tenant-scoped security-invoker find_patients lookup; private intake receipt table; atomic intake orchestration through the existing commands.
- Follow-up `intake_observation_history`: staff observations belong to the assessment input, preserving original patient-reported encounter intake. They are displayed with the assessment's actor and timestamp.
- `POST /api/patients` performs bounded, authenticated, role-checked searches without putting identity queries in URLs. Results are limited to 25 with a refine-search notice. Late requests are cancelled and stale results hidden.
- The command contract validates inputs. The database independently enforces membership, role, identity confirmation, category, emergency policy, version, patient/encounter relationship, duplicate matching and transaction consistency.
- Per-operation locking and actor-bound request hashes provide idempotent retry. Reusing an operation with changed data is rejected. Concurrent new-patient intake uses a hospital-scoped identity lock; an exact normalized name match requires selecting the existing record or documenting why it is a different person. A duplicate MRN cannot be overridden.
- Private receipts have RLS and no client privileges/policies by design. They contain no raw QR tokens. The existing public command wrapper is a deliberately gated security-definer boundary; no new anonymous mutation endpoint was added.

## Drafts and failures

Intake drafts reuse AES-GCM device storage scoped to user and hospital. They are never auto-synchronized as assignments. The nurse resumes and reviews them explicitly. An uncertain server acknowledgement locks the submitted payload for safe retry, including after saving/restoring a recovery draft. A successful retry returns the original receipt instead of creating another encounter. Validation failures leave fields editable; failures do not clear the form. Sign-out clears device drafts. Navigation within the three steps preserves fields; leaving the workspace without saving is not a substitute for saving a draft.

## Known boundaries

- Synthetic demonstration only. Clinical operations remain disabled. No new thresholds, clinical protocols or AI diagnosis were introduced.
- Matching is an identity-review safeguard, not a national patient index or automatic merge. Fuzzy names, spelling differences, shared phones and unidentified-patient reconciliation need staff review. The legacy Reception registration route retains its existing behavior; intake's name-review guard applies to the new workflow, while the unique MRN constraint applies to the table.
- No live disconnected multi-device communication, automatic offline clinical assignment or automatic draft retention expiry. Device encryption does not defeat same-origin script compromise.
- Search returns bounded results; operational lists use the existing bounded hospital snapshot. Unidentified reconciliation, organization-wide patient merging and full demographic-edit history are outside this change.
- The pre-existing leaked-password-protection setting remains disabled. See [Supabase's remediation guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Existing exposed-RPC advisor warnings are reviewed access boundaries, not evidence of clinical readiness; the new private receipt no-policy informational notice reflects deliberate denial of client access.

## Verification record

- Six new unit cases cover role landing, unknown defaults, explicit identity/human confirmation, incomplete assessments, patient/version requirements and invalid inputs.
- Sixteen hosted intake assertions cover concurrency, replay mismatch, duplicate matching, MRN uniqueness, lookup identifiers, return visits, pending-visit completion, stale versions, rollback, unknown observations and authorization.
- `tests/intake-rls.sql` passed an eight-role/two-tenant rollback fixture, including clinical/lookup role permissions, foreign-tenant denial, receipt privacy and attributable audit records.
- New browser scenarios cover the full nurse flow, existing-patient selection, device-draft resume, API failure/retry, duplicate rejection, admin/doctor regressions and responsive accessibility. Final suite/build and hosted release results are appended after execution.

Final local verification on 21 November 2026: `npm run check` passed formatting, lint, strict TypeScript, all 61 unit tests and the production build. All 13 Playwright scenarios passed against a fresh production server in 1.3 minutes, including pending-encounter completion, a committed response deliberately replaced with HTTP 503, idempotent retry and unidentified/incomplete intake. The existing 33 hosted integration assertions and 16 new intake assertions passed against the migrated synthetic database. Light/dark assessment accessibility checks found no serious/critical axe violations; 320, 390, 768 and 1440px layouts fit their viewports. These checks verify software behavior, not clinical validity.
