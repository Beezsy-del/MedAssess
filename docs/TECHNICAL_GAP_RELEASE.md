# Technical gap closure — 22 November 2026

## Changes

- Fixed password recovery landing: successful PKCE exchange now opens an authenticated password page instead of settings that hid the form for every demo-hospital member. Individual staff can also open account settings.
- Added server-authorized password updates with active-membership, same-origin, body-size and provider-compatible password validation. The application refuses shared demo identity changes. Provider failure/network errors never produce success, and the form becomes retryable.
- Failed recovery links now show an explanation and a new-link instruction. External email delivery is not represented as verified.
- Fixed patient status races: refreshes are coalesced, foreground actions invalidate in-flight older status responses, and a delayed response cannot reopen a session after logout. Reconnection/focus refreshes clear stale-connection warnings without replacing unsaved answers.
- Added Kannada/Hindi patient status, validation, acknowledgement, reconnection and workflow text. Prototype translations still require native-language and clinical review.
- Fixed report review to preserve patient-entered names, medicines and free text exactly. Only controlled choices are translated.
- Reconciled permission documentation with implemented doctor-registration denial, scoped clinical RLS and staff management.

## Verification

Formatting, lint, strict TypeScript, 94 unit tests and production build passed. Rollback-only SQL fixtures passed. All 33 core, 16 intake, 20 bed and 19 portal integration assertions/groups passed against the isolated Supabase stack. Synthetic load passed 20 concurrent registrations, 20 emergency requests and 10 duplicate emergency retries (registration p50 100 ms, p95 119 ms; snapshot 175 ms). Realtime delivery and explicit reconnection passed. These are bounded test observations, not capacity guarantees.

The first browser run passed 22 scenarios and exposed an ambiguous test locator matching Next.js's route announcer as well as the intended alert. The locator was scoped to the main patient content without weakening its assertions; final results and deployment evidence follow below.

## Remaining external configuration and review

- Qualified medical professionals must supply/review triage protocols, escalation criteria, reassessment intervals, symptom-condition mappings, OPD eligibility and bed suitability protocols. Clinical operational use remains disabled; no clinical validation is claimed.
- Qualified Kannada/Hindi and clinical reviewers must approve translated wording. Browser microphone/device scanning and full assistive-technology acceptance require representative devices/users.
- Production SMTP delivery, approved redirect URLs and recovery/activation policy require provider setup and mailbox verification. The credential-change path is tested; end-to-end delivery of a recovery email is not.
- Web push/SMS credentials, subscriptions and delivery integration; real external referral/ambulance integrations and escalation contacts are not configured or claimed delivered.
- Isolated hosted staging, production monitoring/drains, backup/restore/failover drills, independent penetration testing and representative large-scale load testing remain outstanding.
- Vercel Git integration needs installation for automatic deploy-on-push; authenticated source upload deploys to the existing project.

## Remaining technical scope, not external-only blockers

The original broader master specification still has technical work: push/SMS adapters and background delivery, full staff-interface localization, all-field patient error/review localization, cursor-based historical retrieval, automatic offline retention/background synchronization, detailed staffing/forecast/report expansion and protected clinical-document workflows. These are not marked complete merely because the deployed patient-portal workflows pass. External medical or provider review cannot substitute for implementing these features. Device-local offline capture is not disconnected multi-device communication.

Hackathon demonstration: tested synthetic workflows. Supervised pilot: not ready. Production technical readiness: not certified. Clinical/regulatory readiness: not validated.

Final local evidence: full browser run **23/23 passed** after correcting the locator. Final review then extended stale-response protection to initial session loading; all three focused reliability scenarios passed, including the new initial-session race (24 distinct browser scenarios covered across the runs). Lint, typecheck, all 94 unit tests and production build passed again after that fix. Hosted RLS recheck: 40 public tables, zero without RLS, one active review job. No new database migration is required.

## Verified hosted release

- Repository: https://github.com/Beezsy-del/MedAssess ; branch `feat/patient-portal-role-workflows`.
- Deployed source: `733a0fb2c38d470224388a949da8c7b8f3c31287` (preceding implementation commit `b6d33d12d723fbd4ff71a0d74b31c78ea17e6c1f`).
- Final preview: https://medcipher-triage-platform-6k4qrp9me-bloodflow.vercel.app/ ; `dpl_Bpe9Chc7Z8dYF3Pkj4BCuGAMzGmk`, READY. All eight hosted acceptance groups passed. The preceding preview also passed real staff credential-change acceptance. Preview protection remained enabled; temporary test credential revoked and local credential file removed.
- Production: https://medcipher-triage-platform.vercel.app/ ; `dpl_78iEQbudkBW51NsfVtepXqYvGSoa`, READY, canonical alias assigned, Next.js/Node 24/Mumbai; build approximately 43 seconds.
- Current-production acceptance: all eight hosted workflow groups passed, plus staff form creation, persistence after reload, nurse sign-in, administrator denial, password-page availability, password change, old-password rejection, new-password login, duplicate and non-admin provisioning denial, and disabled-membership session denial. Synthetic test memberships were disabled afterward. No credentials were printed.
- Exact-source CI: https://github.com/Beezsy-del/MedAssess/actions/runs/45049791964 — success. Verify and local-integration jobs passed, including all **94 unit tests and 24 browser tests**, SQL/role/tenant assertions, database workflow suites, load and Realtime reconnect. Main-only hosted integration was skipped by its existing policy; independent hosted acceptance above was actually run.
- No database migration needed; no reset or removal of existing patient records. Existing 16 migrations retained; all 40 public tables have RLS and the workflow cron is active.
- Runtime error/fatal count query returned no groups for the deployed release during the short post-release observation window. No external monitoring drain has been configured; this is not a reliability guarantee.

Subsequent documentation-only commits do not change the deployed application source. This release fixes concrete defects; it does not claim all broader master-specification technical gaps have been completed.
