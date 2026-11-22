# Implementation milestones

- [x] Inspect workspace and requirements: empty directory, no existing Git remote; existing empty Supabase project identified.
- [x] Foundation: Next.js, strict TypeScript, design tokens, responsive shell, core public/staff routes.
- [x] Core backend: 20-table schema, protected memberships, RLS, transactional commands, generated types.
- [x] Core registration: separate patient/encounter, secure QR, intake, assisted and unidentified entry.
- [x] Safe demonstration clinical core: emergency signs, assessment-required handling, human verification, history and decimal score.
- [x] Core coordination: category-preserving queues, in-app alerts, Realtime plus polling, shared clinical workspace.
- [x] Core operations: validated SmartFlow, resource locking, referral lifecycle, doctor disposition.
- [x] Device-level offline capture on open authorized screens and idempotent reconnect sync.
- [x] Basic administration: aggregate metrics, arrival baseline, configuration, shifts, audit, CSV.
- [x] Unit, hosted integration, RLS and primary browser scenario verification.
- [x] Membership-checked hospital preference, fail-closed explicit selection, full-document workspace switch, assigned/unassigned queue filters, and bounded command request bodies.
- [x] Strict command validation; persisted reassessment/shortage/follow-up workflows; resource and disposition histories; six remote migrations.
- [ ] Expanded features from master prompts: detailed gaps are tracked in FEATURE_STATUS.md.
- [ ] Full translations, reviewed protocols, provider notification channels, advanced offline and operational analytics.
- [x] GitHub MedAssess repository published and verify CI passed.
- [x] Vercel preview built and six hosted browser scenarios passed.
- [x] Production deployment reached READY; see TEST_RESULTS.md for hosted verification.
- [ ] Complete master feature acceptance: remaining requirements are inventoried in MASTER_AUDIT.md and MASTER_REQUIREMENTS_CHECKLIST.md.

Product brand: MedCipher. Existing backend target: MedAssess, kkfqxlwwcwhnmhmsqitx, ap-south-1. No operational clinical enablement, database reset or destructive migration was performed.

Core milestone checks passed as described in TEST_RESULTS.md. The supplied master acceptance milestone is not complete; external access and feature-development gaps are explicitly distinguished.

- [x] Reproduce and fix registration retry races, provider false-success paths, offline plaintext and token/disposition integrity defects.
- [x] Execute eight-role/two-tenant transactional audit, bounded synthetic concurrency load, 10,000-row queue sort, browser outage/recovery scenarios and explicit Realtime resubscription.
- [x] Publish separate demonstration, pilot, technical and clinical readiness assessment in READINESS_AUDIT.md.
- [ ] Complete outstanding master functionality, production capacity/DR/privacy controls and qualified clinical review; no blanket readiness claim.

- [x] Apply frontend-design and Emil Design Engineering to the existing hospital UI: typography, navigation, operational hierarchy, plain copy and keyboard navigation; preserve live workflows.

- [x] Remodel the frontend using the user-supplied BloodFlow reference: header navigation, floating dock, live dashboard overview, shared operational components, public/patient screens and light/dark themes. Verification is tracked in BLOODFLOW_REMODEL.md.

- [x] Implement nurse-first registration with patient lookup, direct initial assessment, explicit priority confirmation, transactional persistence and device draft recovery. See NURSE_INTAKE.md for integration and verification evidence.

21 November 2026 — Visual bed management: extend existing resources/reservations with physical wards, bed capabilities and clinician-reviewed placement; replace the generic bed reservation path; integrate automatic intake handoff, realtime map, holds/reassignment/turnover and attributable history. Database assertions and role/tenant fixture passed; four new preview scenarios passed and the matching frontend is deployed. Full browser acceptance encountered provider authentication timeouts; CI results are recorded separately. See BED_MANAGEMENT.md.

## Patient portal and role-workflow upgrade — active

Baseline and target confirmation: PORTAL_UPGRADE_BASELINE.md. Feature branch: feat/patient-portal-role-workflows.

1. Preserve production; establish isolated database testing before changing existing permissions.
2. Implement shared role/route/action policy and database-backed operational privacy views.
3. Add versioned adaptive questionnaire, saved progress, symptom updates and limited patient status cards.
4. Add reviewed configuration, attributable preliminary assessments/escalations and scheduled reassessment tasks; retain unknown findings and clinical-use lock.
5. Add nurse briefs/quick actions/OPD routes and doctor department referrals with transactional lifecycle records.
6. Reorganize admin directory/resources with sticky summaries and safe staff/department management.
7. Cover synthetic acceptance A–J, tenant/role/token abuse, migration compatibility, load/reconnection, accessibility and regression.
8. Push logical commits; verify isolated preview; promote only after required checks pass; publish exact results and remaining external clinical review needs.

21 November — portal foundation checkpoint (not release acceptance): user confirmed MedAssess and the existing MedCipher deployment. Added role checks before page data loading and API commands, filtered navigation and doctor registration/pass controls, request-scoped session reuse, an eight-step English patient form, scoped HttpOnly session endpoint, strict report validation, and draft/report/rule models. Draft migration replay plus synthetic transaction tests passed in isolated local PostgreSQL 17. Existing production has not been migrated or replaced. Supabase hosted branch creation failed because the project plan does not support branching; an isolated hosted environment is still required. Staff review/referral/admin integration, translations, scheduler, full A–J acceptance and hosted verification remain unchecked.

22 November — user chose local execution and deferred hosted deployment. Implemented the adaptive patient portal, prototype EN/KN/HI copy and optional dictation, nurse briefs/OPD, doctor internal referrals, operational admin directory/sticky resources, staff provisioning/access, reviewed configuration, scheduled monitoring, and scoped snapshots. Real local Supabase Auth/PostgREST/Realtime is running with two synthetic tenants. SQL replay, 87 unit tests, 33 core, 16 intake, 20 bed and 19 portal integration groups passed. Added isolated local CI. Hosted preview/production work is explicitly deferred, not represented as completed. Current verification and remaining dependencies: PORTAL_UPGRADE_VERIFICATION.md.

22 November — hosted deployment explicitly authorized. Applied the two tested portal/workflow migrations to existing MedAssess, preserved existing records, and verified 40/40 public tables with RLS plus successful scheduled execution. Preview acceptance and 33 hosted core assertions passed. Production release evidence and outstanding server-only staff-provisioning configuration are tracked in PORTAL_RELEASE.md.

22 November — verified the newly configured server-only Supabase secret and successful production redeployment. Live staff account creation, persistence, new-account login, role restrictions, duplicate rejection and deactivation passed. Fixed the initial-password provider-length mismatch and added boundary/UTF-8 regression tests.

### Repeated final master prompt reconciliation

Compared the newly attached prompt to the prior attachment: identical content. Rechecked current production READY/HTTP 200, deployed-commit CI success, all 16 hosted migrations, RLS on all 40 public tables and active reassessment cron. Corrected stale hosted-deferral and now-implemented workflow statements. See MASTER_PROMPT_RECONCILIATION.md for the consolidated release and outstanding external/clinical requirements. No application or schema change was needed for the repeated specification.
