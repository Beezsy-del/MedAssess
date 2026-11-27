# Role permissions

Roles come from active `hospital_memberships`, never user-editable metadata. `src/features/access/policy.ts`, protected API routes and SQL command/RLS policies enforce these restrictions; navigation alone is not authorization.

| Operation                                                                                    | Allowed roles                                                                                        |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Registration and QR/manual pass issuance                                                     | Receptionist, nurse, triage nurse; doctor denied                                                     |
| Patient questionnaire/status                                                                 | Valid scoped, expiring encounter capability only                                                     |
| Clinical brief, vitals and reassessment                                                      | Eligible nurse, triage nurse, doctor; emergency coordinator has scoped clinical reads                |
| Clinical protocol configuration/review                                                       | Doctor; software review does not establish medical validity                                          |
| Diagnosis, treatment disposition, investigations, discharge, admission and referral creation | Doctor                                                                                               |
| OPD routing and doctor intervention request                                                  | Eligible clinical roles, with reviewed destination/urgency restrictions                              |
| Internal referral acknowledgement and movement                                               | Eligible clinical roles/emergency coordinator, receiving-department membership and transition checks |
| Bed suitability review                                                                       | Nurse, triage nurse, doctor                                                                          |
| Bed allocation/release                                                                       | Clinical roles, emergency coordinator, resource manager; reviewed suitability required               |
| Bed/ward configuration and maintenance                                                       | Hospital/super administrator, resource manager, emergency coordinator                                |
| Bed cleaning and status transitions                                                          | Authorized staff; role, active allocation and transition checks still apply                          |
| Hospital settings, departments, staff roles and equipment configuration                      | Hospital/super administrator                                                                         |
| Staff account creation                                                                       | Hospital/super administrator in synthetic demo hospital; server-only Auth secret                     |
| Operational patient directory and reports                                                    | Authorized administrative/resource roles with clinical fields redacted                               |
| Password update                                                                              | Authenticated active staff account; application refuses shared demo account changes                  |

Clinical encounter access requires an eligible clinical role and at least one of: emergency/RED, explicit assignment, no department yet, membership in its department, or an active referral to the caller's department. Administrators receive operational snapshots rather than raw patient reports or clinical notes. No cross-hospital access is allowed. Direct writes to clinical application tables are denied to normal roles; protected transactional commands record responsible users and history.

Patients cannot retrieve clinical notes or alter urgency/resources. Doctors cannot register patients or issue passes. Administrators cannot perform clinical assessments or override decisions. Nurses cannot administer memberships or hospital settings. Route, API, SQL and multi-tenant regression tests exercise these boundaries.

Clinical operations remain disabled by database constraints. Shared demo identities are intentionally public and unsuitable for real care. Synthetic staff provisioning and role editing work; production invitation/activation policy, SMTP delivery, identity recovery governance and independent security review remain external requirements.
