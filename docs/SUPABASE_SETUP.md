# Supabase setup

Existing target verified: MedAssess / `kkfqxlwwcwhnmhmsqitx`, organization MedCypher, Mumbai `ap-south-1`, PostgreSQL 17.12. The public schema was empty before implementation. Four migrations have been applied via authenticated Supabase tooling.

Set `NEXT_PUBLIC_SUPABASE_URL` and the project's publishable key in environment configuration. The application does not require a service-role key for its current workflow; staff commands execute using the user's authenticated JWT, and patient access uses a narrowly scoped token gateway.

For a new dedicated synthetic environment, apply migrations in filename order. `scripts/prepare-demo.mjs` creates a local seed payload and random demo credentials in ignored files; it refuses to run when a fixture already exists. Review and apply its SQL only to a confirmed demo project through privileged tooling. It inserts dedicated synthetic Auth users and protected memberships. This is a development bootstrap, not the production staff-invitation workflow.

Configure Supabase Auth site URL and allowed callback URLs for the eventual preview/production domains. Recovery email delivery and invitation activation still need verification. Never enable public staff self-registration as a source of membership authority.

Realtime is published for patient_encounters, notifications and hospital_resources. RLS applies to authenticated subscriptions. Polling every 30 seconds provides fallback refresh and checks overdue alert escalation. A dedicated scheduled escalation worker is still needed for alerts when no staff workspace is open.

Run `tests/rls.sql` transactionally, the integration script, and the Supabase security advisor after migrations. Intentional security-definer gateways are documented in SECURITY_AUDIT.md; they are not a clean-advisor claim.
