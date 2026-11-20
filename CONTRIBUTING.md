# Contributing

Read AGENTS.md and docs/PRODUCT_REQUIREMENTS.md. Use Node 24 or newer and `npm ci`. Keep changes feature-based. Run `npm run check`; run the hosted integration and Playwright suites against dedicated synthetic data when changing workflows.

Never disable authorization, RLS, type checks or tests to make a feature work. Never create real clinical cutoffs or claim protocol validation. Database changes require additive migrations, tenant/role tests and a fresh advisor review. Do not edit applied migrations; add a corrective migration.

Production release requires completed acceptance checks and explicit owner approval. Keep infrastructure credentials in provider secret stores, not Git.
