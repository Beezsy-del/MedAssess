# Master requirement acceptance ledger

Every bulleted or numbered requirement in the product specification is retained below, including repeated requirements. An unchecked item means final requirement-level acceptance is still outstanding; implemented subsets are evidenced in FEATURE_STATUS.md and TEST_RESULTS.md. This ledger must not be represented as a completed acceptance test.

Source: PRODUCT_REQUIREMENTS.md. Clinical operation remains disabled.

# MediRoute

# Milestone 0 — Product scope and safety requirements

## Project identity and requirements

## A. Product vision

- [ ] Government hospitals. (source line 15)
- [ ] Rural primary healthcare centres. (source line 16)
- [ ] Community health centres. (source line 17)
- [ ] District hospitals. (source line 18)
- [ ] Large hospitals. (source line 19)
- [ ] Multi-department healthcare facilities. (source line 20)

## B. Complete list of functional modules

### Module 1 — Patient registration and QR management

- [ ] Generate a unique patient encounter ID. (source line 32)
- [ ] Generate a secure QR code for every new encounter. (source line 33)
- [ ] Allow patients to scan the QR code using their smartphones. (source line 34)
- [ ] Open a mobile-friendly patient registration page. (source line 35)
- [ ] Collect patient information, symptoms, medical history and relevant information. (source line 36)
- [ ] Support assisted registration by receptionists and nurses. (source line 37)
- [ ] Support QR printing and manual token entry. (source line 38)
- [ ] Allow registration without a smartphone. (source line 39)
- [ ] Allow multiple hospital visits for the same patient. (source line 40)
- [ ] Distinguish a permanent patient record from an individual encounter. (source line 41)
- [ ] Maintain timestamps for arrival and registration. (source line 42)
- [ ] Support registration of unidentified emergency patients. (source line 43)

### Module 2 — Patient information and symptom collection

- [ ] Name. (source line 49)
- [ ] Age/date of birth. (source line 50)
- [ ] Sex where clinically relevant. (source line 51)
- [ ] Contact information where available. (source line 52)
- [ ] Primary symptoms. (source line 53)
- [ ] Secondary symptoms. (source line 54)
- [ ] Symptom duration. (source line 55)
- [ ] Symptom progression. (source line 56)
- [ ] Pain severity. (source line 57)
- [ ] Injuries. (source line 58)
- [ ] Bleeding. (source line 59)
- [ ] Breathing difficulties. (source line 60)
- [ ] Consciousness status. (source line 61)
- [ ] Existing medical conditions. (source line 62)
- [ ] Allergies. (source line 63)
- [ ] Current medications. (source line 64)
- [ ] Pregnancy information where relevant and appropriately collected. (source line 65)
- [ ] Previous relevant medical history. (source line 66)
- [ ] Patient-reported emergency warning signs. (source line 67)
- [ ] Vital signs when available. (source line 68)

### Module 3 — Intelligent clinical triage engine

- [ ] GREEN — Non-immediate care. (source line 80)
- [ ] YELLOW — Immediate/urgent assessment. (source line 81)
- [ ] RED — Critical/emergency. (source line 82)
- [ ] Emergency warning-sign screening. (source line 88)
- [ ] Emergency overrides. (source line 89)
- [ ] Vital-sign assessment. (source line 90)
- [ ] Symptom-severity evaluation. (source line 91)
- [ ] Relevant medical risk factors. (source line 92)
- [ ] Patient deterioration. (source line 93)
- [ ] Human clinical verification. (source line 94)
- [ ] Clinician override. (source line 95)
- [ ] Clinical reassessment. (source line 96)
- [ ] Clinical assessment history. (source line 97)
- [ ] Versioned triage protocols. (source line 98)
- [ ] Explainable decision results. (source line 99)

### Module 4 — Dynamic patient ranking

- [ ] Clinical urgency category. (source line 117)
- [ ] Emergency override. (source line 118)
- [ ] Clinician-assigned sub-priority. (source line 119)
- [ ] Patient deterioration. (source line 120)
- [ ] Reassessment status. (source line 121)
- [ ] Waiting time. (source line 122)
- [ ] Assessment status. (source line 123)
- [ ] Assigned department. (source line 124)

### Module 5 — Emergency notifications

- [ ] Assigned nurse. (source line 140)
- [ ] General-care queue. (source line 141)
- [ ] Triage nurse. (source line 145)
- [ ] Duty doctor. (source line 146)
- [ ] Urgent assessment area. (source line 147)
- [ ] Emergency team. (source line 151)
- [ ] Emergency coordinator. (source line 152)
- [ ] Duty doctor. (source line 153)
- [ ] Senior emergency clinician according to the hospital's configured escalation policy. (source line 154)
- [ ] Cardiac team. (source line 158)
- [ ] Stroke team. (source line 159)
- [ ] Trauma team. (source line 160)
- [ ] Surgical team when clinically requested. (source line 161)
- [ ] ICU/critical-care team. (source line 162)
- [ ] Bed coordinator. (source line 163)
- [ ] Referral coordinator. (source line 164)
- [ ] Instant in-app alerts. (source line 168)
- [ ] Real-time notification delivery. (source line 169)
- [ ] Alert acknowledgement. (source line 170)
- [ ] Staff assignment. (source line 171)
- [ ] Alert resolution. (source line 172)
- [ ] Escalation of unacknowledged alerts. (source line 173)
- [ ] Notification history. (source line 174)
- [ ] Read/unread status. (source line 175)
- [ ] Timestamps. (source line 176)
- [ ] Acknowledgement records. (source line 177)
- [ ] Backup escalation contacts. (source line 178)

### Module 6 — Nurse dashboard

- [ ] Newly registered patients. (source line 192)
- [ ] Patients awaiting triage. (source line 193)
- [ ] GREEN queue. (source line 194)
- [ ] YELLOW queue. (source line 195)
- [ ] RED emergency cases. (source line 196)
- [ ] Patients requiring reassessment. (source line 197)
- [ ] Patient medical summary. (source line 198)
- [ ] Vital-sign entry. (source line 199)
- [ ] Clinical verification. (source line 200)
- [ ] Priority update. (source line 201)
- [ ] Department assignment. (source line 202)
- [ ] Alert acknowledgement. (source line 203)
- [ ] Status change. (source line 204)
- [ ] Reassessment timer. (source line 205)
- [ ] Escalation functionality. (source line 206)
- [ ] Patient handover. (source line 207)

### Module 7 — Doctor dashboard

- [ ] Assigned patients. (source line 213)
- [ ] Emergency cases. (source line 214)
- [ ] Urgent cases. (source line 215)
- [ ] Pending examinations. (source line 216)
- [ ] Patient clinical history. (source line 217)
- [ ] Current symptoms. (source line 218)
- [ ] Vital-sign history. (source line 219)
- [ ] Clinical triage results. (source line 220)
- [ ] Priority explanation. (source line 221)
- [ ] Previous assessment records. (source line 222)
- [ ] Reassessment status. (source line 223)
- [ ] Treatment notes. (source line 224)
- [ ] Investigation requests. (source line 225)
- [ ] Admission decisions. (source line 226)
- [ ] Referral decisions. (source line 227)
- [ ] Discharge workflow. (source line 228)

### Module 8 — SmartFlow patient-flow management

- [ ] Discharged. (source line 240)
- [ ] Admitted. (source line 241)
- [ ] Referred. (source line 242)
- [ ] Transferred. (source line 243)
- [ ] Cancelled/no-show, with authorised handling. (source line 244)
- [ ] Patient inflow monitoring. (source line 250)
- [ ] Queue monitoring. (source line 251)
- [ ] Department-level patient tracking. (source line 252)
- [ ] Doctor workload. (source line 253)
- [ ] Nurse workload. (source line 254)
- [ ] Waiting-time tracking. (source line 255)
- [ ] Diagnostic waiting. (source line 256)
- [ ] Bed waiting. (source line 257)
- [ ] Referral waiting. (source line 258)
- [ ] Discharge tracking. (source line 259)
- [ ] Patient outflow analytics. (source line 260)

### Module 9 — Resource management

- [ ] Hospital beds. (source line 268)
- [ ] Emergency beds. (source line 269)
- [ ] ICU beds. (source line 270)
- [ ] Stretchers. (source line 271)
- [ ] Wheelchairs. (source line 272)
- [ ] Emergency equipment. (source line 273)
- [ ] Departments. (source line 274)
- [ ] Doctors. (source line 275)
- [ ] Nurses. (source line 276)
- [ ] Available staff shifts. (source line 277)
- [ ] Staff assignments. (source line 278)
- [ ] Department capacity. (source line 279)

### Module 10 — Referral and inter-hospital coordination

- [ ] Referral destination directory. (source line 297)
- [ ] Facility contact information. (source line 298)
- [ ] Available services and capabilities. (source line 299)
- [ ] Referral reason. (source line 300)
- [ ] Referring doctor. (source line 301)
- [ ] Referral clinical summary. (source line 302)
- [ ] Required transport. (source line 303)
- [ ] Ambulance coordination status. (source line 304)
- [ ] Receiving-hospital acknowledgement. (source line 305)
- [ ] Transfer status. (source line 306)
- [ ] Referral completion. (source line 307)

