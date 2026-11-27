# Afnan interface integration — 27 November 2026

The release merges `afnan-fixes-and-features` (`b83792d`) with the existing MediRoute patient/security baseline (`7de81d4`). It preserves both histories rather than replacing newer functionality with the older ZIP.

## Integration decisions

- Adopted the new visual tokens, icons, workspace rail, track board, clinical quick-peek drawer, date-input normalization and UI error handling.
- Preserved secure QR/manual encounter access, adaptive questionnaire, full isolated patient demo, clinical brief, staff provisioning, role-aware server routes and tenant database policies.
- Kept MediRoute branding. Removed unsupported ESI/telemetry wording.
- Reapplied role-aware navigation; doctors do not receive patient registration controls.
- Corrected occupancy to count occupied beds, not maintenance/cleaning/blocked beds.
- Retained the existing explicit simulated-scenario demo engine. The incoming unused simulator used invented pain cutoffs; it was not adopted.

## Executed verification

- 105 unit tests passed; formatting, lint, strict TypeScript and production build passed.
- 29 local Chrome browser scenarios passed against a production build: four portals, secure QR/manual tokens, adaptive assessment and escalation, five demo scenarios, nurse intake, placement conflicts/retry, doctor disposition, administrator staff provisioning, role restrictions, offline sync, reconnect/race handling, themes and mobile accessibility.
- Local database suites: 33 core assertions, 16 nurse-intake assertions, 20 bed assertions, 19 patient-portal groups passed.
- Rollback-only SQL checks passed for patient scope, roles, hospital isolation and operational lifecycles.
- Synthetic load: 20 parallel registrations, 20 simultaneous emergency alerts, 10 duplicate retries passed. This is a local baseline, not a production capacity certification.
- Authenticated Realtime delivery and disconnect/resubscribe recovery passed.
- Hosted database read-only verification: both patient/staff upgrades already applied; all 40 public tables have row-level security. No new database migration is required by this interface integration.

## Release result

Preview deployment `dpl_D9arzLrX6EJwn2XhhcceKkuBhhR8` is READY. Hosted browser smoke passed four portals, token-free demo, credential-required real access, nurse/doctor/admin sign-in and authorized workspaces, staff/resources pages, and no browser runtime exceptions. Six focused local browser checks also passed after the final rebuild; dependency audit found zero vulnerabilities. GitHub pull request #2 merged into main at `a7835b3d90acfa60acc5acdf8a20ecd17abbfa88`. PR CI run `46009657872` passed both verification and clean local-integration jobs. Production deployment `dpl_EzSWqHHf2uWvkMpdSTvsR6EgJpdy` is READY and the canonical alias was verified to point to it: https://mediroute-triage-platform.vercel.app. The production browser smoke passed the same six groups as preview. No error/fatal runtime logs were returned for the new deployment in the short post-deployment window; this does not establish long-term reliability.

Antigravity review was attempted in read-only mode. Its CLI returned DEADLINE_EXCEEDED after ten minutes with an empty report. No independent-review verdict is claimed. The parent inspected the changes and ran the executed checks above. The post-merge main CI rerun is still running at this documentation update; the tested app source is identical to the passing PR run. Clinical validation, approved protocols and real operational use remain outside this synthetic prototype release. Preview and production share the existing synthetic Supabase project; mutation-heavy acceptance tests run locally.
