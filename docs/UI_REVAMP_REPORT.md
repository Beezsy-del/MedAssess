# MedCipher UI/UX Revamp Report

**Branch:** `afnan-fixes-and-features`
**Base:** `main`
**Scope:** Design system modernization, global burgundy/plum/gold gradient identity, application shell & navigation overhaul, responsive & WCAG 2.2 AA accessibility hardening, bug fixes, and browser verification.

---

## 1. Design Direction & Color System

MedCipher's interface was unified around a calm, high-trust healthcare enterprise aesthetic built on its burgundy and gold foundation, avoiding decorative clutter while using coordinated gradients intentionally on brand surfaces, primary actions, active navigation, and section highlights.

### Core Palette & Tokens (`src/app/tokens.css`)

| Role                     | Light token                | Dark token                          | Usage                                                    |
| ------------------------ | -------------------------- | ----------------------------------- | -------------------------------------------------------- |
| Deep Burgundy / Primary  | `#651D38`                  | `#E798B4` (text) / `#8F2D52` (fill) | Brand anchors, links, active states                      |
| Rich Wine / Deep Plum    | `#763451`, `#51304C`       | `#713B63`, `#37172B`                | Gradient depth, coordination banner                      |
| Muted Rose / Lilac       | `#96708A`, `#8B6B91`       | `#9C7CA2`                           | Secondary hover borders, gradient tail                   |
| Warm Gold Accent         | `#A38143` (`#826227` text) | `#DFBA74`                           | Reassessment highlights, accent rules, focus ring (dark) |
| Canvas / Surface         | `#F5F6F8` / `#FFFFFF`      | `#0B1220` / `#111D30`               | App canvas and neutral readable cards/tables             |
| Primary / Secondary Text | `#252634` / `#565B6C`      | `#EEF1F7` / `#B0BCCF`               | High-contrast clinical typography                        |

### Gradient System

- **Primary brand gradient (`--gradient-brand`):** `linear-gradient(135deg, #651D38 0%, #713B63 55%, #8B6B91 100%)` — applied to primary buttons, active left-rail items, selected queue filter tabs, brand emblem, and user avatar.
- **Hero / coordination gradient (`--gradient-hero`):** Deep plum/burgundy gradient with subtle warm gold radial highlight — applied to the login story panel and compact dashboard coordination strip.
- **Subtle surface gradient (`--gradient-surface-subtle`):** `linear-gradient(135deg, rgba(101, 29, 56, 0.08), rgba(163, 129, 67, 0.07))` — applied to the hospital context bar, workspace modal active links, info strips, and count pills.
- **Clinical urgency isolation:** `RED`, `YELLOW`, `GREEN`, and `ASSESSMENT_REQUIRED` (`BLUE`) retain isolated, high-contrast solid surfaces, borders, text labels, and indicator dots — never mixed with decorative brand gradients.

---

## 2. Typography & Design Tokens

- **Fonts (`src/app/layout.tsx`):** Self-hosted `Plus Jakarta Sans` (`--font-sans`) for crisp clinical legibility and `JetBrains Mono` (`--font-mono`) for encounter references (`ENC-…`), entity IDs, and record codes, via `next/font/google`.
- **Readability floor:** Eliminated `9px`–`11px` micro-text on badges, statuses, and table cells; standardized on `12px` minimum for metadata/badges, `13px`–`14px` for operational tables and controls, and `15px`–`18px` (with Large Text toggle) on patient-facing screens.
- **Tabular numerals:** Enforced `font-variant-numeric: tabular-nums` on KPI metrics, queue wait times, bed counts, department capacities, and vitals.
- **Browser surfaces:** Styled `::selection`, `caret-color`, `:focus-visible`, and `prefers-reduced-motion` rules centrally in `src/app/globals.css`.

---

## 3. Navigation & Major Screen Improvements

- **Enterprise Application Shell (`src/features/workspace/shell.tsx`):**
  - Replaced the desktop floating dock with a sticky left navigation rail grouped into _Care & queues_, _Operations_, and _Management_, preserving `<nav aria-label="Quick navigation">` and `"Open navigation: Workspace"` modal parity.
  - Added mobile bottom dock layout (`< 1024px`) with bottom workspace padding (`84px`) so content and buttons are never covered.
  - Added full route breadcrumb resolution, in-modal encounter search for mobile/tablet viewports, spinning refresh feedback (supporting overlapping supersedes), logout busy guard, and auto-dismissing toast with Lucide `<X />`.
- **Dashboard (`src/features/workspace/overview.tsx` & `patient-table.tsx`):**
  - Compacted the coordination banner so KPI metrics, patient queue, review flags, and department capacity appear in the initial `1440×900` viewport.
  - Added filter `Clear filters` / `Reset filters` recovery and fixed missing-patient search fallback.
- **Encounter Details (`src/features/workspace/encounter.tsx`):**
  - Resolved the `Patient queue` / `Review bed placement` link overlap via `.encounter-bar`.
  - Grouped `Next step` actions into Primary Flow Transition, Clinical Actions, and Coordination, cleared stale modal errors on open, and upgraded `Schedule follow-up` to `datetime-local` normalized to `+05:30` ISO (`src/lib/date-ist.ts`).
- **Patient Portal (`src/features/patient/portal.tsx`):**
  - Added initial loading skeleton, busy/error guards on emergency requests, `aria-pressed` state on Large Text and Voice input (with Stop button), human-readable `Status` pill, and 4-step `Visit progress` indicator.