### Module 11 — Rural and offline functionality

- [ ] Web app manifest. (source line 317)
- [ ] Service worker. (source line 318)
- [ ] Offline application shell. (source line 319)
- [ ] Offline registration drafts. (source line 320)
- [ ] Offline encounter creation for authorised staff. (source line 321)
- [ ] IndexedDB persistence. (source line 322)
- [ ] Outbox-based synchronisation. (source line 323)
- [ ] Retry mechanisms. (source line 324)
- [ ] Idempotent operations. (source line 325)
- [ ] Synchronisation status. (source line 326)
- [ ] Conflict detection. (source line 327)
- [ ] Manual synchronisation. (source line 328)
- [ ] Recovery after internet disconnection. (source line 329)

### Module 12 — Administrator dashboard

- [ ] Total registrations. (source line 343)
- [ ] Current queue. (source line 344)
- [ ] Critical cases. (source line 345)
- [ ] Urgent cases. (source line 346)
- [ ] Non-immediate cases. (source line 347)
- [ ] Patients waiting for reassessment. (source line 348)
- [ ] Department workload. (source line 349)
- [ ] Available staff. (source line 350)
- [ ] Bed occupancy. (source line 351)
- [ ] Available emergency resources. (source line 352)
- [ ] Admissions. (source line 353)
- [ ] Discharges. (source line 354)
- [ ] Referrals. (source line 355)
- [ ] Transfers. (source line 356)
- [ ] Waiting-time summaries. (source line 357)
- [ ] Patient-flow analytics. (source line 358)

### Module 13 — Operational forecasting

- [ ] Expected patient arrival patterns. (source line 366)
- [ ] Peak hours. (source line 367)
- [ ] Department workload. (source line 368)
- [ ] Bed demand. (source line 369)
- [ ] Resource requirements. (source line 370)
- [ ] Potential staffing pressure. (source line 371)

### Module 14 — Security and privacy

- [ ] Supabase authentication. (source line 381)
- [ ] Role-based access control. (source line 382)
- [ ] Hospital-level data isolation. (source line 383)
- [ ] Row Level Security on all exposed tables. (source line 384)
- [ ] Server-side authorisation. (source line 385)
- [ ] Secure QR tokens. (source line 386)
- [ ] Token expiry and revocation. (source line 387)
- [ ] Rate limiting. (source line 388)
- [ ] Audit logs. (source line 389)
- [ ] Secure validation. (source line 390)
- [ ] Protected documents. (source line 391)
- [ ] Secure environment variables. (source line 392)
- [ ] No exposure of service-role credentials. (source line 393)
- [ ] Restricted patient information access. (source line 394)
- [ ] Appropriate privacy notices and consent handling. (source line 395)

### Module 15 — Testing and reliability

- [ ] Unit tests. (source line 403)
- [ ] Integration tests. (source line 404)
- [ ] End-to-end tests. (source line 405)
- [ ] Database tests. (source line 406)
- [ ] RLS tests. (source line 407)
- [ ] Authentication tests. (source line 408)
- [ ] Triage scenario tests. (source line 409)
- [ ] Queue-ordering tests. (source line 410)
- [ ] Notification tests. (source line 411)
- [ ] Offline synchronisation tests. (source line 412)
- [ ] Resource allocation concurrency tests. (source line 413)
- [ ] Accessibility tests. (source line 414)
- [ ] Responsive layout tests. (source line 415)

## C. Permanent technical requirements

- [ ] Next.js App Router. (source line 425)
- [ ] TypeScript with strict mode. (source line 426)
- [ ] React. (source line 427)
- [ ] Tailwind CSS. (source line 428)
- [ ] shadcn/ui or accessible equivalent components. (source line 429)
- [ ] Supabase PostgreSQL. (source line 430)
- [ ] Supabase Auth. (source line 431)
- [ ] Supabase Realtime where appropriate. (source line 432)
- [ ] Supabase Storage only for required protected files. (source line 433)
- [ ] `@supabase/ssr` for cookie-based Next.js sessions. (source line 434)
- [ ] IndexedDB for offline drafts/outbox. (source line 435)
- [ ] Vercel for hosting. (source line 436)
- [ ] GitHub for version control. (source line 437)
- [ ] UI components. (source line 445)
- [ ] Server actions and route handlers. (source line 446)
- [ ] Database access. (source line 447)
- [ ] Business logic. (source line 448)
- [ ] Clinical triage rules. (source line 449)
- [ ] Queue algorithms. (source line 450)
- [ ] Notification adapters. (source line 451)
- [ ] Resource allocation. (source line 452)
- [ ] Offline synchronisation. (source line 453)
- [ ] Tests. (source line 454)

## D. Critical clinical safety requirements

## E. Development discipline

- [ ] Inspect the complete repository. (source line 480)
- [ ] Inspect all existing files and configuration. (source line 481)
- [ ] Detect whether this is an empty project or an existing application. (source line 482)
- [ ] Never overwrite an existing working project without examining it. (source line 483)
- [ ] Establish the implementation plan. (source line 484)
- [ ] Create a permanent `AGENTS.md` containing project instructions. (source line 485)
- [ ] Create documentation explaining the architecture and feature modules. (source line 486)
- [ ] Maintain a development checklist. (source line 487)
- [ ] Maintain a known-issues register. (source line 488)
- [ ] Implement the requested functionality. (source line 492)
- [ ] Run formatting. (source line 493)
- [ ] Run lint. (source line 494)
- [ ] Run TypeScript checks. (source line 495)
- [ ] Run relevant tests. (source line 496)
- [ ] Run a production build when appropriate. (source line 497)
- [ ] Fix errors rather than hiding or disabling checks. (source line 498)
- [ ] Update documentation. (source line 499)
- [ ] Update the milestone checklist. (source line 500)
- [ ] Report completed features and remaining blockers. (source line 501)

## F. Final outcome

- [ ] A working patient portal. (source line 515)
- [ ] A working reception and QR registration interface. (source line 516)
- [ ] A working clinical triage engine. (source line 517)
- [ ] A working dynamic queue. (source line 518)
- [ ] A working nurse interface. (source line 519)
- [ ] A working doctor interface. (source line 520)
- [ ] A working emergency coordination interface. (source line 521)
- [ ] A working resource management interface. (source line 522)
- [ ] A working SmartFlow module. (source line 523)
- [ ] A working admin dashboard. (source line 524)
- [ ] Working offline registration and synchronisation. (source line 525)
- [ ] Working referral and discharge management. (source line 526)
- [ ] An operational analytics dashboard. (source line 527)
- [ ] A Supabase database with migrations and RLS. (source line 528)
- [ ] A GitHub repository. (source line 529)
- [ ] A Vercel preview deployment. (source line 530)
- [ ] A tested production deployment once configuration and approval are complete. (source line 531)

# Milestone 1 — PROJECT INITIALISATION, ARCHITECTURE AND PROFESSIONAL UI

### 1. Repository inspection

- [ ] Existing framework. (source line 543)
- [ ] Package manager. (source line 544)
- [ ] Existing components. (source line 545)
- [ ] Configuration. (source line 546)
- [ ] Git status. (source line 547)
- [ ] Existing remotes. (source line 548)
- [ ] Existing deployments or Supabase configuration if present. (source line 549)

### 2. Initialise the application

- [ ] TypeScript strict mode. (source line 557)
- [ ] Tailwind CSS. (source line 558)
- [ ] shadcn/ui or accessible equivalent. (source line 559)
- [ ] Lucide icons. (source line 560)
- [ ] Responsive layouts. (source line 561)
- [ ] Reusable components. (source line 562)
- [ ] Centralised design tokens. (source line 563)
- [ ] Form validation. (source line 564)
- [ ] Error boundaries. (source line 565)
- [ ] Loading states. (source line 566)
- [ ] Toast notifications. (source line 567)
- [ ] Accessibility support. (source line 568)

### 3. Professional visual design

- [ ] Modern hospital management software. (source line 580)
- [ ] Clean professional dashboard. (source line 581)
- [ ] Burgundy and subtle gold brand accents inspired by the MediRoute event identity. (source line 582)
- [ ] Neutral background surfaces. (source line 583)
- [ ] Clear typography. (source line 584)
- [ ] Proper spacing. (source line 585)
- [ ] Clear distinction between navigation and content. (source line 586)
- [ ] Strong visual hierarchy. (source line 587)
- [ ] Medical urgency colours used consistently. (source line 588)

### 4. Create the global application layout

- [ ] Responsive sidebar. (source line 600)
- [ ] Top navigation. (source line 601)
- [ ] Hospital selector, where the user has access to multiple hospitals. (source line 602)
- [ ] Notification centre. (source line 603)
- [ ] Logged-in user menu. (source line 604)
- [ ] Breadcrumbs. (source line 605)
- [ ] Responsive mobile navigation. (source line 606)
- [ ] Profile settings. (source line 607)
- [ ] Logout. (source line 608)
- [ ] Global search where appropriate. (source line 609)

### 5. Create the separate application sections

