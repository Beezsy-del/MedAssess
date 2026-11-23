# MediRoute project instructions

Read docs/PRODUCT_REQUIREMENTS.md for the original milestone requirements. Product brand is MediRoute; workspace and existing Supabase project are named MedAssess.

- Build integrated Next.js App Router / strict TypeScript / Supabase workflows. Keep features, domain rules, persistence, and UI separate.
- This is a synthetic hackathon prototype, never a validated clinical system. Clinical operational use must remain disabled without reviewed protocols.
- Emergency assistance never depends on registration, QR, authentication, or a score. Unknown information stays unknown. Never infer GREEN from absent warnings.
- Clinical urgency outranks numerical score. Waiting time creates reassessment tasks, never silently changes urgency. Preserve original recommendations and human decisions.
- Use protected hospital memberships, server-side authorization, tenant RLS, immutable audit history, and transactional mutations. No user metadata authority or public patient table policies.
- Tokens are random, scoped, expiring, hashed at rest, and revocable. Never log raw tokens or put PHI in QR codes.
- Offline storage is device-local; no claim of disconnected multi-device communication. Never cache patient API responses in the service worker.
- Use only synthetic demo data. Do not reset remote databases, force push, leak credentials, or report provider success without verification.
- Pin dependencies and commit lockfiles. Run formatting, lint, typecheck, meaningful tests, and production build. Document actual results and unresolved limitations.
- Maintain docs/IMPLEMENTATION_PLAN.md, docs/FEATURE_STATUS.md and docs/KNOWN_LIMITATIONS.md as work progresses.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
