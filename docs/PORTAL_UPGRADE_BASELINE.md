# Patient portal and role-workflow baseline

Baseline: `b051ada`, existing repository https://github.com/Beezsy-del/MedAssess; branch `feat/patient-portal-role-workflows`. User confirmed that the MediRoute hostname in the supplied prompt means this existing MediRoute application: https://medcipher-triage-platform.vercel.app. No replacement project will be created.

Stack: Next.js 16.4.6 App Router, React 19.3.0, strict TypeScript, Supabase Auth/PostgreSQL/Realtime, Zod, Vitest and Playwright. Existing Vercel project `prj_b5W03SkZFPbvjjRhs5JVbupkQalN`, bloodflow team, Node 24. The deployment uses source uploads; no linked Git repository is returned by project metadata. Existing remote and history are preserved.

## Existing functionality and gaps

| Area             | Observed implementation                                                                                              | Required change                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Patient access   | 256-bit hashed expiring/revocable encounter token; QR, protected RPC and one-use intake                              | Manual-token entry, repeated symptom updates, saved progress and patient urgency cards                     |
| Questionnaire    | Symptoms, duration, pain, progression and free-text history; three languages and optional browser dictation          | Structured adaptive branches, medication/allergy details, assistance, review and server-saved drafts       |
| Clinical support | Emergency override; otherwise ASSESSMENT_REQUIRED; immutable clinician assessment history                            | Versioned reviewed configuration, separate preliminary/final states, change history; never infer normality |
| Nurse            | Integrated registration/triage, queues, observations, notes, reassessment and bed handoff                            | Queue-centered nurse workspace, expandable medical brief, dedicated OPD routing and escalation actions     |
| Doctor           | Existing assessments, notes, investigations, admission/discharge/follow-up and external referrals                    | Remove registration/token privileges throughout UI/API/SQL; add department referral lifecycle              |
| Administrator    | Generic clinical-oriented dashboard and navigation; configuration and resources                                      | Operational patient directory, persistent resource sidebar, no clinical notes/decision controls            |
| Roles            | Protected memberships and tenant RLS; route UI broadly shared; doctors currently can register                        | Formal route/action/data permissions, direct-route denial and restricted operational views                 |
| Resources        | Physical zones, compatible reviewed placement, holds, cleaning, maintenance, BLOCKED, audit and concurrency guards   | Preserve these controls; present BLOCKED as unavailable; add table/summary layout for administrators       |
| Realtime         | Hospital subscriptions with coalesced refresh and 30-second fallback                                                 | Patient status updates, new workflow subscriptions, reconnect and stale-state protection                   |
| Timers           | Reassessment/escalation evaluated during staff snapshots                                                             | Reviewed category/stage settings and scheduled reconciliation, without time-only category escalation       |
| Staff management | Membership and shift directory; no in-product account invitation/role management                                     | Safe scoped management of staff access and department eligibility; no self elevation                       |
| Privacy          | Clinical tables restrict admin reads, but encounter intake/symptoms and audit details remain broadly tenant-readable | Enforce clinical data restrictions in SQL, not only hide components                                        |

All advertised major existing forms call the command API/RPC, but authorization is sometimes enforced only after opening an inappropriate shared UI. Existing New patient pass, registration, patient-flow and clinical navigation are visible to roles that this specification now restricts. There is no functional manual token form, adaptive symptom update, internal referral or OPD action to preserve; these must be implemented.

## Baseline verification evidence

Previous source CI run 44841263814: formatting/lint/types, 72 unit tests, build and audit passed; 69 hosted database assertions passed; browser suite 8 passed/9 failed. All four bed scenarios passed. Failures involved intake acknowledgement and sign-in/workspace-loading timeouts. Supabase logs independently showed authentication 504s. Do not assume every failure is external or repeat a claim that full acceptance is green.

Fourteen migrations, 32 exposed public tables with RLS. Existing policies, API routes, command/schema validation, snapshot queries, patient RPC, role dashboards and workflow components inspected. The patient table and encounter identity are retained. Database changes must be additive and version-controlled.

## Delivery and safety constraints

Production must remain unchanged until a verified preview passes the new acceptance suite. The existing preview and production share one synthetic Supabase database, and there is no separate development branch. Docker/PostgreSQL are not currently installed locally. Database isolation must be resolved before applying incompatible role/privacy changes. A provider development branch incurs charges and requires explicit cost consent under the Supabase tool contract; no branch has been created.

No reviewed clinical protocol, approved translation or validated symptom-condition mapping has been provided. Implement configurable reviewable software, synthetic fixtures and explicit missing-information handling; do not fabricate clinical approval, diagnoses or GREEN/YELLOW rules. Clinical operational use stays disabled. Waiting alone creates review tasks. Manual emergency assistance stays available without registration or authentication.