- [ ] `/` (source line 617)
- [ ] `/patient/start` (source line 618)
- [ ] `/patient/intake/[token]` (source line 619)
- [ ] `/patient/status/[token]` (source line 620)
- [ ] `/emergency` (source line 621)
- [ ] `/login` (source line 625)
- [ ] `/forgot-password` (source line 626)
- [ ] `/auth/callback` (source line 627)
- [ ] `/dashboard` (source line 631)
- [ ] `/reception` (source line 632)
- [ ] `/triage` (source line 633)
- [ ] `/nurse` (source line 634)
- [ ] `/doctor` (source line 635)
- [ ] `/emergency-center` (source line 636)
- [ ] `/queues` (source line 637)
- [ ] `/smartflow` (source line 641)
- [ ] `/resources` (source line 642)
- [ ] `/departments` (source line 643)
- [ ] `/referrals` (source line 644)
- [ ] `/analytics` (source line 645)
- [ ] `/forecasting` (source line 646)
- [ ] `/settings` (source line 647)
- [ ] `/settings/staff` (source line 648)
- [ ] `/settings/hospital` (source line 649)
- [ ] `/settings/triage-protocol` (source line 650)
- [ ] `/audit` (source line 651)

### 6. Build the design system

- [ ] StatusBadge. (source line 661)
- [ ] PriorityBadge. (source line 662)
- [ ] PatientCard. (source line 663)
- [ ] PatientTable. (source line 664)
- [ ] PatientTimeline. (source line 665)
- [ ] VitalSignCard. (source line 666)
- [ ] MetricCard. (source line 667)
- [ ] QueueTable. (source line 668)
- [ ] EmergencyAlertCard. (source line 669)
- [ ] StaffAvailabilityCard. (source line 670)
- [ ] BedAvailabilityCard. (source line 671)
- [ ] DepartmentCard. (source line 672)
- [ ] NotificationPanel. (source line 673)
- [ ] ConfirmationDialog. (source line 674)
- [ ] QRCodeDisplay. (source line 675)
- [ ] EmptyState. (source line 676)
- [ ] LoadingSkeleton. (source line 677)
- [ ] ErrorState. (source line 678)
- [ ] OfflineIndicator. (source line 679)
- [ ] SyncStatusIndicator. (source line 680)

### 7. Responsive requirements

- [ ] No horizontal overflow. (source line 690)
- [ ] Keyboard navigation. (source line 691)
- [ ] Accessible labels. (source line 692)
- [ ] Sufficient contrast. (source line 693)
- [ ] Large touch targets. (source line 694)
- [ ] Screen-reader-friendly forms. (source line 695)
- [ ] Proper responsive tables. (source line 696)

### 8. Deliverables

- [ ] `AGENTS.md` (source line 702)
- [ ] `README.md` (source line 703)
- [ ] `docs/PRODUCT_REQUIREMENTS.md` (source line 704)
- [ ] `docs/ARCHITECTURE.md` (source line 705)
- [ ] `docs/IMPLEMENTATION_PLAN.md` (source line 706)
- [ ] `docs/KNOWN_LIMITATIONS.md` (source line 707)
- [ ] Initial application structure. (source line 708)

# Milestone 2 — SUPABASE DATABASE, AUTHENTICATION AND SECURITY

### 1. Supabase project setup

- [ ] Use the authenticated Supabase tooling or documented CLI. (source line 732)
- [ ] Check the available organisations and existing projects. (source line 733)
- [ ] Ask me for the necessary project or organisation selection if it cannot be established. (source line 734)
- [ ] Choose a suitable India-region location only after checking the currently supported regions and existing project requirements. (source line 735)
- [ ] Do not create unexpected billable infrastructure. (source line 736)

### 2. Database schema

- [ ] hospitals (source line 746)
- [ ] hospital_memberships (source line 747)
- [ ] user_profiles (source line 748)
- [ ] departments (source line 749)
- [ ] staff_assignments (source line 750)
- [ ] staff_shifts (source line 751)
- [ ] staff_availability (source line 752)
- [ ] patients (source line 756)
- [ ] patient_identifiers (source line 757)
- [ ] patient_encounters (source line 758)
- [ ] encounter_access_tokens (source line 759)
- [ ] patient_emergency_contacts (source line 760)
- [ ] symptom_catalog (source line 764)
- [ ] patient_symptoms (source line 765)
- [ ] medical_histories (source line 766)
- [ ] patient_allergies (source line 767)
- [ ] patient_medications (source line 768)
- [ ] clinical_observations (source line 769)
- [ ] vital_signs (source line 770)
- [ ] triage_protocol_versions (source line 774)
- [ ] triage_rule_definitions (source line 775)
- [ ] triage_assessments (source line 776)
- [ ] triage_assessment_answers (source line 777)
- [ ] triage_score_breakdowns (source line 778)
- [ ] triage_overrides (source line 779)
- [ ] reassessment_records (source line 780)
- [ ] queue_entries (source line 784)
- [ ] queue_events (source line 785)
- [ ] patient_status_events (source line 786)
- [ ] notifications (source line 790)
- [ ] notification_recipients (source line 791)
- [ ] notification_acknowledgements (source line 792)
- [ ] notification_delivery_attempts (source line 793)
- [ ] escalation_policies (source line 794)
- [ ] hospital_resources (source line 798)
- [ ] resource_reservations (source line 799)
- [ ] resource_status_history (source line 800)
- [ ] referral_facilities (source line 804)
- [ ] referrals (source line 805)
- [ ] transfer_records (source line 806)
- [ ] referral_acknowledgements (source line 807)
- [ ] treatment_records (source line 811)
- [ ] investigation_records (source line 812)
- [ ] admissions (source line 813)
- [ ] discharges (source line 814)
- [ ] follow_up_records (source line 815)
- [ ] audit_logs (source line 819)
- [ ] hospital_settings (source line 820)
- [ ] system_settings (source line 821)
- [ ] offline_sync_events (source line 822)
- [ ] operational_daily_metrics (source line 823)

### 3. Data model requirements

### 4. Authentication

- [ ] super_admin (source line 855)
- [ ] hospital_admin (source line 856)
- [ ] receptionist (source line 857)
- [ ] triage_nurse (source line 858)
- [ ] nurse (source line 859)
- [ ] doctor (source line 860)
- [ ] emergency_coordinator (source line 861)
- [ ] resource_manager (source line 862)

### 5. Row Level Security

- [ ] Authenticated user. (source line 878)
- [ ] Hospital membership. (source line 879)
- [ ] Staff role. (source line 880)
- [ ] Assigned department where required. (source line 881)
- [ ] Assigned patient/encounter where applicable. (source line 882)

### 6. Supabase clients

- [ ] Browser Supabase client. (source line 896)
- [ ] Server Supabase client. (source line 897)
- [ ] Cookie/session integration. (source line 898)
- [ ] Middleware or the currently recommended equivalent for protected routes. (source line 899)
- [ ] Safe server-only administrative client when genuinely required. (source line 900)

### 7. Database utilities

- [ ] Database types. (source line 910)
- [ ] Typed query helpers. (source line 911)
- [ ] Server-side repository functions. (source line 912)
- [ ] Safe error handling. (source line 913)
- [ ] Transaction-safe resource reservation logic. (source line 914)
- [ ] Migration files. (source line 915)
- [ ] Seed scripts for development and demo data. (source line 916)

### 8. Supabase verification

- [ ] Staff login. (source line 926)
- [ ] Staff logout. (source line 927)
- [ ] Role restrictions. (source line 928)
- [ ] Hospital isolation. (source line 929)
- [ ] RLS restrictions. (source line 930)
- [ ] Patient encounter access. (source line 931)
- [ ] QR token expiry. (source line 932)
- [ ] Database relationships. (source line 933)
- [ ] Resource reservation constraints. (source line 934)
- [ ] Audit logging. (source line 935)
- [ ] `docs/DATABASE_SCHEMA.md` (source line 945)
- [ ] `docs/ROLE_PERMISSIONS.md` (source line 946)
- [ ] `docs/SUPABASE_SETUP.md` (source line 947)
- [ ] `supabase/migrations/` (source line 948)
- [ ] `supabase/seed.sql` or equivalent safe seed structure. (source line 949)

# Milestone 3 — PATIENT PORTAL, QR GENERATION AND REGISTRATION

### 1. Reception dashboard

- [ ] Search an existing patient. (source line 967)
- [ ] Create a new patient. (source line 968)
- [ ] Create a new encounter. (source line 969)
- [ ] Register unidentified emergency patients. (source line 970)
- [ ] Record arrival time. (source line 971)
- [ ] Select the department or hospital location. (source line 972)
- [ ] Generate an encounter ID. (source line 973)
- [ ] Generate a QR code. (source line 974)
- [ ] Print a QR token. (source line 975)
- [ ] Copy the patient entry link. (source line 976)
- [ ] Revoke and regenerate an encounter access token. (source line 977)
- [ ] See registration status. (source line 978)

### 2. QR code mechanism

- [ ] Token validation. (source line 994)
- [ ] Token expiration. (source line 995)
- [ ] Token revocation. (source line 996)
- [ ] Rate limiting. (source line 997)
- [ ] Replay protection where appropriate. (source line 998)
- [ ] Safe error messages. (source line 999)
- [ ] Access logging without logging raw tokens. (source line 1000)

