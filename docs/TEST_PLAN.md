# Test plan

## Local static and domain checks

Run formatting verification, ESLint without suppressing errors, strict TypeScript, Vitest and production build. Dependency audit must fail for high/critical advisories. Domain tests exercise all configured emergency signs, missing data, decimal scores, queue hierarchy, deterministic ties, state transitions and aggregate forecasting.

## Hosted integration

Run `node --env-file=.env.local scripts/integration-check.mjs` only against the dedicated synthetic project. It signs in as real demo doctor/nurse accounts and exercises registration, token scope, duplicate operation handling, emergency reporting, role restrictions, immutable assessments, stale-version rejection, concurrent resource allocation, score persistence, bed-required admission, occupancy, referral stages and alert timestamps.

Run `tests/rls.sql` through privileged Supabase SQL tooling. Its fixtures are transaction-scoped and rolled back. Check two hospitals, anonymous access, direct writes, self-assigned roles, token table secrecy, audit restrictions and foreign-hospital commands. Re-run security advisors after schema changes.

## Browser scenarios

`npm run test:e2e` uses Playwright and axe:

- Real staff demo sign-in; registration → QR → assessment → documented discharge; reload confirms persistence.
- Patient language switch, emergency assistance before intake, completed intake, mobile layout.
- Offline registration on an already-open authorized staff page and reconnect synchronization.
- Dashboard contrast/semantic audit and widths 768, 390 and 320; mobile navigation.
- Unauthenticated staff route denial and public emergency instructions.

The browser suite runs against localhost by default. Set BASE_URL only to a dedicated synthetic preview. Keep traces disabled because they could include session/token data. Screenshots contain synthetic data only.

## Not yet covered

Full all-role/all-route E2E matrix, external SMS/push, clinically reviewed scenarios, large queue/load behavior, real staff invitations and recovery emails, hardware voice permissions, long-duration outages, background worker delivery and deployed acceptance. Passing software tests is not clinical validation.
