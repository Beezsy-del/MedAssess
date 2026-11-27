# Requirements reconciliation — 22 November 2026

## Baseline and scope

This review covers the patient-portal requirements for the existing Beezsy-del/MedAssess repository and MediRoute Vercel project. It preserves existing records and functionality. The specification introduced no additional requirements beyond the prior portal upgrade.

The existing Next.js App Router / strict TypeScript / React / Supabase application, API and feature inventory, 16 migration files, permission documentation and acceptance reports were inspected. No new schema migration or duplicate deployment is necessary for this unchanged specification. This follow-up corrects contradictory historical deployment/feature-status statements; it does not claim a fresh execution of every browser test.

## Verified release

- Repository: https://github.com/Beezsy-del/MedAssess
- Branch: `feat/patient-portal-role-workflows`
- Deployed application commit: `88bde395a2dfc7cdba0735e9fb68e91405f838d5`
- Production: https://medcipher-triage-platform.vercel.app/
- Production deployment: `dpl_83m7MKuByujiKv7ZhdX6TMUnwQDM`, confirmed READY; canonical alias assigned; HTTP 200 rechecked.
- Earlier tested portal preview: https://medcipher-triage-platform-pv78941aj-bloodflow.vercel.app/ (protected). It predates the final password-validation fix; it is not the exact latest production build.
- CI for deployed code: https://github.com/Beezsy-del/MedAssess/actions/runs/45047642232 — verify and local-integration jobs succeeded; main-only hosted integration job skipped by policy, not represented as passed.
- Local release checks: formatting, lint, strict TypeScript, 90 unit tests and production build passed. Existing acceptance includes 21 browser scenarios and SQL/integration/load/Realtime checks. See PORTAL_UPGRADE_VERIFICATION.md for precise coverage and limits.
- Hosted migration inventory rechecked: 16 migrations, including both portal/workflow upgrades. Hosted versions differ from local filenames for the last two; names/content are reconciled in PORTAL_RELEASE.md. Do not apply them twice.
- Hosted RLS rechecked: 40 public tables, zero without RLS. Role and tenant behavioral test evidence is in PORTAL_UPGRADE_VERIFICATION.md; enabled RLS alone is not proof of every policy.
- Hosted `medcipher-workflow-review` cron is active.
- Staff creation, reload persistence, credential sign-in, role denials, duplicate rejection, password validation and account disabling passed on the current live production build. See PORTAL_RELEASE.md.

## Requirement coverage

| Requirement sections                         | Implementation and evidence                                                                                                                                                                       | Remaining limits                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: existing application inspection           | Existing baseline, route/API/feature inventory and release documents; repository history preserved                                                                                                | This repeat review does not replace independent security audit                                                                                  |
| 2–3: patient access and questionnaire        | Encounter-scoped QR/manual capabilities; adaptive questionnaire, structured history, medications, allergies, save/review, three patient languages, optional speech adapter                        | Physical phone scanning and microphone behavior depend on device; language/clinical review outstanding; some errors/status text English         |
| 4–6: classification, integration, escalation | Versioned preliminary/human assessment records, safety fallback, emergency action, Realtime/polling updates and scheduled reassessment; synthetic GREEN/YELLOW/RED and escalation fixtures tested | No supplied medically validated protocol; missing/unreviewed data remains assessment-required; no autonomous clinical deployment                |
| 7–8: nurse brief and OPD                     | Recorded medical brief, vitals, reassessment, escalation, resources/status actions; reviewed destination eligibility, notification and timeline                                                   | Clinical considerations require reviewed mappings; no invented diagnoses; OPD appropriateness needs clinical governance                         |
| 9: doctor workflows                          | No registration/QR permission; clinical assessment, investigations, disposition and internal referral lifecycle                                                                                   | Real external-hospital/ambulance communication is not integrated                                                                                |
| 10: administrator/resources                  | Operational patient directory and role-filtered data; sticky desktop/mobile summary; resource management and validated bed turnover                                                               | Bounded snapshot/history retrieval; not validated at large-hospital scale                                                                       |
| 11–12: permissions/database                  | Server authorization, protected memberships, tenant/department RLS, transactions, immutable histories, reconnect handling                                                                         | Independent penetration testing and production identity/recovery policy outstanding                                                             |
| 13: responsive interface                     | Existing responsive patient and staff interfaces; browser/axe checks recorded                                                                                                                     | Full assistive-technology and clinical-user testing outstanding                                                                                 |
| 14–15: GitHub and deployment                 | Source committed/pushed; hosted migrations and current production verified; earlier preview tested                                                                                                | Vercel GitHub auto-deploy integration absent; deployment uses authenticated source upload; isolated hosted staging needs separate configuration |
| 16–17: acceptance/report                     | A–J mapping and feature-by-feature evidence in PORTAL_UPGRADE_VERIFICATION.md; hosted evidence in PORTAL_RELEASE.md                                                                               | Local/hosted coverage explicitly distinguished; external and medical requirements remain incomplete                                             |

## Separate readiness decisions

- Hackathon demonstration: deployed and tested for synthetic workflows, with the documented limits.
- Supervised pilot: not ready; requires clinical and language review, governance and representative supervised acceptance.
- Production technical: not ready; requires isolated staging, independent security assessment, realistic load/failover/restore validation, monitoring and production identity lifecycle controls.
- Clinical/regulatory: not validated; clinical operational use remains disabled. No real patient data is authorized.

This is an implemented and deployed prototype, not a claim that every original master-specification feature or external dependency is complete. Browser push/SMS, external referrals/ambulance services, complete localization and full operational-scale assurance remain explicitly outside verified completion. Detailed historical master-spec gaps remain in FEATURE_STATUS.md and KNOWN_LIMITATIONS.md.
