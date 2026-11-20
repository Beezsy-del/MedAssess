# MedCipher

An integrated clinical triage and hospital-flow **prototype using synthetic data only**. Built with Next.js 16.4.6, React 19.3, strict TypeScript, Tailwind CSS and a live Supabase PostgreSQL/Auth backend.

**Not clinically validated. Not for real patient data or operational clinical use.** The database refuses clinical workflow commands for non-demo hospitals and prevents enabling the clinical-use setting. Emergency assistance must never wait for registration, authentication or QR scanning.

## Run locally

```sh
npm ci
cp .env.example .env.local # only for a new checkout; do not overwrite configured secrets
# Configure Supabase URL and publishable key in .env.local.
npm run dev
```

Open [the local application](http://localhost:3000). This workspace already has a configured, ignored `.env.local`. The sign-in page offers **Doctor**, **Triage nurse**, and **Administrator** demo access. These use dedicated Supabase accounts and protected memberships, not a client-side role switch. Account passwords are never included in Git.

## Working workflows

- Reception → permanent patient / new encounter → expiring, hashed QR token → patient intake → staff queue.
- Patient emergency request before intake completion → RED escalation → recipient-routed in-app alerts.
- Human clinical assessment → original recommendation and confirmed category → recorded vital signs → reassessment deadline.
- Deterministic queue hierarchy; unvalidated decimal scores never override category or affect ranking.
- SmartFlow transitions → clinician assignment → care notes / investigations → doctor-approved disposition.
- Transactional bed and equipment reservations; unique active reservation prevents double allocation.
- Referral directory and contact/acceptance/departure/arrival/completion workflow.
- IndexedDB registration outbox on an already-open authorized staff screen; idempotent reconnection sync.
- Hospital aggregates, department capacity, baseline arrival forecasting with insufficient-history handling.
- Role-aware configuration, staff shift scheduling, append-only audit history and aggregate CSV export.

See [feature acceptance status](docs/FEATURE_STATUS.md) for incomplete requirements. This is a working integrated core, **not completion of every item in the supplied master specification**.

## Verification

```sh
npm run check
node --env-file=.env.local scripts/integration-check.mjs
npm run test:e2e
```

The hosted integration suite creates synthetic records and retains their histories. Playwright uses installed Chrome locally and downloaded Chromium in CI. `tests/rls.sql` runs transaction-scoped isolation checks and rolls back its fixtures. Never execute tests against a clinical environment.

```sh
node --env-file=.env.local scripts/archive-demo-tests.mjs
```

This demo-only administrator operation archives encounters named `Synthetic …`, revokes tokens, releases reservations and records events. It does **not** delete records or reset a database. Seeded five-patient scenarios remain intact.

## Project map

- `src/features/clinical`: demonstration warning-sign handling and assessment UI.
- `src/features/queue`: deterministic ranking and explanations.
- `src/features/flow`: explicit patient state transitions.
- `src/features/registration`, `patient`, `offline`: staff/patient entry and local outbox.
- `src/features/workspace`, `operations`: staff interfaces and hospital operations.
- `src/lib/supabase`: typed SSR/browser clients and generated database types.
- `supabase/migrations`: applied additive schema and workflow migrations.
- `tests`: domain, browser and RLS checks.

## Infrastructure

Supabase project: **MedAssess**, reference `kkfqxlwwcwhnmhmsqitx`, Mumbai (`ap-south-1`). The project was inspected empty before migrations. Four migrations are applied. Git is initialized on `main`; remote repository and Vercel deployments are not yet created because account access is blocked. See [deployment status](docs/DEPLOYMENT_STATUS.md).

## Documentation

[Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE_SCHEMA.md) · [API](docs/API.md) · [Permissions](docs/ROLE_PERMISSIONS.md) · [Clinical safety](docs/CLINICAL_SAFETY.md) · [Test results](docs/TEST_RESULTS.md) · [Security audit](docs/SECURITY_AUDIT.md) · [Demo guide](docs/DEMO_GUIDE.md) · [Limitations](docs/KNOWN_LIMITATIONS.md)

GitHub repository: [MedAssess](https://github.com/Beezsy-del/MedAssess). Product brand: MedCipher.
