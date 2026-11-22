# Known limitations and remaining work

**Staff provisioning update:** The server-only Supabase secret is configured and live synthetic staff creation/login/access controls have been verified. Initial passwords enforce the provider length limit. Email invitations remain a separate, unimplemented delivery workflow.

**Hosted release update:** Deployment was subsequently authorized. See [PORTAL_RELEASE.md](PORTAL_RELEASE.md) for migration, deployment and live verification evidence; earlier deferral statements below are historical.

**22 November local upgrade:** See [PORTAL_UPGRADE_VERIFICATION.md](PORTAL_UPGRADE_VERIFICATION.md) for the current patient-portal, role, resource, protocol and referral implementation. Hosted deployment was explicitly deferred by the user; older hosted-status statements below describe the previous release. The new local implementation supersedes older gaps for staff role editing, department RLS, adaptive history/medicines/allergies, internal referrals and scheduled reassessment. It does not establish clinical validation or production readiness.

## Release blockers

1. The full master feature specification is not complete. Consult FEATURE_STATUS.md rather than assuming every described module is ready.
2. No clinical validation or approved protocol exists. Operational use and real patient data remain prohibited and disabled.
3. GitHub is published and CI passes; synthetic CI integration secrets are now environment-scoped and restricted to main; final run results are recorded in DEPLOYMENT_STATUS.md.
4. Vercel production is deployed; deploy-on-push requires installing the Vercel GitHub integration. See DEPLOYMENT_STATUS.md for verification details.

## Important implementation gaps

- Supabase leaked-password protection is disabled and needs account-side configuration.
- Staff invitations, account activation, role-edit workflow, and complete password-recovery verification.
- Full clinician-reviewed configurable rule/scoring engine and protocol approval lifecycle.
- Complete staff-interface translation, clinical language review, structured symptom catalog and normalized medical history.
- Push/SMS delivery providers, specialization policies, background escalation worker, and real external referral/ambulance integration.
- Full offline refresh capture, automatic retention expiry, service-worker background sync and hospital LAN gateway.
- Fine-grained department/assigned-patient read restrictions, distributed IP abuse prevention and independent security assessment.
- Full requested normalized schema, prescription/protected-document workflows, routing recommendations and detailed staff availability.
- Forecasts beyond hourly arrival means; patient-flow durations; complete report filtering and PDF output beyond browser print.
- Server cursor pagination; active encounters are paged up to an explicit 10,000 demo ceiling; closed encounters are capped at 500 and history queries remain bounded. This is not verified at large-hospital scale.
- Hospital switching is implemented for multiple active memberships. Live browser verification currently covers one hospital; two-hospital selector switching still needs an end-to-end fixture. Selection clears unsaved forms, while saved offline drafts remain scoped to their original user and hospital.
- Browser push, microphone recording, recovery email delivery, real multi-device reconnect, and all-route screen-reader testing have not been exercised.

## Known design boundaries

- Patient intake tokens are bearer capabilities. Anyone with a valid pass can submit information or request emergency help for that encounter, but cannot retrieve the full record. Protect printed passes; use expiry/rotation.
- Platform access logs may contain route URLs unless provider-side redaction is configured. Local Next request logging is disabled to avoid raw token paths. Production log redaction must be verified before deployment.
- Shared synthetic demo accounts are intentionally available through explicit demo-mode sign-in buttons. Never enable them for a real hospital.
- The compact clinical input model intentionally has no unreviewed physiological cutoffs. Missing information requires human assessment; no autonomous diagnosis or GREEN classification exists.
- Automatic in-app escalation currently runs during authenticated snapshot refresh. It is not an independently scheduled emergency paging service.
- Test records remain auditable. The provided reset archives active `Synthetic …` cases, rather than destructively resetting remote data.

Audit update: see [READINESS_AUDIT.md](READINESS_AUDIT.md) for the current feature-by-feature evidence and four separate readiness decisions. AES-GCM device draft encryption, concurrent retry locking and active-queue pagination are now implemented. Encryption does not protect against same-origin script compromise; retention expiry remains missing.

The UI refinement preserves the same synthetic-only readiness boundaries. Automated accessibility checks and responsive screenshots do not replace assistive-technology testing with hospital users.

The BloodFlow-inspired frontend remodel does not change these readiness limits. Theme selection is an optional browser-local preference; automated responsive and axe checks do not replace screen-reader and clinical-user usability evaluation. Wide patient tables and the flow board use internal horizontal scrolling on narrow screens.

Nurse intake: exact-name review and unique hospital MRN protect the new intake workflow, but fuzzy identity matching, merges and unidentified-patient reconciliation remain manual. The legacy Reception path retains its existing name-matching behavior. Intake drafts require explicit review/submission after reconnecting and have no automatic expiry. See NURSE_INTAKE.md for boundaries and test evidence.

Bed placement matches explicit reviewed requirements against recorded synthetic ward/capability data; it does not establish clinical suitability independently. Staffing, specialty/cohort rules, live device availability and measured floor-plan geometry are not integrated. Restriction text requires human review. Holds expire through authorized refresh, not a background scheduler; unavailable or disconnected systems cannot block manual care. See BED_MANAGEMENT.md for permissions, conservative re-review and bounded history limits.

Bed-release verification observed intermittent slow Supabase authentication/reads and a concurrent-registration statement timeout. Lock scope was narrowed and realtime refreshes coalesced, but short acceptance checks cannot certify sustained load or response-time targets. Historical Vercel snapshot timeouts on the previous release remain operational evidence to investigate before a pilot.

Final bed-release CI 44841263814: nine browser failures remain (intake acknowledgement and sign-in/workspace loading), despite all four bed scenarios and 69 database assertions passing. Their complete root cause is not established; prior provider timeouts do not prove every failure external. Do not treat this demo release as production technical readiness.

Patient-portal upgrade branch: the new migration is not deployed and must not be applied to production yet. Its stricter clinical RLS requires the operational directory snapshot and staff department-assignment interfaces to be integrated before release. New report records are not yet displayed in the existing staff encounter interface. Referral/resource-request schemas currently precede their complete staff lifecycles. The new English questionnaire lacks complete translations, voice entry and a full field-by-field confirmation screen. Existing QR issuance still uses the legacy portal until the new flow passes isolated acceptance. The new session endpoint and UI have build/unit/local-SQL evidence, not hosted end-to-end acceptance. Preliminary triage has no seeded clinical protocol and is not clinically validated. Hosted Supabase branching is unavailable on the connected project's current plan; no paid plan change was made.