### 3. Patient registration flow

- [ ] MediRoute identity. (source line 1010)
- [ ] Language selection. (source line 1011)
- [ ] Encounter verification. (source line 1012)
- [ ] Patient details. (source line 1013)
- [ ] Basic medical history. (source line 1014)
- [ ] Symptoms and complaints. (source line 1015)
- [ ] Symptom duration. (source line 1016)
- [ ] Symptom severity. (source line 1017)
- [ ] Bleeding/injury reporting. (source line 1018)
- [ ] Breathing status. (source line 1019)
- [ ] Consciousness status. (source line 1020)
- [ ] Relevant warning signs. (source line 1021)
- [ ] Medical conditions. (source line 1022)
- [ ] Allergies. (source line 1023)
- [ ] Current medications. (source line 1024)
- [ ] Vital signs if measured and entered by a qualified staff member or reliable source. (source line 1025)
- [ ] Review and submit. (source line 1026)

### 4. Accessibility and language

- [ ] Large text. (source line 1042)
- [ ] Pictorial options. (source line 1043)
- [ ] Simple terminology. (source line 1044)
- [ ] Voice input where browser support exists. (source line 1045)
- [ ] Manual typing fallback. (source line 1046)
- [ ] Clear progress indicators. (source line 1047)
- [ ] Screen-reader labels. (source line 1048)

### 5. Assisted registration

- [ ] Elderly patients. (source line 1058)
- [ ] Unconscious patients. (source line 1059)
- [ ] Injured patients. (source line 1060)
- [ ] Children with guardians. (source line 1061)
- [ ] Patients unable to use smartphones. (source line 1062)
- [ ] Patients who do not understand the available languages. (source line 1063)

### 6. Patient status page

- [ ] Registration confirmation. (source line 1071)
- [ ] Encounter token/reference. (source line 1072)
- [ ] Current general status. (source line 1073)
- [ ] Waiting instruction approved by staff. (source line 1074)
- [ ] Department assignment when confirmed. (source line 1075)
- [ ] General progress updates. (source line 1076)

### 7. QR printing

- [ ] MediRoute branding. (source line 1084)
- [ ] Encounter reference. (source line 1085)
- [ ] QR code. (source line 1086)
- [ ] Simple scan instructions. (source line 1087)
- [ ] Hospital name. (source line 1088)
- [ ] Arrival timestamp. (source line 1089)

### 8. Validation

- [ ] Successful QR scan. (source line 1097)
- [ ] Invalid QR. (source line 1098)
- [ ] Expired QR. (source line 1099)
- [ ] Revoked QR. (source line 1100)
- [ ] Repeated submissions. (source line 1101)
- [ ] Incomplete form. (source line 1102)
- [ ] Emergency warning sign. (source line 1103)
- [ ] Offline reception entry. (source line 1104)
- [ ] Multiple encounters for one patient. (source line 1105)
- [ ] Printing. (source line 1106)
- [ ] Small-screen mobile layout. (source line 1107)

# Milestone 4 — CLINICAL TRIAGE ENGINE, EMERGENCY OVERRIDE AND SCORING

### 1. Separate the clinical classification from numerical scoring

### 2. Emergency override

- [ ] Cardiac arrest or unresponsiveness. (source line 1139)
- [ ] Severe respiratory distress. (source line 1140)
- [ ] Severe uncontrolled bleeding. (source line 1141)
- [ ] Suspected stroke. (source line 1142)
- [ ] Ongoing seizure. (source line 1143)
- [ ] Major trauma. (source line 1144)
- [ ] Suspected shock. (source line 1145)
- [ ] Other clinician-approved emergencies. (source line 1146)
- [ ] Create an emergency escalation record. (source line 1150)
- [ ] Bypass routine queue waiting. (source line 1151)
- [ ] Activate the emergency notification workflow. (source line 1152)
- [ ] Notify the assigned response team. (source line 1153)
- [ ] Request necessary assistance. (source line 1154)
- [ ] Record the trigger and timestamp. (source line 1155)
- [ ] Continue to request human assessment. (source line 1156)
- [ ] Preserve the override in the audit history. (source line 1157)

### 3. Triage categories

### 4. Rule engine architecture

- [ ] Rule definitions. (source line 1185)
- [ ] Input validation. (source line 1186)
- [ ] Warning-sign detection. (source line 1187)
- [ ] Missing-data detection. (source line 1188)
- [ ] Vital-sign evaluation. (source line 1189)
- [ ] Symptom evaluation. (source line 1190)
- [ ] Risk-factor evaluation. (source line 1191)
- [ ] Classification. (source line 1192)
- [ ] Explanation generation. (source line 1193)
- [ ] Clinician verification. (source line 1194)
- [ ] Audit recording. (source line 1195)
- [ ] Name. (source line 1201)
- [ ] Version. (source line 1202)
- [ ] Status. (source line 1203)
- [ ] Source/reference. (source line 1204)
- [ ] Author. (source line 1205)
- [ ] Clinical reviewer. (source line 1206)
- [ ] Approval timestamp. (source line 1207)
- [ ] Effective date. (source line 1208)
- [ ] Expiry or review date where applicable. (source line 1209)

### 5. Score out of 100

- [ ] Clinical urgency indicators: 0–40. (source line 1219)
- [ ] Vital-sign abnormalities: 0–25. (source line 1220)
- [ ] Symptom severity/progression: 0–15. (source line 1221)
- [ ] Relevant risk factors: 0–10. (source line 1222)
- [ ] Waiting-time escalation component: 0–10. (source line 1223)
- [ ] Allow decimal scores. (source line 1229)
- [ ] Return a score from 0 to 100. (source line 1230)
- [ ] Produce a component breakdown. (source line 1231)
- [ ] Explain why points were assigned. (source line 1232)
- [ ] Handle missing information. (source line 1233)
- [ ] Store the scoring protocol version. (source line 1234)
- [ ] Make every calculation reproducible. (source line 1235)
- [ ] Include unit tests. (source line 1236)

### 6. Human verification

- [ ] Review the assessment. (source line 1248)
- [ ] Confirm the category. (source line 1249)
- [ ] Change a proposed category. (source line 1250)
- [ ] Enter a clinical reason for override. (source line 1251)
- [ ] Update vital signs. (source line 1252)
- [ ] Record a reassessment. (source line 1253)
- [ ] Escalate the patient. (source line 1254)
- [ ] Record who made the final decision. (source line 1255)

### 7. Reassessment

- [ ] Last assessment time. (source line 1267)
- [ ] Next reassessment due. (source line 1268)
- [ ] Overdue indicator. (source line 1269)
- [ ] Current patient status. (source line 1270)
- [ ] Deterioration history. (source line 1271)

### 8. Clinical simulation tests

- [ ] Mild fever. (source line 1281)
- [ ] Mild injury. (source line 1282)
- [ ] Worsening symptoms. (source line 1283)
- [ ] Concerning chest pain. (source line 1284)
- [ ] Suspected stroke. (source line 1285)
- [ ] Severe bleeding. (source line 1286)
- [ ] Respiratory distress. (source line 1287)
- [ ] Cardiac arrest. (source line 1288)
- [ ] Missing information. (source line 1289)
- [ ] Elderly patient. (source line 1290)
- [ ] Unconscious patient. (source line 1291)
- [ ] Changing vital signs. (source line 1292)

### 9. Deliverables

- [ ] Clinical engine. (source line 1302)
- [ ] Rule versioning. (source line 1303)
- [ ] Score engine. (source line 1304)
- [ ] Breakdown UI. (source line 1305)
- [ ] Clinical assessment UI. (source line 1306)
- [ ] Override workflow. (source line 1307)
- [ ] Reassessment logic. (source line 1308)
- [ ] Unit and integration tests. (source line 1309)
- [ ] `docs/TRIAGE_ALGORITHM.md` (source line 1310)
- [ ] `docs/CLINICAL_SAFETY.md` (source line 1311)

# Milestone 5 — DYNAMIC QUEUES, STAFF DASHBOARDS AND EMERGENCY NOTIFICATIONS

### 1. Live patient queue

- [ ] Awaiting triage. (source line 1323)
- [ ] GREEN/general care. (source line 1324)
- [ ] YELLOW/urgent assessment. (source line 1325)
- [ ] RED/emergency. (source line 1326)
- [ ] Reassessment required. (source line 1327)
- [ ] Awaiting doctor. (source line 1328)
- [ ] Awaiting investigation. (source line 1329)
- [ ] Awaiting admission. (source line 1330)
- [ ] Awaiting referral. (source line 1331)

### 2. Queue ordering

- [ ] Active emergency cases. (source line 1339)
- [ ] Other RED cases. (source line 1340)
- [ ] YELLOW cases. (source line 1341)
- [ ] GREEN cases. (source line 1342)
- [ ] Clinical sub-priority. (source line 1346)
- [ ] Deterioration alerts. (source line 1347)
- [ ] Reassessment overdue. (source line 1348)
- [ ] Validated secondary priority indicator. (source line 1349)
- [ ] Waiting time. (source line 1350)
- [ ] Arrival time as a tie-breaker. (source line 1351)

### 3. Supabase Realtime

