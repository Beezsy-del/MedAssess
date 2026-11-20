# Database schema

The remote public schema contains 20 tables. Every exposed table has RLS. Authenticated clients have read grants only; all mutations use audited RPCs. Anonymous clients have no table grants.

| Area               | Tables                                                                        | Integrity boundaries                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization       | hospitals, hospital_memberships, departments, hospital_settings, staff_shifts | Protected staff roles; active memberships; department tenant keys; shift time checks                                                              |
| Patient access     | patients, patient_encounters, encounter_access_tokens                         | Separate patient and visit; composite tenant foreign keys; unique idempotency keys; SHA-256 token hashes and expiry                               |
| Clinical           | triage_protocol_versions, triage_assessments, vital_signs                     | Immutable assessment inserts; original and confirmed categories; measured values nullable; database range checks; reproducible demo score trigger |
| Flow               | patient_status_events, treatment_records                                      | Explicit state machine; actor and timestamp; documentation required; doctor-only disposition                                                      |
| Coordination       | notifications                                                                 | Recipient roles; validated lifecycle; acknowledgement and resolution timestamps; polling-triggered overdue escalation                             |
| Resources          | hospital_resources, resource_reservations                                     | Row locks plus unique partial active-reservation index; tenant composite FKs; admission occupancy trigger                                         |
| Referral           | referral_facilities, referrals                                                | Tenant-bound destination and encounter; sequential status validation; evidence required                                                           |
| Auditing / offline | audit_logs, offline_sync_events                                               | No normal-user update/delete grants; unique operation IDs; actor attribution                                                                      |

The private schema holds request-rate buckets. Security-definer helpers use an empty search path, fully qualified objects, and explicit execute grants. `staff_command` requires both an authenticated identity and an active protected hospital membership, then checks the operation-specific role. `patient_portal` is an intentional capability-token gateway with no unrestricted record reads.

## Migrations

1. `20261120102607_medcipher_core.sql`: schema, RLS, staff command gateway, token gateway, Realtime publication.
2. `20261120110742_clinical_and_operational_hardening.sql`: application conflict status, intake variable fix, persisted demonstration score, overdue escalation, explicit deny policies.
3. `20261120111013_operational_controls.sql`: bed occupancy trigger, recipient notification RLS, non-destructive demo archive.
4. `20261120111251_demo_reset_authorization.sql`: explicit rejection of users without a membership in the archive operation.

## Differences from the requested expanded schema

This implementation uses a compact schema. Medical history, allergies, medications, pregnancy and symptom duration are preserved as unverified intake JSON rather than separate normalized tables. Care notes represent treatment and investigations. Admission/discharge documentation uses treatment records plus immutable status events. Notification lifecycle details live in notification rows and audit events. Separate identifier, contact, follow-up, transport-event, recipient, rule-definition and aggregate-metric tables from the master specification are not implemented yet. These are acceptance gaps, not claims of equivalent completion.

Generated types are checked in at `src/lib/supabase/database.types.ts`. Re-generate after migrations through the authenticated Supabase tooling.

Migration filenames were aligned to the server-assigned versions returned by Supabase migration history; SQL bodies are unchanged. This prevents a later CLI push from treating applied migrations as new.
