# Deployment status

Verified 20 November 2026. This is a synthetic demo deployment; full master acceptance remains incomplete (see MASTER_AUDIT.md).

| Item               | Verified status                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| GitHub             | https://github.com/Beezsy-del/MedAssess — main pushed; existing initial commit preserved                                         |
| Application source | ce0ec097352a11d70c14876879cd10483bd9c838                                                                                         |
| GitHub CI          | Run 44734969125 passed verify; protected integration job skipped because credentials/flag are not configured                     |
| Supabase           | MedAssess, kkfqxlwwcwhnmhmsqitx, Mumbai; five migrations applied; 28/28 public tables have RLS                                   |
| Vercel project     | medcipher-triage-platform / prj_b5W03SkZFPbvjjRhs5JVbupkQalN; team bloodflow                                                     |
| Preview            | https://medcipher-triage-platform-611uuh1jw-bloodflow.vercel.app — READY; six hosted Playwright scenarios passed in 45.5 seconds |
| Production         | https://medcipher-triage-platform.vercel.app — READY; dpl_Bikr9hyMB9cvRC2XTRmC754znZmg                                           |
| Environment        | Supabase public URL/key and synthetic demo account secrets configured through encrypted provider environment variables; Node 24  |
| Deployment method  | Authenticated direct source upload from the committed tree                                                                       |
| Git integration    | Vercel GitHub app is not installed for this repository; automatic deploy-on-push is not connected                                |

Vercel deployment protection remains enabled. Acceptance tests use a temporary automation bypass scoped only to this host. No service-role key was required. No database reset or force push was performed. Supabase password recovery redirect/provider email delivery and leaked-password protection need account-side setup. Browser tests exercise real synthetic Auth, registration, QR intake, clinical workflow, offline recovery, accessibility and hospital access controls; they do not constitute complete master acceptance or clinical validation.