- [ ] New patient. (source line 1363)
- [ ] Updated patient status. (source line 1364)
- [ ] New alert. (source line 1365)
- [ ] Alert acknowledgement. (source line 1366)
- [ ] Queue movement. (source line 1367)
- [ ] Resource update. (source line 1368)

### 4. Nurse dashboard

- [ ] Patient queue. (source line 1380)
- [ ] Triage status. (source line 1381)
- [ ] Vital signs. (source line 1382)
- [ ] Reassessment deadlines. (source line 1383)
- [ ] Alerts. (source line 1384)
- [ ] Patients assigned to the nurse. (source line 1385)
- [ ] Unacknowledged tasks. (source line 1386)
- [ ] Open patient. (source line 1390)
- [ ] Begin assessment. (source line 1391)
- [ ] Record vital signs. (source line 1392)
- [ ] Verify category. (source line 1393)
- [ ] Request doctor. (source line 1394)
- [ ] Escalate. (source line 1395)
- [ ] Complete assessment. (source line 1396)
- [ ] Update patient destination. (source line 1397)

### 5. Doctor dashboard

- [ ] Urgent cases. (source line 1403)
- [ ] Critical cases. (source line 1404)
- [ ] Assigned cases. (source line 1405)
- [ ] Pending cases. (source line 1406)
- [ ] Clinical history. (source line 1407)
- [ ] Current status. (source line 1408)
- [ ] Vital-sign trends. (source line 1409)
- [ ] Assessment breakdown. (source line 1410)
- [ ] Nurse handover. (source line 1411)
- [ ] Investigation history. (source line 1412)
- [ ] Review patient. (source line 1416)
- [ ] Add assessment. (source line 1417)
- [ ] Record treatment. (source line 1418)
- [ ] Request investigations. (source line 1419)
- [ ] Recommend admission. (source line 1420)
- [ ] Initiate referral. (source line 1421)
- [ ] Discharge after appropriate documentation. (source line 1422)

### 6. Emergency coordination dashboard

- [ ] Active RED cases. (source line 1430)
- [ ] Time since alert. (source line 1431)
- [ ] Patient location. (source line 1432)
- [ ] Emergency reason. (source line 1433)
- [ ] Acknowledgement status. (source line 1434)
- [ ] Assigned team. (source line 1435)
- [ ] Assigned doctor. (source line 1436)
- [ ] Stretcher request. (source line 1437)
- [ ] Emergency bed request. (source line 1438)
- [ ] Current response status. (source line 1439)
- [ ] Acknowledge alert. (source line 1443)
- [ ] Assign response team. (source line 1444)
- [ ] Assign staff. (source line 1445)
- [ ] Request a stretcher. (source line 1446)
- [ ] Request equipment. (source line 1447)
- [ ] Record arrival of the response team. (source line 1448)
- [ ] Mark emergency assistance in progress. (source line 1449)
- [ ] Escalate an unacknowledged alert. (source line 1450)
- [ ] Close the alert with appropriate documentation. (source line 1451)

### 7. Alert system

- [ ] ESCALATED. (source line 1461)
- [ ] CANCELLED. (source line 1462)
- [ ] Trigger. (source line 1466)
- [ ] Encounter. (source line 1467)
- [ ] Recipient. (source line 1468)
- [ ] Sender. (source line 1469)
- [ ] Timestamp. (source line 1470)
- [ ] Delivery status. (source line 1471)
- [ ] Acknowledgement time. (source line 1472)
- [ ] Resolution time. (source line 1473)

### 8. Escalation mechanism

- [ ] Notify configured backup staff. (source line 1481)
- [ ] Notify emergency coordinator. (source line 1482)
- [ ] Record escalation. (source line 1483)
- [ ] Continue to display an active unacknowledged alert. (source line 1484)

### 9. Notification channels

- [ ] In-app notifications. (source line 1492)
- [ ] Real-time notification panel. (source line 1493)
- [ ] Browser push when configured. (source line 1494)
- [ ] Optional SMS adapter. (source line 1495)
- [ ] Optional external notification adapter. (source line 1496)

### 10. Verification

- [ ] Different user roles. (source line 1504)
- [ ] Queue ordering. (source line 1505)
- [ ] Real-time updates. (source line 1506)
- [ ] Alert acknowledgement. (source line 1507)
- [ ] Escalation. (source line 1508)
- [ ] Duplicate notification prevention. (source line 1509)
- [ ] Notification permissions. (source line 1510)
- [ ] Unavailable notification service. (source line 1511)
- [ ] Browser refresh. (source line 1512)
- [ ] Reconnection. (source line 1513)

# Milestone 6 — SMARTFLOW, RESOURCE ALLOCATION, REFERRAL AND PATIENT OUTFLOW

### 1. Patient journey engine

- [ ] Discharged. (source line 1539)
- [ ] Admitted. (source line 1540)
- [ ] Referred/transferred. (source line 1541)
- [ ] Follow-up scheduled. (source line 1542)

### 2. Patient tracking

- [ ] Encounter information. (source line 1550)
- [ ] Current department. (source line 1551)
- [ ] Assigned staff. (source line 1552)
- [ ] Clinical assessment history. (source line 1553)
- [ ] Queue information. (source line 1554)
- [ ] Current status. (source line 1555)
- [ ] Status history. (source line 1556)
- [ ] Investigation records. (source line 1557)
- [ ] Treatment notes. (source line 1558)
- [ ] Resources assigned. (source line 1559)
- [ ] Referral records. (source line 1560)
- [ ] Admission details. (source line 1561)
- [ ] Discharge summary. (source line 1562)

### 3. Resource management

- [ ] General beds. (source line 1572)
- [ ] Emergency beds. (source line 1573)
- [ ] ICU beds. (source line 1574)
- [ ] Stretchers. (source line 1575)
- [ ] Wheelchairs. (source line 1576)
- [ ] Diagnostic equipment. (source line 1577)
- [ ] Other hospital-defined resources. (source line 1578)
- [ ] Resource ID. (source line 1582)
- [ ] Type. (source line 1583)
- [ ] Department. (source line 1584)
- [ ] Current status. (source line 1585)
- [ ] Location. (source line 1586)
- [ ] Capacity, where appropriate. (source line 1587)
- [ ] Availability. (source line 1588)
- [ ] Maintenance status. (source line 1589)
- [ ] Reservation information. (source line 1590)

### 4. Reservation logic

- [ ] Available. (source line 1600)
- [ ] Reserved. (source line 1601)
- [ ] Occupied. (source line 1602)
- [ ] Cleaning/maintenance. (source line 1603)
- [ ] Unavailable. (source line 1604)
- [ ] Notify the responsible coordinator. (source line 1610)
- [ ] Show the shortage. (source line 1611)
- [ ] Display alternative resources or destinations for staff review. (source line 1612)
- [ ] Preserve clinical priority. (source line 1613)

### 5. Staff coordination

- [ ] Staff directory. (source line 1619)
- [ ] Department assignments. (source line 1620)
- [ ] Shift availability. (source line 1621)
- [ ] Staff status. (source line 1622)
- [ ] Assigned patients. (source line 1623)
- [ ] Current workload. (source line 1624)
- [ ] Staff notifications. (source line 1625)

### 6. Department management

- [ ] Name. (source line 1633)
- [ ] Description. (source line 1634)
- [ ] Location. (source line 1635)
- [ ] Supported services. (source line 1636)
- [ ] Operating status. (source line 1637)
- [ ] Capacity. (source line 1638)
- [ ] Assigned doctors. (source line 1639)
- [ ] Assigned nurses. (source line 1640)
- [ ] Assigned resources. (source line 1641)

### 7. Smart hospital routing

- [ ] Confirmed triage category. (source line 1649)
- [ ] Patient's clinical requirement. (source line 1650)
- [ ] Appropriate available department. (source line 1651)
- [ ] Facility capabilities. (source line 1652)
- [ ] Verified resource availability. (source line 1653)

### 8. Referral management

- [ ] Name. (source line 1665)
- [ ] Location. (source line 1666)
- [ ] Contact information. (source line 1667)
- [ ] Supported specialities. (source line 1668)
- [ ] Available services. (source line 1669)
- [ ] Facility level. (source line 1670)
- [ ] Referral requirements. (source line 1671)
- [ ] Operating status. (source line 1672)
- [ ] Clinician initiates referral. (source line 1676)
- [ ] Reason and summary recorded. (source line 1677)
- [ ] Destination selected. (source line 1678)
- [ ] Receiving facility contacted through an available channel. (source line 1679)
- [ ] Acceptance or acknowledgement recorded. (source line 1680)
- [ ] Ambulance requirement recorded. (source line 1681)
- [ ] Transfer assigned. (source line 1682)
- [ ] Transfer departure recorded. (source line 1683)
- [ ] Receiving-facility arrival recorded. (source line 1684)
- [ ] Referral completed. (source line 1685)

### 9. Discharge and admission

