# Role permissions

Roles live in `hospital_memberships`, not user-editable profile metadata. Every role is scoped to a hospital. Direct writes to application tables are denied for all normal roles.

| Operation                                            | Allowed roles                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Registration / emergency encounter                   | Receptionist, triage nurse, nurse, doctor, emergency coordinator                           |
| Token rotation                                       | Receptionist, triage nurse, nurse, doctor                                                  |
| Clinical assessment and vital signs                  | Triage nurse, nurse, doctor                                                                |
| Downgrade active emergency                           | Doctor, with recorded clinical reason                                                      |
| Clinical notes                                       | Doctor, nurse, triage nurse; investigations/admission/discharge kinds restricted to doctor |
| Ordinary flow transitions                            | Doctor, nurse, triage nurse, emergency coordinator                                         |
| Disposition, discharge, admission, referral/transfer | Doctor                                                                                     |
| Resource reserve/release                             | Resource manager, emergency coordinator, nurse, doctor                                     |
| Referral creation                                    | Doctor                                                                                     |
| Referral progress                                    | Doctor, emergency coordinator                                                              |
| Alert lifecycle                                      | Recipient role or hospital/super administrator                                             |
| Hospital configuration and shifts                    | Hospital/super administrator                                                               |
| Full audit read                                      | Hospital/super administrator                                                               |
| Demo archive                                         | Hospital/super administrator in an explicitly synthetic hospital                           |

Clinical assessment/vital/treatment table reads are limited to clinical roles and emergency coordinators. Demographics and encounter summaries are currently hospital-member scoped. Fine-grained assigned-patient/department-only reads are an outstanding requirement. No cross-hospital access is allowed.

Ordinary administrators cannot turn on clinical operation: a database CHECK constraint prevents it, and commands refuse non-demo hospitals. Invitations and privileged role administration require a secure provisioning process; an in-product invitation/activation workflow is not yet implemented.
