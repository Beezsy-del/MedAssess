# BloodFlow reference remodel — 20 November 2026

Reference: https://bloodflow-q.vercel.app/. Inspected the public landing screen, dashboard, workspace navigation and theme control in a real browser. The reference informed layout and visual treatment; no reference patient records, assets, branding or unsupported feature claims were imported.

Applied the previously installed frontend-design and Emil Design Engineering skills. The user's explicit reference sets the visual direction. This supersedes the sidebar and continuous metric strip described in the earlier UI_REFINEMENT.md.

## Implemented scope

- Replaced the persistent sidebar with a workspace header, searchable encounter navigation, hospital context, accessible workspace dialog and five-destination floating dock.
- Added a navy dashboard overview with a subtle grid, raspberry primary actions, live encounter-stage counts and working links to registration, clinical assessment and resources.
- Rebuilt shared typography, spacing, panels, tables, status badges, forms, resource cards, flow board, reports, notifications, encounter details, dialogs and responsive layouts.
- Remodeled staff login, password recovery, patient intake/status, emergency guidance and registration information. Updated loading/error presentation, application icon, manifest colors and offline fallback styling.
- Added light/dark themes with device-local preference persistence, cross-tab preference updates, and an initial theme script to avoid a light flash. Theme storage contains no patient data.
- Preserved explicit urgency labels, emergency guidance, synthetic-data notices, clinical-operation restrictions and data-coverage disclosures. Dashboard figures use the authenticated hospital snapshot.
- Fixed visible/accessibility label mismatches discovered by axe. Shared dialogs now restore focus to their invoking control and expose their title as an accessible name.

## Verification

Evidence and screenshots are in ignored output/remodel-* files. The browser suite exercises persisted registration/assessment/discharge, patient emergency and language controls, encrypted offline retry, mobile layout, authorization, hospital selection, API failures, stale responses, theme persistence and keyboard navigation. Final results are recorded below after execution.

No dependency, database schema, RLS policy, clinical rule or tenant authorization change is part of this remodel. Existing gaps and the four separate readiness decisions in READINESS_AUDIT.md still apply. Automated axe scans do not establish complete accessibility conformance or replace manual assistive-technology testing.

Route audit: 16 routes in both light and dark themes (dashboard, reception, triage, doctor, emergency centre, SmartFlow, resources, departments, referrals, analytics, notifications, settings, audit, emergency guidance, patient start and password recovery) produced zero serious/critical axe findings. Page-level overflow checks passed at 1440, 768, 390 and 320px after waiting for browser resize/layout frames. The initial immediate-resize probe reported transient widths; a settled layout probe and direct mobile navigation verified no persistent overflow. No runtime page errors were observed in the route audit.

The first theme/navigation test exposed missing dialog focus restoration; the shared component was fixed and that test subsequently passed. One later development-server run timed out entering the dashboard during concurrent development/build activity; it is not counted as a passing run. Final production-build browser results are recorded separately below.

Final local release checks: `npm run check` passed formatting, ESLint, strict TypeScript, all 55 unit tests and the Next.js production build. All nine Playwright scenarios passed against `next start` on port 3001 in 45.5 seconds. The custom unavailable-page screen rendered in a production-build browser check. No tests were disabled or assertions weakened.