- [ ] Doctor approval. (source line 1693)
- [ ] Final clinical notes. (source line 1694)
- [ ] Discharge instructions. (source line 1695)
- [ ] Follow-up date. (source line 1696)
- [ ] Prescription reference, where entered by clinician. (source line 1697)
- [ ] Discharge timestamp. (source line 1698)
- [ ] Admission reason. (source line 1702)
- [ ] Assigned ward. (source line 1703)
- [ ] Bed reservation. (source line 1704)
- [ ] Responsible doctor. (source line 1705)
- [ ] Admission confirmation. (source line 1706)

### 10. SmartFlow dashboard

- [ ] Total patients. (source line 1712)
- [ ] Registered today. (source line 1713)
- [ ] Currently waiting. (source line 1714)
- [ ] Under assessment. (source line 1715)
- [ ] In treatment. (source line 1716)
- [ ] Awaiting diagnostics. (source line 1717)
- [ ] Awaiting beds. (source line 1718)
- [ ] Awaiting transfer. (source line 1719)
- [ ] Admitted. (source line 1720)
- [ ] Discharged. (source line 1721)
- [ ] Referred. (source line 1722)

### 11. Analytics

- [ ] Average registration-to-triage time. (source line 1730)
- [ ] Average triage-to-assessment time. (source line 1731)
- [ ] Total waiting time. (source line 1732)
- [ ] Average treatment duration where timestamps are available. (source line 1733)
- [ ] Department workload. (source line 1734)
- [ ] Resource utilisation. (source line 1735)
- [ ] Admission and discharge counts. (source line 1736)
- [ ] Referral turnaround. (source line 1737)

### 12. Tests

- [ ] Status transitions. (source line 1745)
- [ ] Resource concurrency. (source line 1746)
- [ ] Bed reservation. (source line 1747)
- [ ] Staff assignments. (source line 1748)
- [ ] Referral lifecycle. (source line 1749)
- [ ] Admission workflow. (source line 1750)
- [ ] Discharge workflow. (source line 1751)
- [ ] Patient history integrity. (source line 1752)
- [ ] Role restrictions. (source line 1753)

# Milestone 7 — OFFLINE-FIRST PWA, RURAL MODE AND MULTILINGUAL ACCESSIBILITY

### 1. PWA

- [ ] Web manifest. (source line 1767)
- [ ] Application icons. (source line 1768)
- [ ] Installation prompt. (source line 1769)
- [ ] Service worker. (source line 1770)
- [ ] Offline landing page. (source line 1771)
- [ ] Network status detection. (source line 1772)
- [ ] Update management. (source line 1773)
- [ ] Responsive mobile interface. (source line 1774)

### 2. Offline registration

- [ ] Patient details. (source line 1782)
- [ ] Encounter creation. (source line 1783)
- [ ] Basic symptom information. (source line 1784)
- [ ] Locally generated provisional encounter identifiers. (source line 1785)
- [ ] Offline form submission. (source line 1786)
- [ ] Outbox management. (source line 1787)
- [ ] Synchronisation status. (source line 1788)
- [ ] Verify the authenticated staff session. (source line 1794)
- [ ] Send queued records securely. (source line 1795)
- [ ] Check whether the server already processed each operation. (source line 1796)
- [ ] Sync in a deterministic order. (source line 1797)
- [ ] Record success or failure. (source line 1798)
- [ ] Retry recoverable failures. (source line 1799)
- [ ] Show conflicts for staff review. (source line 1800)
- [ ] Remove locally retained drafts according to the configured data-retention policy after successful acknowledgement. (source line 1801)

### 3. Offline QR limitations and handling

- [ ] Generate a provisional encounter ID. (source line 1809)
- [ ] Generate a local reference QR if appropriate. (source line 1810)
- [ ] Clearly distinguish provisional and server-issued tokens. (source line 1811)
- [ ] Synchronise securely when online. (source line 1812)

### 4. Service-worker security

- [ ] Patient medical records. (source line 1822)
- [ ] Authenticated API responses. (source line 1823)
- [ ] Clinical assessments. (source line 1824)
- [ ] Sensitive staff dashboards. (source line 1825)
- [ ] Raw QR access tokens. (source line 1826)

### 5. Rural mode

- [ ] Large buttons. (source line 1836)
- [ ] Low-bandwidth layouts. (source line 1837)
- [ ] Simple registration. (source line 1838)
- [ ] Assisted registration. (source line 1839)
- [ ] Printable forms/tokens. (source line 1840)
- [ ] Regional languages. (source line 1841)
- [ ] Manual workflow fallback. (source line 1842)
- [ ] Connection warning. (source line 1843)
- [ ] Offline data status. (source line 1844)

### 6. Voice support

- [ ] Permission handling. (source line 1852)
- [ ] Unsupported-browser fallback. (source line 1853)
- [ ] Manual text entry. (source line 1854)
- [ ] Editing before submission. (source line 1855)
- [ ] Language-specific input where supported. (source line 1856)

### 7. Language support

- [ ] English. (source line 1864)
- [ ] Kannada. (source line 1865)
- [ ] Hindi. (source line 1866)

### 8. Accessibility

- [ ] Keyboard navigation. (source line 1878)
- [ ] Focus indicators. (source line 1879)
- [ ] Colour contrast. (source line 1880)
- [ ] Form labels. (source line 1881)
- [ ] Screen-reader support. (source line 1882)
- [ ] Large text option. (source line 1883)
- [ ] Responsive layouts. (source line 1884)
- [ ] Accessible emergency alert controls. (source line 1885)

### 9. Testing

- [ ] Installation. (source line 1891)
- [ ] Offline page. (source line 1892)
- [ ] Offline registration. (source line 1893)
- [ ] Queue persistence. (source line 1894)
- [ ] Reconnection. (source line 1895)
- [ ] Duplicate sync. (source line 1896)
- [ ] Failed sync. (source line 1897)
- [ ] Conflict handling. (source line 1898)
- [ ] Browser refresh while offline. (source line 1899)
- [ ] Shared-device cleanup. (source line 1900)
- [ ] Language switching. (source line 1901)
- [ ] Mobile accessibility. (source line 1902)

# Milestone 8 — ADMIN DASHBOARD, HOSPITAL SETTINGS, ANALYTICS AND FORECASTING

### 1. Administrator overview

- [ ] Total patients registered today. (source line 1918)
- [ ] Active encounters. (source line 1919)
- [ ] GREEN cases. (source line 1920)
- [ ] YELLOW cases. (source line 1921)
- [ ] RED cases. (source line 1922)
- [ ] Patients awaiting triage. (source line 1923)
- [ ] Patients awaiting doctors. (source line 1924)
- [ ] Patients under treatment. (source line 1925)
- [ ] Patients awaiting admission. (source line 1926)
- [ ] Available beds. (source line 1927)
- [ ] Occupied beds. (source line 1928)
- [ ] Available staff. (source line 1929)
- [ ] Unacknowledged alerts. (source line 1930)
- [ ] Active referrals. (source line 1931)

### 2. Department analytics

- [ ] Number of registered patients. (source line 1937)
- [ ] Waiting patients. (source line 1938)
- [ ] Cases under assessment. (source line 1939)
- [ ] Cases in treatment. (source line 1940)
- [ ] Workload. (source line 1941)
- [ ] Available staff. (source line 1942)
- [ ] Available resources. (source line 1943)
- [ ] Current capacity. (source line 1944)

### 3. Hospital configuration

- [ ] Hospital details. (source line 1950)
- [ ] Departments. (source line 1951)
- [ ] Operating hours. (source line 1952)
- [ ] Staff. (source line 1953)
- [ ] Staff roles. (source line 1954)
- [ ] Duty schedules. (source line 1955)
- [ ] Resources. (source line 1956)
- [ ] Bed categories. (source line 1957)
- [ ] Referral facilities. (source line 1958)
- [ ] Notification recipients. (source line 1959)
- [ ] Escalation policies. (source line 1960)
- [ ] Waiting-time warning configuration. (source line 1961)
- [ ] Languages. (source line 1962)

### 4. Clinical protocol administration

- [ ] Draft rule sets. (source line 1970)
- [ ] Version history. (source line 1971)
- [ ] Clinical reference. (source line 1972)
- [ ] Reviewer assignment. (source line 1973)
- [ ] Approval status. (source line 1974)
- [ ] Effective dates. (source line 1975)
- [ ] Protocol activation. (source line 1976)
- [ ] Protocol retirement. (source line 1977)

### 5. Operational forecasting

- [ ] Patient inflow by hour. (source line 1989)
- [ ] Inflow by day. (source line 1990)
- [ ] Department demand. (source line 1991)
- [ ] Bed occupancy patterns. (source line 1992)
- [ ] Referral patterns. (source line 1993)
- [ ] Anticipated peak hours. (source line 1994)

### 6. Hospital reports

- [ ] Daily reports. (source line 2004)
- [ ] Weekly reports. (source line 2005)
- [ ] Monthly reports. (source line 2006)
- [ ] Department reports. (source line 2007)
- [ ] Patient-flow reports. (source line 2008)
- [ ] Resource reports. (source line 2009)
- [ ] Referral reports. (source line 2010)
- [ ] Operational workload reports. (source line 2011)

### 7. Audit dashboard

