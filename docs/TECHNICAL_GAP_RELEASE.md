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
