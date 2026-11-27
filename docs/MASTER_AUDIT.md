# Product requirements audit — 20 November 2026

## Acceptance decision

**Not fully accepted.** The application is a working synthetic prototype, but the original product specification has not been fully executed. Deployment and passing tests do not waive missing requirements. Every source requirement is retained in MASTER_REQUIREMENTS_CHECKLIST.md; verified implemented subsets and evidence appear in FEATURE_STATUS.md and TEST_RESULTS.md.

## Database reconciliation

Requested named tables: 51. Present requested tables: 27. Total implemented public tables: 28.

The following requested tables are still absent (some data currently lives in encounter/assessment JSON or consolidated tables, which is not equivalent to full normalized implementation):

- user_profiles
- staff_assignments
- staff_availability
- patient_identifiers
- patient_emergency_contacts
- symptom_catalog
- patient_symptoms
- medical_histories
- patient_allergies
- patient_medications
- clinical_observations
- triage_rule_definitions
- triage_assessment_answers
- triage_score_breakdowns
- triage_overrides
- queue_entries
- queue_events
- notification_recipients
- notification_delivery_attempts
- escalation_policies
- transfer_records
- referral_acknowledgements
- system_settings
- operational_daily_metrics

## Functional gaps requiring completion

- Protected staff invitation/activation and role-management administration; account recovery email verification.
- Full structured symptom/history/allergy/medication/contact capture and normalized persistence.
- Versioned configurable rule authoring, reviewer approval and retirement; reviewed clinical thresholds and translations cannot be invented. Clinical operation remains disabled.
- Complete staff menus, validation and instructions in Kannada and Hindi; large-text preference.
- Provider-backed browser push/SMS, delivery attempts, specialized recipient policies and scheduled background escalation.
- Fine-grained department/assigned-patient read authorization and cursor pagination.
- Full offline-refresh registration, retention policy, background sync and gateway integration where requested.
- Prescription/protected-document workflows, detailed availability/routing recommendations and scheduled maintenance.
- Complete date/department reports, patient-flow durations, bed/referral/department forecasts and PDF exports.
- Full seven-scenario master acceptance coverage, installation/voice hardware checks and all-route accessibility/load tests.
- Vercel GitHub integration installation is required for automatic deploy-on-push; direct authenticated source deployments work independently.

## Changes made in this audit

Added eight RLS-protected workflow tables and transactional integration for reassessment, deterioration, shortages, follow-up, resource status, dispositions, investigations and acknowledgements. Added clinical subpriority and maintenance commands, strict payload validation for all current staff operations, and safe HTTP errors. Added new hosted integration and browser coverage. No clinical protocols were approved and no existing records were destructively reset.

Audit update: see [READINESS_AUDIT.md](READINESS_AUDIT.md) for the current feature-by-feature evidence and four separate readiness decisions. AES-GCM device draft encryption, concurrent retry locking and active-queue pagination are now implemented. Encryption does not protect against same-origin script compromise; retention expiry remains missing.
