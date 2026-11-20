# Known limitations and remaining work

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