- [ ] User login activity where available. (source line 2023)
- [ ] Clinical assessment changes. (source line 2024)
- [ ] Priority overrides. (source line 2025)
- [ ] Patient status transitions. (source line 2026)
- [ ] Resource allocation. (source line 2027)
- [ ] Referral updates. (source line 2028)
- [ ] User role changes. (source line 2029)
- [ ] System configuration changes. (source line 2030)

### 8. Dashboard design

### 9. Verification

- [ ] Admin permissions. (source line 2050)
- [ ] Analytics calculations. (source line 2051)
- [ ] Export permissions. (source line 2052)
- [ ] Date filters. (source line 2053)
- [ ] Department filters. (source line 2054)
- [ ] Audit record creation. (source line 2055)
- [ ] Protocol approval restrictions. (source line 2056)
- [ ] Forecast calculation. (source line 2057)
- [ ] Data isolation. (source line 2058)

# Milestone 9 — COMPLETE INTEGRATION, QA, SECURITY AND DEMONSTRATION

### 1. Integration audit

### 2. End-to-end scenario 1 — Routine patient

- [ ] Reception registers a patient. (source line 2093)
- [ ] QR is generated. (source line 2094)
- [ ] Patient scans QR. (source line 2095)
- [ ] Patient enters routine symptoms. (source line 2096)
- [ ] Nurse reviews the information. (source line 2097)
- [ ] Clinician confirms the appropriate category. (source line 2098)
- [ ] Patient enters the general-care queue. (source line 2099)
- [ ] Nurse is notified. (source line 2100)
- [ ] Doctor or authorised staff completes assessment. (source line 2101)
- [ ] Patient receives documented disposition. (source line 2102)
- [ ] Patient is discharged where appropriate. (source line 2103)

### 3. End-to-end scenario 2 — Urgent patient

- [ ] Patient is registered. (source line 2109)
- [ ] Relevant warning signs or findings are recorded. (source line 2110)
- [ ] The system identifies the need for urgent human assessment. (source line 2111)
- [ ] Nurse and duty doctor are notified. (source line 2112)
- [ ] Staff acknowledge the alert. (source line 2113)
- [ ] Patient is moved to the urgent assessment area. (source line 2114)
- [ ] Doctor reviews the patient. (source line 2115)
- [ ] Treatment or investigation is recorded. (source line 2116)
- [ ] Disposition is recorded. (source line 2117)

### 4. End-to-end scenario 3 — Emergency patient

- [ ] Patient arrives with a configured emergency warning sign. (source line 2123)
- [ ] Patient is not forced to complete registration first. (source line 2124)
- [ ] Staff creates an emergency encounter. (source line 2125)
- [ ] Emergency override is activated. (source line 2126)
- [ ] RED alert is created. (source line 2127)
- [ ] Emergency coordinator receives the alert. (source line 2128)
- [ ] Duty doctor receives the alert. (source line 2129)
- [ ] Stretcher request is recorded. (source line 2130)
- [ ] Emergency response is acknowledged. (source line 2131)
- [ ] Patient is treated. (source line 2132)
- [ ] Resource and treatment records are updated. (source line 2133)
- [ ] Doctor records admission, transfer or another disposition. (source line 2134)

### 5. End-to-end scenario 4 — Deterioration

- [ ] Patient initially receives a lower urgency category. (source line 2140)
- [ ] Patient is waiting. (source line 2141)
- [ ] A nurse enters new concerning observations. (source line 2142)
- [ ] The application triggers reassessment/escalation. (source line 2143)
- [ ] Category is reviewed by qualified staff. (source line 2144)
- [ ] Queue changes appropriately. (source line 2145)
- [ ] Relevant teams are notified. (source line 2146)
- [ ] All transitions are recorded. (source line 2147)

### 6. End-to-end scenario 5 — Offline rural registration

- [ ] Hospital tablet is connected. (source line 2153)
- [ ] Staff opens the application. (source line 2154)
- [ ] Internet disconnects. (source line 2155)
- [ ] Staff creates an offline registration. (source line 2156)
- [ ] Application retains the draft locally. (source line 2157)
- [ ] Internet returns. (source line 2158)
- [ ] Application synchronises. (source line 2159)
- [ ] Duplicate creation is prevented. (source line 2160)
- [ ] Server record is verified. (source line 2161)
- [ ] Local data is handled according to the retention policy. (source line 2162)

### 7. End-to-end scenario 6 — Elderly and assisted registration

- [ ] No smartphone. (source line 2168)
- [ ] Assisted patient registration. (source line 2169)
- [ ] Limited ability to provide information. (source line 2170)
- [ ] Missing data. (source line 2171)
- [ ] Staff verification. (source line 2172)
- [ ] Clinical assessment. (source line 2173)

### 8. End-to-end scenario 7 — No available emergency bed

- [ ] RED case. (source line 2179)
- [ ] No suitable local bed. (source line 2180)
- [ ] Emergency coordinator informed. (source line 2181)
- [ ] Resource shortage recorded. (source line 2182)
- [ ] Alternative transfer pathway reviewed by authorised staff. (source line 2183)
- [ ] Referral status tracked. (source line 2184)

### 9. Automated test suite

- [ ] Vitest or an appropriate unit test framework. (source line 2192)
- [ ] Playwright end-to-end testing. (source line 2193)
- [ ] React/component testing where appropriate. (source line 2194)
- [ ] Database integration tests. (source line 2195)
- [ ] Supabase RLS verification. (source line 2196)
- [ ] API permission testing. (source line 2197)

### 10. Security audit

- [ ] No service-role key in frontend bundles. (source line 2203)
- [ ] No secrets in Git history. (source line 2204)
- [ ] All exposed database tables have RLS. (source line 2205)
- [ ] Role checks are server-side. (source line 2206)
- [ ] No self-assigned staff privileges. (source line 2207)
- [ ] QR tokens are protected. (source line 2208)
- [ ] Public routes are rate-limited. (source line 2209)
- [ ] User input is validated. (source line 2210)
- [ ] Patients cannot access other encounters. (source line 2211)
- [ ] Hospital data cannot leak between tenants. (source line 2212)
- [ ] Audit records are generated. (source line 2213)
- [ ] Document access is protected. (source line 2214)
- [ ] Error messages do not reveal sensitive data. (source line 2215)

### 11. Performance and accessibility

- [ ] Page loading. (source line 2223)
- [ ] Dashboard query performance. (source line 2224)
- [ ] Pagination. (source line 2225)
- [ ] Responsive layouts. (source line 2226)
- [ ] Accessibility. (source line 2227)
- [ ] Large patient queues. (source line 2228)
- [ ] Realtime reconnection. (source line 2229)
- [ ] Loading/error states. (source line 2230)
- [ ] Mobile responsiveness. (source line 2231)

### 12. Demo data and presentation

- [ ] Demo hospital. (source line 2239)
- [ ] Departments. (source line 2240)
- [ ] Staff roles. (source line 2241)
- [ ] Sample patients. (source line 2242)
- [ ] Sample resources. (source line 2243)
- [ ] Sample queue entries. (source line 2244)
- [ ] Sample alerts. (source line 2245)
- [ ] Sample referrals. (source line 2246)

### 13. Final documentation

- [ ] `docs/TEST_PLAN.md` (source line 2254)
- [ ] `docs/TEST_RESULTS.md` (source line 2255)
- [ ] `docs/SECURITY_AUDIT.md` (source line 2256)
- [ ] `docs/DEMO_GUIDE.md` (source line 2257)
- [ ] `docs/FEATURE_STATUS.md` (source line 2258)
- [ ] `docs/DEPLOYMENT_STATUS.md` (source line 2259)
- [ ] Fully implemented. (source line 2263)
- [ ] Tested. (source line 2264)
- [ ] Partially configured. (source line 2265)
- [ ] Awaiting external credentials. (source line 2266)
- [ ] Not ready for operational clinical use. (source line 2267)

# Milestone 10 — GITHUB REPOSITORY, SUPABASE REMOTE DATABASE AND VERCEL DEPLOYMENT

## A. GitHub

- [ ] Check the authenticated GitHub account. (source line 2287)
- [ ] Create a private repository named `medcipher-triage-platform`. (source line 2288)
- [ ] Initialise Git if needed. (source line 2289)
- [ ] Use `main` as the production branch. (source line 2290)
- [ ] Add a suitable `.gitignore`. (source line 2291)
- [ ] Ensure `.env.local`, `.env`, credentials, `.vercel`, secrets and private patient data are never committed. (source line 2292)
- [ ] Add an informative README. (source line 2293)
- [ ] Add the source code. (source line 2294)
- [ ] Commit in logical milestones. (source line 2295)
- [ ] Push the project to GitHub. (source line 2296)
- [ ] `README.md` (source line 2302)
- [ ] `.gitignore` (source line 2303)
- [ ] `.github/workflows/ci.yml` (source line 2304)
- [ ] `SECURITY.md` (source line 2305)
- [ ] `CONTRIBUTING.md`, if useful. (source line 2306)

## B. GitHub CI

- [ ] Dependency installation. (source line 2314)
- [ ] Formatting verification. (source line 2315)
- [ ] Lint. (source line 2316)
- [ ] TypeScript checking. (source line 2317)
- [ ] Unit tests. (source line 2318)
- [ ] Integration tests where credentials are safely available. (source line 2319)
- [ ] Production build. (source line 2320)
- [ ] Dependency security checks. (source line 2321)