- **Operations (`src/features/operations/views.tsx`, `beds/bed-management.tsx`, `app/(staff)/[...section]/page.tsx`):**
  - Surfaced equipment inventory clearly on `/resources` alongside the physical bed map, added derived `Triage category mix` chart in `Analytics`, formatted `Audit trail` details into `.audit-pill` chips with linked encounter references, added `disabled={busy}` guards on `Referrals` and `Settings`, and replaced manual ISO strings with `datetime-local` inputs for shift scheduling.
- **Public & Auth (`src/features/patient/login.tsx`, `src/app/emergency/page.tsx`, `src/app/patient/start/page.tsx`, `public/offline.html`):**
  - Added show/hide password toggle and clear error/status styling on `/login`, stacked emergency guidance cleanly on `/emergency`, and unified icon/manifest/offline pages with the burgundy/plum/gold identity.

---

## 4. Verification Summary

- **Unit tests (`npm test`):** 8 test files, 75 tests passed (72 existing + 3 new tests in `tests/ui-helpers.test.ts`).
- **Static checks (`npm run lint`, `npm run typecheck`, `npm run build`):** Passed with zero ESLint errors/warnings, zero TypeScript errors, and clean Next.js 16.4.6 production build.
- **Browser & Axe audit (local synthetic Supabase emulator):** All 22 routes verified in Light mode, Dark mode, and 8 responsive widths (`1920`, `1440`, `1280`, `1024`, `768`, `430`, `390`, `360`) with `0` console/page errors, `0` failed requests, `0` serious/critical Axe violations, and `0` horizontal overflows.
- **Playwright E2E (`BASE_URL=http://localhost:3001`):** 8/8 UI/accessibility/offline/theme/hospital-selection tests in `tests/e2e/workflows.spec.ts` passed (`22.6s`) and the physical bed map keyboard/theme/Axe test in `tests/e2e/beds.spec.ts` passed (`4.3s`) after fixing `aria-prohibited-attr`. Full database-RPC E2E tests and `scripts/integration-check.mjs` require configured `DEMO_*` credentials in `.env.local` and were not run against production Supabase.
- **Screenshots:** Before/after captures inspected locally in session scratch storage (`scratch/before/` and `scratch/after/`).

## 7. Pass 2 Enhancements: Custom Branding, Patient Portal & Track Board Ergonomics

1. **Custom MedCipher Brand Mark & Clinical Iconography (`src/components/icons.tsx`, `src/app/icon.svg`, `public/icon.svg`, `src/components/chrome.tsx`):**
   - Crafted a geometric shield-cross-ECG emblem with a champagne-gold node for the MedCipher logo (`MedCipherLogo`) and favicon assets.
   - Built 13 dual-tone clinical workflow SVG icons (`OverviewPulseIcon`, `PatientIntakeIcon`, `ReceptionDeskIcon`, `AcuityShieldIcon`, `StethoscopeCrossIcon`, `EmergencyBeaconIcon`, `FlowJunctionIcon`, `BedBayIcon`, `DepartmentUnitIcon`, `ReferralTransferIcon`, `AnalyticsTrendIcon`, `AuditSealIcon`, `VitalsMonitorIcon`, `PatientPortalIcon`) and wired them into `src/features/workspace/shell.tsx`, `src/components/chrome.tsx`, `/login`, `/emergency`, `/patient/start`, `/patient-portal`, and the Overview & Track Board.
2. **4-Portal Hub & Patient Intake Restoration (`src/features/patient/login.tsx`, `src/app/patient-portal/page.tsx`, `src/app/patient-portal/demo/page.tsx`, `src/features/patient/demo-portal.tsx`):**
   - Added the **Patient Intake Portal** card on `/login` alongside **Doctor**, **Triage nurse**, and **Administrator**.
   - Created `/patient-portal` (gateway for interactive simulation + private 64-character token / QR pass opening) and `/patient-portal/demo` (multilingual EN/KN/HI 4-step intake simulator, illustrative QR pass generation via `qrcode`, red-flag screening via `emergencySigns`, and live wait-time worsening / escalation timeline).
3. **ED Command Track Board & Quick-Peek Clinical Drawer (`src/features/workspace/overview.tsx`, `src/features/workspace/patient-table.tsx`, `src/app/globals.css`):**
   - Replaced the generic hero banner with a clickable **Shift Acuity Census** bar + workspace quick tiles.
   - Added left-edge acuity rails, wait-time threshold tiers (`normal`, `elevated >=30m`, `critical >=60m` or overdue reassessment), milestone chips (`Vitals`, `Triage`, `Bed bay`, `Intake` from live `Snapshot` data), clinician initials badges, and an `Escape`-dismissible **Quick-Peek Clinical Brief** slide-over drawer.
4. **Pass 2 Verification (against local dev server + synthetic emulator):**
   - `npm run lint`, `npm run typecheck`, Prettier check on all changed files, `npm test` (8 files, 75 tests), and `npm run build` all exited `0`.
   - Playwright E2E (`10` targeted UI/offline/portal/bed-map tests across `tests/e2e/workflows.spec.ts` and `tests/e2e/beds.spec.ts`) passed (`10/10`); live-DB RPC mutation test `staff demo, persisted registration, assessment and discharge` remains gated on a live Supabase backend (`tests/e2e/workflows.spec.ts:28` fails in local in-memory mock mode).
   - Playwright + Axe verification across `/login`, `/patient-portal`, `/patient-portal/demo`, and `/dashboard` (light & dark themes, `360px`–`1440px`) reported `0` console/page errors, `0` serious/critical Axe violations, and `0` horizontal overflows.
