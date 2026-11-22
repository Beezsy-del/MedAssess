# MedCipher patient-portal release — 22 November 2026

The user authorized deployment to the existing site after local and CI acceptance. This supersedes the earlier hosted-deployment deferral.

- Repository: https://github.com/Beezsy-del/MedAssess
- Application source: `1eddbb981c5319a83c17d37348359351cc56a02f`, branch `feat/patient-portal-role-workflows`.
- Verified CI: https://github.com/Beezsy-del/MedAssess/actions/runs/45042011033 (87 unit tests, 21 browser scenarios, SQL/integration/load/Realtime checks, production build).
- Supabase project: MedAssess, `kkfqxlwwcwhnmhmsqitx`.
- Existing 14 migrations preserved. Applied `patient_portal_role_workflows` and `staff_workflows_and_snapshot` from the committed files; hosted migration history assigns versions `20261122164944` and `20261122164954` respectively. Match these by name/content when reconciling with local migration filenames; do not apply them twice.
- After migration: all 40 public tables have RLS; no security-definer function lacks a configured search path; portal and snapshot RPCs exist; the workflow cron is active and its observed execution succeeded. The 283 pre-existing encounters remained present before verification created additional synthetic records.
- Preview: https://medcipher-triage-platform-pv78941aj-bloodflow.vercel.app (`dpl_9gkRJZBY3jSH5jKgVnu8MWr22zbH`), READY. Eight real hosted acceptance groups passed: three-role sign-in, real snapshots, patient draft/submission, doctor registration denial, admin privacy, nurse medical brief, live emergency update and patient-session logout. All 33 core integration assertions also passed against hosted Supabase.
- Production build: `dpl_FLZiRSZmm68HwkCAg5SUhfJQr8AP`, immutable URL https://medcipher-triage-platform-ku466535b-bloodflow.vercel.app. Final production verification is appended below.

## Remaining configuration and readiness

`SUPABASE_SECRET_KEY` is now configured as a sensitive server-only variable for Production and Preview. The subsequent production redeployment `dpl_D8iToa7hX47dkVAA8tQHXTVxYCJn` reached READY. Live administrator-form verification created a synthetic Auth account and hospital membership, confirmed persistence after reload, signed in as the new nurse, verified administrator-route denial and rejected duplicate/non-administrator provisioning. The test membership was then disabled and its existing session lost workspace access. No key or test password was printed.

The live check also exposed a validation mismatch: the form accepted passwords beyond Supabase's limit. Initial staff passwords now enforce 12–72 characters and a 72-byte UTF-8 maximum, with explicit validation errors and three regression tests. This does not change existing-user sign-in or reset credentials.

No medically validated protocol or symptom-condition mapping has been supplied. Unreviewed/missing data remains assessment-required. Qualified clinical and language review remains necessary; clinical operational use stays disabled. This deployment is a synthetic demonstration, not production or clinical certification. The remaining feature and operational limits are described in PORTAL_UPGRADE_VERIFICATION.md.

Supabase security advisors report deliberate deny-all RLS on private receipts/drafts and explicitly callable, capability-/membership-checked security-definer RPCs. These do not justify relaxing access checks. Leaked-password protection remains disabled: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. Future production work must resolve the identity/security controls and independent review requirements.

## Final production verification

- **URL:** https://medcipher-triage-platform.vercel.app/
- **Target / status:** production / READY. Vercel confirms that the canonical alias points to `dpl_FLZiRSZmm68HwkCAg5SUhfJQr8AP`.
- **Application commit:** `1eddbb981c5319a83c17d37348359351cc56a02f`.
- **Framework / region:** Next.js / Mumbai (`bom1`), Node 24.
- **Build duration:** approximately 42 seconds from provider building/ready timestamps.
- **Public availability:** HTTP 200, 0.68 seconds in the observed probe.
- **Production acceptance:** all eight hosted acceptance groups passed on the canonical public URL, without a protection bypass.
- **Runtime error scan:** no error/fatal log groups returned for this deployment in the post-release 10-minute query window. This is a short observation window, not a reliability guarantee.
- **Drains / monitoring:** no external drains configured; provider runtime logs are available, but broader production monitoring remains a readiness gap.
- **Temporary access:** preview automation bypass revoked and its local credential file removed after verification.

The deployed application does not include subsequent documentation-only commits. No database reset, force push, clinical enablement or change of Vercel project was performed.

## Staff provisioning release — 22 November 2026

Production deployment `dpl_83m7MKuByujiKv7ZhdX6TMUnwQDM` is READY and the canonical URL points to it. Deployed application commit: `88bde395a2dfc7cdba0735e9fb68e91405f838d5`. The production and preview `SUPABASE_SECRET_KEY` entries were confirmed as sensitive variables without retrieving their values. No additional database migration was needed for this validation fix.

Formatting, lint, strict TypeScript, 90 unit tests and the production build passed. Post-deployment verification on the canonical live site passed: oversized passwords return explicit validation errors; the administrator form creates an Auth account and hospital membership; the new member persists after reload; new credentials sign in with nurse permissions; administrator routes are denied to that nurse; duplicate creation and doctor provisioning are rejected. The synthetic test membership was disabled afterward, and its existing session lost workspace access. No credentials were printed. The post-release error/fatal runtime-log query returned no groups during the short observed window.

## Subsequent technical-gap release

The current production source is `733a0fb2c38d470224388a949da8c7b8f3c31287`, deployment `dpl_78iEQbudkBW51NsfVtepXqYvGSoa` (READY). See [TECHNICAL_GAP_RELEASE.md](TECHNICAL_GAP_RELEASE.md) for preview/production acceptance, exact-source CI (94 unit and 24 browser tests), staff credential changes, remaining technical work and external review requirements. Earlier deployment IDs in this document are historical.