## C. Supabase remote project

- [ ] Use available authenticated Supabase tools or the official CLI. (source line 2335)
- [ ] Confirm the target organisation. (source line 2336)
- [ ] Create the requested project only after the required project selection. (source line 2337)
- [ ] Choose a supported region appropriate for the target users. (source line 2338)
- [ ] Never reset an existing production database. (source line 2339)
- [ ] Project URL. (source line 2343)
- [ ] Publishable key. (source line 2344)
- [ ] Database connection. (source line 2345)
- [ ] Authentication settings. (source line 2346)
- [ ] Email confirmation/redirect settings. (source line 2347)
- [ ] Database migrations. (source line 2348)
- [ ] RLS policies. (source line 2349)
- [ ] Realtime configuration. (source line 2350)
- [ ] Storage policies. (source line 2351)

## D. Environment variables

## E. Vercel project

- [ ] Next.js framework. (source line 2395)
- [ ] Correct project root. (source line 2396)
- [ ] Build command. (source line 2397)
- [ ] Environment variables. (source line 2398)
- [ ] Preview environment. (source line 2399)
- [ ] Production environment. (source line 2400)
- [ ] Main production branch. (source line 2401)

## F. Preview deployment

- [ ] Build the production application locally or with the appropriate Vercel build workflow. (source line 2411)
- [ ] Resolve build errors. (source line 2412)
- [ ] Deploy a preview. (source line 2413)
- [ ] Open the preview URL. (source line 2414)
- [ ] Verify authentication. (source line 2415)
- [ ] Verify the patient QR flow. (source line 2416)
- [ ] Verify the staff dashboards. (source line 2417)
- [ ] Verify the database connection. (source line 2418)
- [ ] Verify realtime notifications. (source line 2419)
- [ ] Verify all essential E2E workflows. (source line 2420)

## G. Production deployment

- [ ] Confirm the target Vercel project. (source line 2426)
- [ ] Confirm the intended GitHub commit. (source line 2427)
- [ ] Confirm production environment variables. (source line 2428)
- [ ] Confirm database migrations are applied and compatible. (source line 2429)
- [ ] Deploy the production branch. (source line 2430)
- [ ] Verify the deployment status. (source line 2431)
- [ ] Verify the live website. (source line 2432)
- [ ] Check application logs. (source line 2433)
- [ ] Check critical API routes. (source line 2434)
- [ ] Check authentication. (source line 2435)
- [ ] Check the Supabase connection. (source line 2436)

## H. Deployment verification

- [ ] GitHub repository URL. (source line 2446)
- [ ] Git branch. (source line 2447)
- [ ] Latest commit. (source line 2448)
- [ ] Supabase project reference. (source line 2449)
- [ ] Database migration status. (source line 2450)
- [ ] Vercel project name. (source line 2451)
- [ ] Preview deployment URL. (source line 2452)
- [ ] Production URL. (source line 2453)
- [ ] Deployment status. (source line 2454)
- [ ] Build status. (source line 2455)
- [ ] CI status. (source line 2456)
- [ ] Remaining environment setup. (source line 2457)

# Milestone 11 — FINAL MASTER ACCEPTANCE TEST AND PROJECT COMPLETION

## 1. Functional acceptance

- [ ] QR registration. (source line 2475)
- [ ] Patient intake. (source line 2476)
- [ ] Symptom collection. (source line 2477)
- [ ] Multilingual UI. (source line 2478)
- [ ] Assisted registration. (source line 2479)
- [ ] Encounter tracking. (source line 2480)
- [ ] Secure patient status. (source line 2481)
- [ ] Emergency overrides. (source line 2485)
- [ ] GREEN/YELLOW/RED. (source line 2486)
- [ ] Assessment-required state. (source line 2487)
- [ ] Score out of 100. (source line 2488)
- [ ] Decimal scores. (source line 2489)
- [ ] Scoring explanation. (source line 2490)
- [ ] Clinical verification. (source line 2491)
- [ ] Manual override. (source line 2492)
- [ ] Reassessment. (source line 2493)
- [ ] Versioned protocols. (source line 2494)
- [ ] Dynamic ordering. (source line 2498)
- [ ] Emergency priority. (source line 2499)
- [ ] Waiting-time tracking. (source line 2500)
- [ ] Deterioration escalation. (source line 2501)
- [ ] Department queues. (source line 2502)
- [ ] Live updates. (source line 2503)
- [ ] Nurse alerts. (source line 2507)
- [ ] Doctor alerts. (source line 2508)
- [ ] Emergency alerts. (source line 2509)
- [ ] Role-based routing. (source line 2510)
- [ ] Acknowledgement. (source line 2511)
- [ ] Escalation. (source line 2512)
- [ ] Alert history. (source line 2513)
- [ ] Staff management. (source line 2517)
- [ ] Department management. (source line 2518)
- [ ] Bed management. (source line 2519)
- [ ] Stretcher management. (source line 2520)
- [ ] Resource allocation. (source line 2521)
- [ ] Patient movement. (source line 2522)
- [ ] Admissions. (source line 2523)
- [ ] Discharges. (source line 2524)
- [ ] Referrals. (source line 2525)
- [ ] Transfers. (source line 2526)
- [ ] PWA installation. (source line 2530)
- [ ] Offline drafts. (source line 2531)
- [ ] Local storage. (source line 2532)
- [ ] Sync queue. (source line 2533)
- [ ] Duplicate prevention. (source line 2534)
- [ ] Recovery after reconnection. (source line 2535)
- [ ] Low-bandwidth interface. (source line 2536)
- [ ] Language support. (source line 2537)
- [ ] Hospital dashboard. (source line 2541)
- [ ] Workload analytics. (source line 2542)
- [ ] Bed occupancy. (source line 2543)
- [ ] Patient-flow reporting. (source line 2544)
- [ ] Forecasting. (source line 2545)
- [ ] Staff management. (source line 2546)
- [ ] Audit logs. (source line 2547)
- [ ] Protocol administration. (source line 2548)
- [ ] Supabase schema. (source line 2552)
- [ ] Supabase RLS. (source line 2553)
- [ ] Supabase Auth. (source line 2554)
- [ ] Supabase Realtime. (source line 2555)
- [ ] GitHub repository. (source line 2556)
- [ ] CI pipeline. (source line 2557)
- [ ] Vercel preview deployment. (source line 2558)
- [ ] Production deployment. (source line 2559)

## 2. Technical acceptance

- [ ] Formatter. (source line 2565)
- [ ] Linter. (source line 2566)
- [ ] TypeScript compiler. (source line 2567)
- [ ] Unit tests. (source line 2568)
- [ ] Integration tests. (source line 2569)
- [ ] E2E tests. (source line 2570)
- [ ] Production build. (source line 2571)
- [ ] Database security checks. (source line 2572)
- [ ] RLS tests. (source line 2573)
- [ ] Dependency audit. (source line 2574)

## 3. Clinical-safety acceptance

- [ ] Emergency actions never depend on a score. (source line 2582)
- [ ] No automatic diagnosis is presented. (source line 2583)
- [ ] No missing data is treated as normal. (source line 2584)
- [ ] Clinical category overrides are auditable. (source line 2585)
- [ ] Assessment-required cases remain visible to staff. (source line 2586)
- [ ] The patient is never denied entry because of technology. (source line 2587)
- [ ] No resource shortage downgrades priority. (source line 2588)
- [ ] Unvalidated scoring is visibly labelled. (source line 2589)
- [ ] Clinical deployment remains disabled until proper review. (source line 2590)

## 4. User experience acceptance

- [ ] Desktop. (source line 2596)
- [ ] Tablet. (source line 2597)
- [ ] Android-sized mobile screen. (source line 2598)
- [ ] Low-resolution screen. (source line 2599)
- [ ] Keyboard-only navigation. (source line 2600)
- [ ] Screen-reader-oriented form controls. (source line 2601)

## 5. Final deliverables

- [ ] Final GitHub repository. (source line 2609)
- [ ] Working Vercel deployment. (source line 2610)
- [ ] Confirmed Supabase database. (source line 2611)
- [ ] Database migration files. (source line 2612)
- [ ] Complete README. (source line 2613)
- [ ] Architecture document. (source line 2614)
- [ ] Database schema document. (source line 2615)
- [ ] API documentation. (source line 2616)
- [ ] Role permission matrix. (source line 2617)
- [ ] Clinical algorithm documentation. (source line 2618)
- [ ] Test plan and results. (source line 2619)
- [ ] Security audit. (source line 2620)
- [ ] Deployment instructions. (source line 2621)
- [ ] Demo credentials for synthetic data, only in the documented non-production demo environment. (source line 2622)
- [ ] A five-patient demonstration script. (source line 2623)
- [ ] A list of limitations and future development. (source line 2624)

## 6. Final report

- [ ] Feature. (source line 2630)
- [ ] Implementation status. (source line 2631)
- [ ] Test status. (source line 2632)
- [ ] Database integration status. (source line 2633)
- [ ] Deployment status. (source line 2634)
- [ ] Remaining limitation. (source line 2635)
