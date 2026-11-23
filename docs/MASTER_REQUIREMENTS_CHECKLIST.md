# Master requirement acceptance ledger

Every bulleted or numbered requirement in the supplied master prompt is retained below, including repeated requirements. An unchecked item means final requirement-level acceptance is still outstanding; implemented subsets are evidenced in FEATURE_STATUS.md and TEST_RESULTS.md. This ledger must not be represented as a completed acceptance test.

Source: PRODUCT_REQUIREMENTS.md. Clinical operation remains disabled.

# MEDASSESS

# PROMPT 0 — THE SUPER MASTER PROMPT

## Project identity, complete requirements and permanent development instructions

- [ ] Senior full-stack architect. (source line 17)
- [ ] Senior Next.js and TypeScript developer. (source line 18)
- [ ] Supabase database architect. (source line 19)
- [ ] UI/UX designer. (source line 20)
- [ ] Healthcare workflow systems engineer. (source line 21)
- [ ] Application security engineer. (source line 22)
- [ ] QA and automation engineer. (source line 23)
- [ ] DevOps and deployment engineer. (source line 24)

## A. Product vision

- [ ] Government hospitals. (source line 36)
- [ ] Rural primary healthcare centres. (source line 37)
- [ ] Community health centres. (source line 38)
- [ ] District hospitals. (source line 39)
- [ ] Large hospitals. (source line 40)
- [ ] Multi-department healthcare facilities. (source line 41)

## B. Complete list of functional modules

### Module 1 — Patient registration and QR management

- [ ] Generate a unique patient encounter ID. (source line 53)
- [ ] Generate a secure QR code for every new encounter. (source line 54)
- [ ] Allow patients to scan the QR code using their smartphones. (source line 55)
- [ ] Open a mobile-friendly patient registration page. (source line 56)
- [ ] Collect patient information, symptoms, medical history and relevant information. (source line 57)
- [ ] Support assisted registration by receptionists and nurses. (source line 58)
- [ ] Support QR printing and manual token entry. (source line 59)
- [ ] Allow registration without a smartphone. (source line 60)
- [ ] Allow multiple hospital visits for the same patient. (source line 61)
- [ ] Distinguish a permanent patient record from an individual encounter. (source line 62)
- [ ] Maintain timestamps for arrival and registration. (source line 63)
- [ ] Support registration of unidentified emergency patients. (source line 64)

### Module 2 — Patient information and symptom collection

- [ ] Name. (source line 70)
- [ ] Age/date of birth. (source line 71)
- [ ] Sex where clinically relevant. (source line 72)
- [ ] Contact information where available. (source line 73)
- [ ] Primary symptoms. (source line 74)
- [ ] Secondary symptoms. (source line 75)
- [ ] Symptom duration. (source line 76)
- [ ] Symptom progression. (source line 77)
- [ ] Pain severity. (source line 78)
- [ ] Injuries. (source line 79)
- [ ] Bleeding. (source line 80)
- [ ] Breathing difficulties. (source line 81)
- [ ] Consciousness status. (source line 82)
- [ ] Existing medical conditions. (source line 83)
- [ ] Allergies. (source line 84)
- [ ] Current medications. (source line 85)
- [ ] Pregnancy information where relevant and appropriately collected. (source line 86)
- [ ] Previous relevant medical history. (source line 87)
- [ ] Patient-reported emergency warning signs. (source line 88)
- [ ] Vital signs when available. (source line 89)

### Module 3 — Intelligent clinical triage engine

- [ ] GREEN — Non-immediate care. (source line 101)
- [ ] YELLOW — Immediate/urgent assessment. (source line 102)
- [ ] RED — Critical/emergency. (source line 103)
- [ ] Emergency warning-sign screening. (source line 109)
- [ ] Emergency overrides. (source line 110)
- [ ] Vital-sign assessment. (source line 111)
- [ ] Symptom-severity evaluation. (source line 112)
- [ ] Relevant medical risk factors. (source line 113)
- [ ] Patient deterioration. (source line 114)
- [ ] Human clinical verification. (source line 115)
- [ ] Clinician override. (source line 116)
- [ ] Clinical reassessment. (source line 117)
- [ ] Clinical assessment history. (source line 118)
- [ ] Versioned triage protocols. (source line 119)
- [ ] Explainable decision results. (source line 120)

### Module 4 — Dynamic patient ranking

- [ ] Clinical urgency category. (source line 138)
- [ ] Emergency override. (source line 139)
- [ ] Clinician-assigned sub-priority. (source line 140)
- [ ] Patient deterioration. (source line 141)
- [ ] Reassessment status. (source line 142)
- [ ] Waiting time. (source line 143)
- [ ] Assessment status. (source line 144)
- [ ] Assigned department. (source line 145)

### Module 5 — Emergency notifications

- [ ] Assigned nurse. (source line 161)
- [ ] General-care queue. (source line 162)
- [ ] Triage nurse. (source line 166)
- [ ] Duty doctor. (source line 167)
- [ ] Urgent assessment area. (source line 168)
- [ ] Emergency team. (source line 172)
- [ ] Emergency coordinator. (source line 173)
- [ ] Duty doctor. (source line 174)
- [ ] Senior emergency clinician according to the hospital's configured escalation policy. (source line 175)
- [ ] Cardiac team. (source line 179)
- [ ] Stroke team. (source line 180)
- [ ] Trauma team. (source line 181)
- [ ] Surgical team when clinically requested. (source line 182)
- [ ] ICU/critical-care team. (source line 183)
- [ ] Bed coordinator. (source line 184)
- [ ] Referral coordinator. (source line 185)
- [ ] Instant in-app alerts. (source line 189)
- [ ] Real-time notification delivery. (source line 190)
- [ ] Alert acknowledgement. (source line 191)
- [ ] Staff assignment. (source line 192)
- [ ] Alert resolution. (source line 193)
- [ ] Escalation of unacknowledged alerts. (source line 194)
- [ ] Notification history. (source line 195)
- [ ] Read/unread status. (source line 196)
- [ ] Timestamps. (source line 197)
- [ ] Acknowledgement records. (source line 198)
- [ ] Backup escalation contacts. (source line 199)

### Module 6 — Nurse dashboard

- [ ] Newly registered patients. (source line 213)
- [ ] Patients awaiting triage. (source line 214)
- [ ] GREEN queue. (source line 215)
- [ ] YELLOW queue. (source line 216)
- [ ] RED emergency cases. (source line 217)
- [ ] Patients requiring reassessment. (source line 218)
- [ ] Patient medical summary. (source line 219)
- [ ] Vital-sign entry. (source line 220)
- [ ] Clinical verification. (source line 221)
- [ ] Priority update. (source line 222)
- [ ] Department assignment. (source line 223)
- [ ] Alert acknowledgement. (source line 224)
- [ ] Status change. (source line 225)
- [ ] Reassessment timer. (source line 226)
- [ ] Escalation functionality. (source line 227)
- [ ] Patient handover. (source line 228)

### Module 7 — Doctor dashboard

- [ ] Assigned patients. (source line 234)
- [ ] Emergency cases. (source line 235)
- [ ] Urgent cases. (source line 236)
- [ ] Pending examinations. (source line 237)
- [ ] Patient clinical history. (source line 238)
- [ ] Current symptoms. (source line 239)
- [ ] Vital-sign history. (source line 240)
- [ ] Clinical triage results. (source line 241)
- [ ] Priority explanation. (source line 242)
- [ ] Previous assessment records. (source line 243)
- [ ] Reassessment status. (source line 244)
- [ ] Treatment notes. (source line 245)
- [ ] Investigation requests. (source line 246)
- [ ] Admission decisions. (source line 247)
- [ ] Referral decisions. (source line 248)
- [ ] Discharge workflow. (source line 249)

### Module 8 — SmartFlow patient-flow management

- [ ] Discharged. (source line 261)
- [ ] Admitted. (source line 262)
- [ ] Referred. (source line 263)
- [ ] Transferred. (source line 264)
- [ ] Cancelled/no-show, with authorised handling. (source line 265)
- [ ] Patient inflow monitoring. (source line 271)
- [ ] Queue monitoring. (source line 272)
- [ ] Department-level patient tracking. (source line 273)
- [ ] Doctor workload. (source line 274)
- [ ] Nurse workload. (source line 275)
- [ ] Waiting-time tracking. (source line 276)
- [ ] Diagnostic waiting. (source line 277)
- [ ] Bed waiting. (source line 278)
- [ ] Referral waiting. (source line 279)
- [ ] Discharge tracking. (source line 280)
- [ ] Patient outflow analytics. (source line 281)

### Module 9 — Resource management

- [ ] Hospital beds. (source line 289)
- [ ] Emergency beds. (source line 290)
- [ ] ICU beds. (source line 291)
- [ ] Stretchers. (source line 292)
- [ ] Wheelchairs. (source line 293)
- [ ] Emergency equipment. (source line 294)
- [ ] Departments. (source line 295)
- [ ] Doctors. (source line 296)
- [ ] Nurses. (source line 297)
- [ ] Available staff shifts. (source line 298)
- [ ] Staff assignments. (source line 299)
- [ ] Department capacity. (source line 300)

### Module 10 — Referral and inter-hospital coordination

- [ ] Referral destination directory. (source line 318)
- [ ] Facility contact information. (source line 319)
- [ ] Available services and capabilities. (source line 320)
- [ ] Referral reason. (source line 321)
- [ ] Referring doctor. (source line 322)
- [ ] Referral clinical summary. (source line 323)
- [ ] Required transport. (source line 324)
- [ ] Ambulance coordination status. (source line 325)
- [ ] Receiving-hospital acknowledgement. (source line 326)
- [ ] Transfer status. (source line 327)
- [ ] Referral completion. (source line 328)

### Module 11 — Rural and offline functionality

- [ ] Web app manifest. (source line 338)
- [ ] Service worker. (source line 339)
- [ ] Offline application shell. (source line 340)
- [ ] Offline registration drafts. (source line 341)
- [ ] Offline encounter creation for authorised staff. (source line 342)
- [ ] IndexedDB persistence. (source line 343)
- [ ] Outbox-based synchronisation. (source line 344)
- [ ] Retry mechanisms. (source line 345)
- [ ] Idempotent operations. (source line 346)
- [ ] Synchronisation status. (source line 347)
- [ ] Conflict detection. (source line 348)
- [ ] Manual synchronisation. (source line 349)
- [ ] Recovery after internet disconnection. (source line 350)

### Module 12 — Administrator dashboard

- [ ] Total registrations. (source line 364)
- [ ] Current queue. (source line 365)
- [ ] Critical cases. (source line 366)
- [ ] Urgent cases. (source line 367)
- [ ] Non-immediate cases. (source line 368)
- [ ] Patients waiting for reassessment. (source line 369)
- [ ] Department workload. (source line 370)
- [ ] Available staff. (source line 371)
- [ ] Bed occupancy. (source line 372)
- [ ] Available emergency resources. (source line 373)
- [ ] Admissions. (source line 374)
- [ ] Discharges. (source line 375)
- [ ] Referrals. (source line 376)
- [ ] Transfers. (source line 377)
- [ ] Waiting-time summaries. (source line 378)
- [ ] Patient-flow analytics. (source line 379)

### Module 13 — Operational forecasting

- [ ] Expected patient arrival patterns. (source line 387)
- [ ] Peak hours. (source line 388)
- [ ] Department workload. (source line 389)
- [ ] Bed demand. (source line 390)
- [ ] Resource requirements. (source line 391)
- [ ] Potential staffing pressure. (source line 392)

### Module 14 — Security and privacy

- [ ] Supabase authentication. (source line 402)
- [ ] Role-based access control. (source line 403)
- [ ] Hospital-level data isolation. (source line 404)
- [ ] Row Level Security on all exposed tables. (source line 405)
- [ ] Server-side authorisation. (source line 406)
- [ ] Secure QR tokens. (source line 407)
- [ ] Token expiry and revocation. (source line 408)
- [ ] Rate limiting. (source line 409)
- [ ] Audit logs. (source line 410)
- [ ] Secure validation. (source line 411)
- [ ] Protected documents. (source line 412)
- [ ] Secure environment variables. (source line 413)
- [ ] No exposure of service-role credentials. (source line 414)
- [ ] Restricted patient information access. (source line 415)
- [ ] Appropriate privacy notices and consent handling. (source line 416)

### Module 15 — Testing and reliability

- [ ] Unit tests. (source line 424)
- [ ] Integration tests. (source line 425)
- [ ] End-to-end tests. (source line 426)
- [ ] Database tests. (source line 427)
- [ ] RLS tests. (source line 428)
- [ ] Authentication tests. (source line 429)
- [ ] Triage scenario tests. (source line 430)
- [ ] Queue-ordering tests. (source line 431)
- [ ] Notification tests. (source line 432)
- [ ] Offline synchronisation tests. (source line 433)
- [ ] Resource allocation concurrency tests. (source line 434)
- [ ] Accessibility tests. (source line 435)
- [ ] Responsive layout tests. (source line 436)

## C. Permanent technical requirements

- [ ] Next.js App Router. (source line 446)
- [ ] TypeScript with strict mode. (source line 447)
- [ ] React. (source line 448)
- [ ] Tailwind CSS. (source line 449)
- [ ] shadcn/ui or accessible equivalent components. (source line 450)
- [ ] Supabase PostgreSQL. (source line 451)
- [ ] Supabase Auth. (source line 452)
- [ ] Supabase Realtime where appropriate. (source line 453)
- [ ] Supabase Storage only for required protected files. (source line 454)
- [ ] `@supabase/ssr` for cookie-based Next.js sessions. (source line 455)
- [ ] IndexedDB for offline drafts/outbox. (source line 456)
- [ ] Vercel for hosting. (source line 457)
- [ ] GitHub for version control. (source line 458)
- [ ] UI components. (source line 466)
- [ ] Server actions and route handlers. (source line 467)
- [ ] Database access. (source line 468)
- [ ] Business logic. (source line 469)
- [ ] Clinical triage rules. (source line 470)
- [ ] Queue algorithms. (source line 471)
- [ ] Notification adapters. (source line 472)
- [ ] Resource allocation. (source line 473)
- [ ] Offline synchronisation. (source line 474)
- [ ] Tests. (source line 475)

## D. Critical clinical safety requirements

## E. Development discipline

- [ ] Inspect the complete repository. (source line 501)
- [ ] Inspect all existing files and configuration. (source line 502)
- [ ] Detect whether this is an empty project or an existing application. (source line 503)
- [ ] Never overwrite an existing working project without examining it. (source line 504)
- [ ] Establish the implementation plan. (source line 505)
- [ ] Create a permanent `AGENTS.md` containing project instructions. (source line 506)
- [ ] Create documentation explaining the architecture and feature modules. (source line 507)
- [ ] Maintain a development checklist. (source line 508)
- [ ] Maintain a known-issues register. (source line 509)
- [ ] Implement the requested functionality. (source line 513)
- [ ] Run formatting. (source line 514)
- [ ] Run lint. (source line 515)
- [ ] Run TypeScript checks. (source line 516)
- [ ] Run relevant tests. (source line 517)
- [ ] Run a production build when appropriate. (source line 518)
- [ ] Fix errors rather than hiding or disabling checks. (source line 519)
- [ ] Update documentation. (source line 520)
- [ ] Update the milestone checklist. (source line 521)
- [ ] Report completed features and remaining blockers. (source line 522)

## F. Final outcome

- [ ] A working patient portal. (source line 536)
- [ ] A working reception and QR registration interface. (source line 537)
- [ ] A working clinical triage engine. (source line 538)
- [ ] A working dynamic queue. (source line 539)
- [ ] A working nurse interface. (source line 540)
- [ ] A working doctor interface. (source line 541)
- [ ] A working emergency coordination interface. (source line 542)
- [ ] A working resource management interface. (source line 543)
- [ ] A working SmartFlow module. (source line 544)
- [ ] A working admin dashboard. (source line 545)
- [ ] Working offline registration and synchronisation. (source line 546)
- [ ] Working referral and discharge management. (source line 547)
- [ ] An operational analytics dashboard. (source line 548)
- [ ] A Supabase database with migrations and RLS. (source line 549)
- [ ] A GitHub repository. (source line 550)
- [ ] A Vercel preview deployment. (source line 551)
- [ ] A tested production deployment once configuration and approval are complete. (source line 552)

# PROMPT 1 — PROJECT INITIALISATION, ARCHITECTURE AND PROFESSIONAL UI

### 1. Repository inspection

- [ ] Existing framework. (source line 570)
- [ ] Package manager. (source line 571)
- [ ] Existing components. (source line 572)
- [ ] Configuration. (source line 573)
- [ ] Git status. (source line 574)
- [ ] Existing remotes. (source line 575)
- [ ] Existing deployments or Supabase configuration if present. (source line 576)

### 2. Initialise the application

- [ ] TypeScript strict mode. (source line 584)
- [ ] Tailwind CSS. (source line 585)
- [ ] shadcn/ui or accessible equivalent. (source line 586)
- [ ] Lucide icons. (source line 587)
- [ ] Responsive layouts. (source line 588)
- [ ] Reusable components. (source line 589)
- [ ] Centralised design tokens. (source line 590)
- [ ] Form validation. (source line 591)
- [ ] Error boundaries. (source line 592)
- [ ] Loading states. (source line 593)
- [ ] Toast notifications. (source line 594)
- [ ] Accessibility support. (source line 595)

### 3. Professional visual design

- [ ] Modern hospital management software. (source line 607)
- [ ] Clean professional dashboard. (source line 608)
- [ ] Burgundy and subtle gold brand accents inspired by the MediRoute event identity. (source line 609)
- [ ] Neutral background surfaces. (source line 610)
- [ ] Clear typography. (source line 611)
- [ ] Proper spacing. (source line 612)
- [ ] Clear distinction between navigation and content. (source line 613)
- [ ] Strong visual hierarchy. (source line 614)
- [ ] Medical urgency colours used consistently. (source line 615)

### 4. Create the global application layout

- [ ] Responsive sidebar. (source line 627)
- [ ] Top navigation. (source line 628)
- [ ] Hospital selector, where the user has access to multiple hospitals. (source line 629)
- [ ] Notification centre. (source line 630)
- [ ] Logged-in user menu. (source line 631)
- [ ] Breadcrumbs. (source line 632)
- [ ] Responsive mobile navigation. (source line 633)
- [ ] Profile settings. (source line 634)
- [ ] Logout. (source line 635)
- [ ] Global search where appropriate. (source line 636)

### 5. Create the separate application sections

- [ ] `/` (source line 644)
- [ ] `/patient/start` (source line 645)
- [ ] `/patient/intake/[token]` (source line 646)
- [ ] `/patient/status/[token]` (source line 647)
- [ ] `/emergency` (source line 648)
- [ ] `/login` (source line 652)
- [ ] `/forgot-password` (source line 653)
- [ ] `/auth/callback` (source line 654)
- [ ] `/dashboard` (source line 658)
- [ ] `/reception` (source line 659)
- [ ] `/triage` (source line 660)
- [ ] `/nurse` (source line 661)
- [ ] `/doctor` (source line 662)
- [ ] `/emergency-center` (source line 663)
- [ ] `/queues` (source line 664)
- [ ] `/smartflow` (source line 668)
- [ ] `/resources` (source line 669)
- [ ] `/departments` (source line 670)
- [ ] `/referrals` (source line 671)
- [ ] `/analytics` (source line 672)
- [ ] `/forecasting` (source line 673)
- [ ] `/settings` (source line 674)
- [ ] `/settings/staff` (source line 675)
- [ ] `/settings/hospital` (source line 676)
- [ ] `/settings/triage-protocol` (source line 677)
- [ ] `/audit` (source line 678)

### 6. Build the design system

- [ ] StatusBadge. (source line 688)
- [ ] PriorityBadge. (source line 689)
- [ ] PatientCard. (source line 690)
- [ ] PatientTable. (source line 691)
- [ ] PatientTimeline. (source line 692)
- [ ] VitalSignCard. (source line 693)
- [ ] MetricCard. (source line 694)
- [ ] QueueTable. (source line 695)
- [ ] EmergencyAlertCard. (source line 696)
- [ ] StaffAvailabilityCard. (source line 697)
- [ ] BedAvailabilityCard. (source line 698)
- [ ] DepartmentCard. (source line 699)
- [ ] NotificationPanel. (source line 700)
- [ ] ConfirmationDialog. (source line 701)
- [ ] QRCodeDisplay. (source line 702)
- [ ] EmptyState. (source line 703)
- [ ] LoadingSkeleton. (source line 704)
- [ ] ErrorState. (source line 705)
- [ ] OfflineIndicator. (source line 706)
- [ ] SyncStatusIndicator. (source line 707)

### 7. Responsive requirements

- [ ] No horizontal overflow. (source line 717)
- [ ] Keyboard navigation. (source line 718)
- [ ] Accessible labels. (source line 719)
- [ ] Sufficient contrast. (source line 720)
- [ ] Large touch targets. (source line 721)
- [ ] Screen-reader-friendly forms. (source line 722)
- [ ] Proper responsive tables. (source line 723)

### 8. Deliverables

- [ ] `AGENTS.md` (source line 729)
- [ ] `README.md` (source line 730)
- [ ] `docs/PRODUCT_REQUIREMENTS.md` (source line 731)
- [ ] `docs/ARCHITECTURE.md` (source line 732)
- [ ] `docs/IMPLEMENTATION_PLAN.md` (source line 733)
- [ ] `docs/KNOWN_LIMITATIONS.md` (source line 734)
- [ ] Initial application structure. (source line 735)

# PROMPT 2 — SUPABASE DATABASE, AUTHENTICATION AND SECURITY

### 1. Supabase project setup

- [ ] Use the authenticated Supabase tooling or documented CLI. (source line 759)
- [ ] Check the available organisations and existing projects. (source line 760)
- [ ] Ask me for the necessary project or organisation selection if it cannot be established. (source line 761)
- [ ] Choose a suitable India-region location only after checking the currently supported regions and existing project requirements. (source line 762)
- [ ] Do not create unexpected billable infrastructure. (source line 763)

### 2. Database schema

- [ ] hospitals (source line 773)
- [ ] hospital_memberships (source line 774)
- [ ] user_profiles (source line 775)
- [ ] departments (source line 776)
- [ ] staff_assignments (source line 777)
- [ ] staff_shifts (source line 778)
- [ ] staff_availability (source line 779)
- [ ] patients (source line 783)
- [ ] patient_identifiers (source line 784)
- [ ] patient_encounters (source line 785)
- [ ] encounter_access_tokens (source line 786)
- [ ] patient_emergency_contacts (source line 787)
- [ ] symptom_catalog (source line 791)
- [ ] patient_symptoms (source line 792)
- [ ] medical_histories (source line 793)
- [ ] patient_allergies (source line 794)
- [ ] patient_medications (source line 795)
- [ ] clinical_observations (source line 796)
- [ ] vital_signs (source line 797)
- [ ] triage_protocol_versions (source line 801)
- [ ] triage_rule_definitions (source line 802)
- [ ] triage_assessments (source line 803)
- [ ] triage_assessment_answers (source line 804)
- [ ] triage_score_breakdowns (source line 805)
- [ ] triage_overrides (source line 806)
- [ ] reassessment_records (source line 807)
- [ ] queue_entries (source line 811)
- [ ] queue_events (source line 812)
- [ ] patient_status_events (source line 813)
- [ ] notifications (source line 817)
- [ ] notification_recipients (source line 818)
- [ ] notification_acknowledgements (source line 819)
- [ ] notification_delivery_attempts (source line 820)
- [ ] escalation_policies (source line 821)
- [ ] hospital_resources (source line 825)
- [ ] resource_reservations (source line 826)
- [ ] resource_status_history (source line 827)
- [ ] referral_facilities (source line 831)
- [ ] referrals (source line 832)
- [ ] transfer_records (source line 833)
- [ ] referral_acknowledgements (source line 834)
- [ ] treatment_records (source line 838)
- [ ] investigation_records (source line 839)
- [ ] admissions (source line 840)
- [ ] discharges (source line 841)
- [ ] follow_up_records (source line 842)
- [ ] audit_logs (source line 846)
- [ ] hospital_settings (source line 847)
- [ ] system_settings (source line 848)
- [ ] offline_sync_events (source line 849)
- [ ] operational_daily_metrics (source line 850)

### 3. Data model requirements

### 4. Authentication

- [ ] super_admin (source line 882)
- [ ] hospital_admin (source line 883)
- [ ] receptionist (source line 884)
- [ ] triage_nurse (source line 885)
- [ ] nurse (source line 886)
- [ ] doctor (source line 887)
- [ ] emergency_coordinator (source line 888)
- [ ] resource_manager (source line 889)

### 5. Row Level Security

- [ ] Authenticated user. (source line 905)
- [ ] Hospital membership. (source line 906)
- [ ] Staff role. (source line 907)
- [ ] Assigned department where required. (source line 908)
- [ ] Assigned patient/encounter where applicable. (source line 909)

### 6. Supabase clients

- [ ] Browser Supabase client. (source line 923)
- [ ] Server Supabase client. (source line 924)
- [ ] Cookie/session integration. (source line 925)
- [ ] Middleware or the currently recommended equivalent for protected routes. (source line 926)
- [ ] Safe server-only administrative client when genuinely required. (source line 927)

### 7. Database utilities

- [ ] Database types. (source line 937)
- [ ] Typed query helpers. (source line 938)
- [ ] Server-side repository functions. (source line 939)
- [ ] Safe error handling. (source line 940)
- [ ] Transaction-safe resource reservation logic. (source line 941)
- [ ] Migration files. (source line 942)
- [ ] Seed scripts for development and demo data. (source line 943)

### 8. Supabase verification

- [ ] Staff login. (source line 953)
- [ ] Staff logout. (source line 954)
- [ ] Role restrictions. (source line 955)
- [ ] Hospital isolation. (source line 956)
- [ ] RLS restrictions. (source line 957)
- [ ] Patient encounter access. (source line 958)
- [ ] QR token expiry. (source line 959)
- [ ] Database relationships. (source line 960)
- [ ] Resource reservation constraints. (source line 961)
- [ ] Audit logging. (source line 962)
- [ ] `docs/DATABASE_SCHEMA.md` (source line 972)
- [ ] `docs/ROLE_PERMISSIONS.md` (source line 973)
- [ ] `docs/SUPABASE_SETUP.md` (source line 974)
- [ ] `supabase/migrations/` (source line 975)
- [ ] `supabase/seed.sql` or equivalent safe seed structure. (source line 976)

# PROMPT 3 — PATIENT PORTAL, QR GENERATION AND REGISTRATION

### 1. Reception dashboard

- [ ] Search an existing patient. (source line 994)
- [ ] Create a new patient. (source line 995)
- [ ] Create a new encounter. (source line 996)
- [ ] Register unidentified emergency patients. (source line 997)
- [ ] Record arrival time. (source line 998)
- [ ] Select the department or hospital location. (source line 999)
- [ ] Generate an encounter ID. (source line 1000)
- [ ] Generate a QR code. (source line 1001)
- [ ] Print a QR token. (source line 1002)
- [ ] Copy the patient entry link. (source line 1003)
- [ ] Revoke and regenerate an encounter access token. (source line 1004)
- [ ] See registration status. (source line 1005)

### 2. QR code mechanism

- [ ] Token validation. (source line 1021)
- [ ] Token expiration. (source line 1022)
- [ ] Token revocation. (source line 1023)
- [ ] Rate limiting. (source line 1024)
- [ ] Replay protection where appropriate. (source line 1025)
- [ ] Safe error messages. (source line 1026)
- [ ] Access logging without logging raw tokens. (source line 1027)

### 3. Patient registration flow

- [ ] MediRoute identity. (source line 1037)
- [ ] Language selection. (source line 1038)
- [ ] Encounter verification. (source line 1039)
- [ ] Patient details. (source line 1040)
- [ ] Basic medical history. (source line 1041)
- [ ] Symptoms and complaints. (source line 1042)
- [ ] Symptom duration. (source line 1043)
- [ ] Symptom severity. (source line 1044)
- [ ] Bleeding/injury reporting. (source line 1045)
- [ ] Breathing status. (source line 1046)
- [ ] Consciousness status. (source line 1047)
- [ ] Relevant warning signs. (source line 1048)
- [ ] Medical conditions. (source line 1049)
- [ ] Allergies. (source line 1050)
- [ ] Current medications. (source line 1051)
- [ ] Vital signs if measured and entered by a qualified staff member or reliable source. (source line 1052)
- [ ] Review and submit. (source line 1053)

### 4. Accessibility and language

- [ ] Large text. (source line 1069)
- [ ] Pictorial options. (source line 1070)
- [ ] Simple terminology. (source line 1071)
- [ ] Voice input where browser support exists. (source line 1072)
- [ ] Manual typing fallback. (source line 1073)
- [ ] Clear progress indicators. (source line 1074)
- [ ] Screen-reader labels. (source line 1075)

### 5. Assisted registration

- [ ] Elderly patients. (source line 1085)
- [ ] Unconscious patients. (source line 1086)
- [ ] Injured patients. (source line 1087)
- [ ] Children with guardians. (source line 1088)
- [ ] Patients unable to use smartphones. (source line 1089)
- [ ] Patients who do not understand the available languages. (source line 1090)

### 6. Patient status page

- [ ] Registration confirmation. (source line 1098)
- [ ] Encounter token/reference. (source line 1099)
- [ ] Current general status. (source line 1100)
- [ ] Waiting instruction approved by staff. (source line 1101)
- [ ] Department assignment when confirmed. (source line 1102)
- [ ] General progress updates. (source line 1103)

### 7. QR printing

- [ ] MediRoute branding. (source line 1111)
- [ ] Encounter reference. (source line 1112)
- [ ] QR code. (source line 1113)
- [ ] Simple scan instructions. (source line 1114)
- [ ] Hospital name. (source line 1115)
- [ ] Arrival timestamp. (source line 1116)

### 8. Validation

- [ ] Successful QR scan. (source line 1124)
- [ ] Invalid QR. (source line 1125)
- [ ] Expired QR. (source line 1126)
- [ ] Revoked QR. (source line 1127)
- [ ] Repeated submissions. (source line 1128)
- [ ] Incomplete form. (source line 1129)
- [ ] Emergency warning sign. (source line 1130)
- [ ] Offline reception entry. (source line 1131)
- [ ] Multiple encounters for one patient. (source line 1132)
- [ ] Printing. (source line 1133)
- [ ] Small-screen mobile layout. (source line 1134)

# PROMPT 4 — CLINICAL TRIAGE ENGINE, EMERGENCY OVERRIDE AND SCORING

### 1. Separate the clinical classification from numerical scoring

### 2. Emergency override

- [ ] Cardiac arrest or unresponsiveness. (source line 1166)
- [ ] Severe respiratory distress. (source line 1167)
- [ ] Severe uncontrolled bleeding. (source line 1168)
- [ ] Suspected stroke. (source line 1169)
- [ ] Ongoing seizure. (source line 1170)
- [ ] Major trauma. (source line 1171)
- [ ] Suspected shock. (source line 1172)
- [ ] Other clinician-approved emergencies. (source line 1173)
- [ ] Create an emergency escalation record. (source line 1177)
- [ ] Bypass routine queue waiting. (source line 1178)
- [ ] Activate the emergency notification workflow. (source line 1179)
- [ ] Notify the assigned response team. (source line 1180)
- [ ] Request necessary assistance. (source line 1181)
- [ ] Record the trigger and timestamp. (source line 1182)
- [ ] Continue to request human assessment. (source line 1183)
- [ ] Preserve the override in the audit history. (source line 1184)

### 3. Triage categories

### 4. Rule engine architecture

- [ ] Rule definitions. (source line 1212)
- [ ] Input validation. (source line 1213)
- [ ] Warning-sign detection. (source line 1214)
- [ ] Missing-data detection. (source line 1215)
- [ ] Vital-sign evaluation. (source line 1216)
- [ ] Symptom evaluation. (source line 1217)
- [ ] Risk-factor evaluation. (source line 1218)
- [ ] Classification. (source line 1219)
- [ ] Explanation generation. (source line 1220)
- [ ] Clinician verification. (source line 1221)
- [ ] Audit recording. (source line 1222)
- [ ] Name. (source line 1228)
- [ ] Version. (source line 1229)
- [ ] Status. (source line 1230)
- [ ] Source/reference. (source line 1231)
- [ ] Author. (source line 1232)
- [ ] Clinical reviewer. (source line 1233)
- [ ] Approval timestamp. (source line 1234)
- [ ] Effective date. (source line 1235)
- [ ] Expiry or review date where applicable. (source line 1236)

### 5. Score out of 100

- [ ] Clinical urgency indicators: 0–40. (source line 1246)
- [ ] Vital-sign abnormalities: 0–25. (source line 1247)
- [ ] Symptom severity/progression: 0–15. (source line 1248)
- [ ] Relevant risk factors: 0–10. (source line 1249)
- [ ] Waiting-time escalation component: 0–10. (source line 1250)
- [ ] Allow decimal scores. (source line 1256)
- [ ] Return a score from 0 to 100. (source line 1257)
- [ ] Produce a component breakdown. (source line 1258)
- [ ] Explain why points were assigned. (source line 1259)
- [ ] Handle missing information. (source line 1260)
- [ ] Store the scoring protocol version. (source line 1261)
- [ ] Make every calculation reproducible. (source line 1262)
- [ ] Include unit tests. (source line 1263)

### 6. Human verification

- [ ] Review the assessment. (source line 1275)
- [ ] Confirm the category. (source line 1276)
- [ ] Change a proposed category. (source line 1277)
- [ ] Enter a clinical reason for override. (source line 1278)
- [ ] Update vital signs. (source line 1279)
- [ ] Record a reassessment. (source line 1280)
- [ ] Escalate the patient. (source line 1281)
- [ ] Record who made the final decision. (source line 1282)

### 7. Reassessment

- [ ] Last assessment time. (source line 1294)
- [ ] Next reassessment due. (source line 1295)
- [ ] Overdue indicator. (source line 1296)
- [ ] Current patient status. (source line 1297)
- [ ] Deterioration history. (source line 1298)

### 8. Clinical simulation tests

- [ ] Mild fever. (source line 1308)
- [ ] Mild injury. (source line 1309)
- [ ] Worsening symptoms. (source line 1310)
- [ ] Concerning chest pain. (source line 1311)
- [ ] Suspected stroke. (source line 1312)
- [ ] Severe bleeding. (source line 1313)
- [ ] Respiratory distress. (source line 1314)
- [ ] Cardiac arrest. (source line 1315)
- [ ] Missing information. (source line 1316)
- [ ] Elderly patient. (source line 1317)
- [ ] Unconscious patient. (source line 1318)
- [ ] Changing vital signs. (source line 1319)

### 9. Deliverables

- [ ] Clinical engine. (source line 1329)
- [ ] Rule versioning. (source line 1330)
- [ ] Score engine. (source line 1331)
- [ ] Breakdown UI. (source line 1332)
- [ ] Clinical assessment UI. (source line 1333)
- [ ] Override workflow. (source line 1334)
- [ ] Reassessment logic. (source line 1335)
- [ ] Unit and integration tests. (source line 1336)
- [ ] `docs/TRIAGE_ALGORITHM.md` (source line 1337)
- [ ] `docs/CLINICAL_SAFETY.md` (source line 1338)

# PROMPT 5 — DYNAMIC QUEUES, STAFF DASHBOARDS AND EMERGENCY NOTIFICATIONS

### 1. Live patient queue

- [ ] Awaiting triage. (source line 1350)
- [ ] GREEN/general care. (source line 1351)
- [ ] YELLOW/urgent assessment. (source line 1352)
- [ ] RED/emergency. (source line 1353)
- [ ] Reassessment required. (source line 1354)
- [ ] Awaiting doctor. (source line 1355)
- [ ] Awaiting investigation. (source line 1356)
- [ ] Awaiting admission. (source line 1357)
- [ ] Awaiting referral. (source line 1358)

### 2. Queue ordering

- [ ] Active emergency cases. (source line 1366)
- [ ] Other RED cases. (source line 1367)
- [ ] YELLOW cases. (source line 1368)
- [ ] GREEN cases. (source line 1369)
- [ ] Clinical sub-priority. (source line 1373)
- [ ] Deterioration alerts. (source line 1374)
- [ ] Reassessment overdue. (source line 1375)
- [ ] Validated secondary priority indicator. (source line 1376)
- [ ] Waiting time. (source line 1377)
- [ ] Arrival time as a tie-breaker. (source line 1378)

### 3. Supabase Realtime

- [ ] New patient. (source line 1390)
- [ ] Updated patient status. (source line 1391)
- [ ] New alert. (source line 1392)
- [ ] Alert acknowledgement. (source line 1393)
- [ ] Queue movement. (source line 1394)
- [ ] Resource update. (source line 1395)

### 4. Nurse dashboard

- [ ] Patient queue. (source line 1407)
- [ ] Triage status. (source line 1408)
- [ ] Vital signs. (source line 1409)
- [ ] Reassessment deadlines. (source line 1410)
- [ ] Alerts. (source line 1411)
- [ ] Patients assigned to the nurse. (source line 1412)
- [ ] Unacknowledged tasks. (source line 1413)
- [ ] Open patient. (source line 1417)
- [ ] Begin assessment. (source line 1418)
- [ ] Record vital signs. (source line 1419)
- [ ] Verify category. (source line 1420)
- [ ] Request doctor. (source line 1421)
- [ ] Escalate. (source line 1422)
- [ ] Complete assessment. (source line 1423)
- [ ] Update patient destination. (source line 1424)

### 5. Doctor dashboard

- [ ] Urgent cases. (source line 1430)
- [ ] Critical cases. (source line 1431)
- [ ] Assigned cases. (source line 1432)
- [ ] Pending cases. (source line 1433)
- [ ] Clinical history. (source line 1434)
- [ ] Current status. (source line 1435)
- [ ] Vital-sign trends. (source line 1436)
- [ ] Assessment breakdown. (source line 1437)
- [ ] Nurse handover. (source line 1438)
- [ ] Investigation history. (source line 1439)
- [ ] Review patient. (source line 1443)
- [ ] Add assessment. (source line 1444)
- [ ] Record treatment. (source line 1445)
- [ ] Request investigations. (source line 1446)
- [ ] Recommend admission. (source line 1447)
- [ ] Initiate referral. (source line 1448)
- [ ] Discharge after appropriate documentation. (source line 1449)

### 6. Emergency coordination dashboard

- [ ] Active RED cases. (source line 1457)
- [ ] Time since alert. (source line 1458)
- [ ] Patient location. (source line 1459)
- [ ] Emergency reason. (source line 1460)
- [ ] Acknowledgement status. (source line 1461)
- [ ] Assigned team. (source line 1462)
- [ ] Assigned doctor. (source line 1463)
- [ ] Stretcher request. (source line 1464)
- [ ] Emergency bed request. (source line 1465)
- [ ] Current response status. (source line 1466)
- [ ] Acknowledge alert. (source line 1470)
- [ ] Assign response team. (source line 1471)
- [ ] Assign staff. (source line 1472)
- [ ] Request a stretcher. (source line 1473)
- [ ] Request equipment. (source line 1474)
- [ ] Record arrival of the response team. (source line 1475)
- [ ] Mark emergency assistance in progress. (source line 1476)
- [ ] Escalate an unacknowledged alert. (source line 1477)
- [ ] Close the alert with appropriate documentation. (source line 1478)

### 7. Alert system

- [ ] ESCALATED. (source line 1488)
- [ ] CANCELLED. (source line 1489)
- [ ] Trigger. (source line 1493)
- [ ] Encounter. (source line 1494)
- [ ] Recipient. (source line 1495)
- [ ] Sender. (source line 1496)
- [ ] Timestamp. (source line 1497)
- [ ] Delivery status. (source line 1498)
- [ ] Acknowledgement time. (source line 1499)
- [ ] Resolution time. (source line 1500)

### 8. Escalation mechanism

- [ ] Notify configured backup staff. (source line 1508)
- [ ] Notify emergency coordinator. (source line 1509)
- [ ] Record escalation. (source line 1510)
- [ ] Continue to display an active unacknowledged alert. (source line 1511)

### 9. Notification channels

- [ ] In-app notifications. (source line 1519)
- [ ] Real-time notification panel. (source line 1520)
- [ ] Browser push when configured. (source line 1521)
- [ ] Optional SMS adapter. (source line 1522)
- [ ] Optional external notification adapter. (source line 1523)

### 10. Verification

- [ ] Different user roles. (source line 1531)
- [ ] Queue ordering. (source line 1532)
- [ ] Real-time updates. (source line 1533)
- [ ] Alert acknowledgement. (source line 1534)
- [ ] Escalation. (source line 1535)
- [ ] Duplicate notification prevention. (source line 1536)
- [ ] Notification permissions. (source line 1537)
- [ ] Unavailable notification service. (source line 1538)
- [ ] Browser refresh. (source line 1539)
- [ ] Reconnection. (source line 1540)

# PROMPT 6 — SMARTFLOW, RESOURCE ALLOCATION, REFERRAL AND PATIENT OUTFLOW

### 1. Patient journey engine

- [ ] Discharged. (source line 1566)
- [ ] Admitted. (source line 1567)
- [ ] Referred/transferred. (source line 1568)
- [ ] Follow-up scheduled. (source line 1569)

### 2. Patient tracking

- [ ] Encounter information. (source line 1577)
- [ ] Current department. (source line 1578)
- [ ] Assigned staff. (source line 1579)
- [ ] Clinical assessment history. (source line 1580)
- [ ] Queue information. (source line 1581)
- [ ] Current status. (source line 1582)
- [ ] Status history. (source line 1583)
- [ ] Investigation records. (source line 1584)
- [ ] Treatment notes. (source line 1585)
- [ ] Resources assigned. (source line 1586)
- [ ] Referral records. (source line 1587)
- [ ] Admission details. (source line 1588)
- [ ] Discharge summary. (source line 1589)

### 3. Resource management

- [ ] General beds. (source line 1599)
- [ ] Emergency beds. (source line 1600)
- [ ] ICU beds. (source line 1601)
- [ ] Stretchers. (source line 1602)
- [ ] Wheelchairs. (source line 1603)
- [ ] Diagnostic equipment. (source line 1604)
- [ ] Other hospital-defined resources. (source line 1605)
- [ ] Resource ID. (source line 1609)
- [ ] Type. (source line 1610)
- [ ] Department. (source line 1611)
- [ ] Current status. (source line 1612)
- [ ] Location. (source line 1613)
- [ ] Capacity, where appropriate. (source line 1614)
- [ ] Availability. (source line 1615)
- [ ] Maintenance status. (source line 1616)
- [ ] Reservation information. (source line 1617)

### 4. Reservation logic

- [ ] Available. (source line 1627)
- [ ] Reserved. (source line 1628)
- [ ] Occupied. (source line 1629)
- [ ] Cleaning/maintenance. (source line 1630)
- [ ] Unavailable. (source line 1631)
- [ ] Notify the responsible coordinator. (source line 1637)
- [ ] Show the shortage. (source line 1638)
- [ ] Display alternative resources or destinations for staff review. (source line 1639)
- [ ] Preserve clinical priority. (source line 1640)

### 5. Staff coordination

- [ ] Staff directory. (source line 1646)
- [ ] Department assignments. (source line 1647)
- [ ] Shift availability. (source line 1648)
- [ ] Staff status. (source line 1649)
- [ ] Assigned patients. (source line 1650)
- [ ] Current workload. (source line 1651)
- [ ] Staff notifications. (source line 1652)

### 6. Department management

- [ ] Name. (source line 1660)
- [ ] Description. (source line 1661)
- [ ] Location. (source line 1662)
- [ ] Supported services. (source line 1663)
- [ ] Operating status. (source line 1664)
- [ ] Capacity. (source line 1665)
- [ ] Assigned doctors. (source line 1666)
- [ ] Assigned nurses. (source line 1667)
- [ ] Assigned resources. (source line 1668)

### 7. Smart hospital routing

- [ ] Confirmed triage category. (source line 1676)
- [ ] Patient's clinical requirement. (source line 1677)
- [ ] Appropriate available department. (source line 1678)
- [ ] Facility capabilities. (source line 1679)
- [ ] Verified resource availability. (source line 1680)

### 8. Referral management

- [ ] Name. (source line 1692)
- [ ] Location. (source line 1693)
- [ ] Contact information. (source line 1694)
- [ ] Supported specialities. (source line 1695)
- [ ] Available services. (source line 1696)
- [ ] Facility level. (source line 1697)
- [ ] Referral requirements. (source line 1698)
- [ ] Operating status. (source line 1699)
- [ ] Clinician initiates referral. (source line 1703)
- [ ] Reason and summary recorded. (source line 1704)
- [ ] Destination selected. (source line 1705)
- [ ] Receiving facility contacted through an available channel. (source line 1706)
- [ ] Acceptance or acknowledgement recorded. (source line 1707)
- [ ] Ambulance requirement recorded. (source line 1708)
- [ ] Transfer assigned. (source line 1709)
- [ ] Transfer departure recorded. (source line 1710)
- [ ] Receiving-facility arrival recorded. (source line 1711)
- [ ] Referral completed. (source line 1712)

### 9. Discharge and admission

- [ ] Doctor approval. (source line 1720)
- [ ] Final clinical notes. (source line 1721)
- [ ] Discharge instructions. (source line 1722)
- [ ] Follow-up date. (source line 1723)
- [ ] Prescription reference, where entered by clinician. (source line 1724)
- [ ] Discharge timestamp. (source line 1725)
- [ ] Admission reason. (source line 1729)
- [ ] Assigned ward. (source line 1730)
- [ ] Bed reservation. (source line 1731)
- [ ] Responsible doctor. (source line 1732)
- [ ] Admission confirmation. (source line 1733)

### 10. SmartFlow dashboard

- [ ] Total patients. (source line 1739)
- [ ] Registered today. (source line 1740)
- [ ] Currently waiting. (source line 1741)
- [ ] Under assessment. (source line 1742)
- [ ] In treatment. (source line 1743)
- [ ] Awaiting diagnostics. (source line 1744)
- [ ] Awaiting beds. (source line 1745)
- [ ] Awaiting transfer. (source line 1746)
- [ ] Admitted. (source line 1747)
- [ ] Discharged. (source line 1748)
- [ ] Referred. (source line 1749)

### 11. Analytics

- [ ] Average registration-to-triage time. (source line 1757)
- [ ] Average triage-to-assessment time. (source line 1758)
- [ ] Total waiting time. (source line 1759)
- [ ] Average treatment duration where timestamps are available. (source line 1760)
- [ ] Department workload. (source line 1761)
- [ ] Resource utilisation. (source line 1762)
- [ ] Admission and discharge counts. (source line 1763)
- [ ] Referral turnaround. (source line 1764)

### 12. Tests

- [ ] Status transitions. (source line 1772)
- [ ] Resource concurrency. (source line 1773)
- [ ] Bed reservation. (source line 1774)
- [ ] Staff assignments. (source line 1775)
- [ ] Referral lifecycle. (source line 1776)
- [ ] Admission workflow. (source line 1777)
- [ ] Discharge workflow. (source line 1778)
- [ ] Patient history integrity. (source line 1779)
- [ ] Role restrictions. (source line 1780)

# PROMPT 7 — OFFLINE-FIRST PWA, RURAL MODE AND MULTILINGUAL ACCESSIBILITY

### 1. PWA

- [ ] Web manifest. (source line 1794)
- [ ] Application icons. (source line 1795)
- [ ] Installation prompt. (source line 1796)
- [ ] Service worker. (source line 1797)
- [ ] Offline landing page. (source line 1798)
- [ ] Network status detection. (source line 1799)
- [ ] Update management. (source line 1800)
- [ ] Responsive mobile interface. (source line 1801)

### 2. Offline registration

- [ ] Patient details. (source line 1809)
- [ ] Encounter creation. (source line 1810)
- [ ] Basic symptom information. (source line 1811)
- [ ] Locally generated provisional encounter identifiers. (source line 1812)
- [ ] Offline form submission. (source line 1813)
- [ ] Outbox management. (source line 1814)
- [ ] Synchronisation status. (source line 1815)
- [ ] Verify the authenticated staff session. (source line 1821)
- [ ] Send queued records securely. (source line 1822)
- [ ] Check whether the server already processed each operation. (source line 1823)
- [ ] Sync in a deterministic order. (source line 1824)
- [ ] Record success or failure. (source line 1825)
- [ ] Retry recoverable failures. (source line 1826)
- [ ] Show conflicts for staff review. (source line 1827)
- [ ] Remove locally retained drafts according to the configured data-retention policy after successful acknowledgement. (source line 1828)

### 3. Offline QR limitations and handling

- [ ] Generate a provisional encounter ID. (source line 1836)
- [ ] Generate a local reference QR if appropriate. (source line 1837)
- [ ] Clearly distinguish provisional and server-issued tokens. (source line 1838)
- [ ] Synchronise securely when online. (source line 1839)

### 4. Service-worker security

- [ ] Patient medical records. (source line 1849)
- [ ] Authenticated API responses. (source line 1850)
- [ ] Clinical assessments. (source line 1851)
- [ ] Sensitive staff dashboards. (source line 1852)
- [ ] Raw QR access tokens. (source line 1853)

### 5. Rural mode

- [ ] Large buttons. (source line 1863)
- [ ] Low-bandwidth layouts. (source line 1864)
- [ ] Simple registration. (source line 1865)
- [ ] Assisted registration. (source line 1866)
- [ ] Printable forms/tokens. (source line 1867)
- [ ] Regional languages. (source line 1868)
- [ ] Manual workflow fallback. (source line 1869)
- [ ] Connection warning. (source line 1870)
- [ ] Offline data status. (source line 1871)

### 6. Voice support

- [ ] Permission handling. (source line 1879)
- [ ] Unsupported-browser fallback. (source line 1880)
- [ ] Manual text entry. (source line 1881)
- [ ] Editing before submission. (source line 1882)
- [ ] Language-specific input where supported. (source line 1883)

### 7. Language support

- [ ] English. (source line 1891)
- [ ] Kannada. (source line 1892)
- [ ] Hindi. (source line 1893)

### 8. Accessibility

- [ ] Keyboard navigation. (source line 1905)
- [ ] Focus indicators. (source line 1906)
- [ ] Colour contrast. (source line 1907)
- [ ] Form labels. (source line 1908)
- [ ] Screen-reader support. (source line 1909)
- [ ] Large text option. (source line 1910)
- [ ] Responsive layouts. (source line 1911)
- [ ] Accessible emergency alert controls. (source line 1912)

### 9. Testing

- [ ] Installation. (source line 1918)
- [ ] Offline page. (source line 1919)
- [ ] Offline registration. (source line 1920)
- [ ] Queue persistence. (source line 1921)
- [ ] Reconnection. (source line 1922)
- [ ] Duplicate sync. (source line 1923)
- [ ] Failed sync. (source line 1924)
- [ ] Conflict handling. (source line 1925)
- [ ] Browser refresh while offline. (source line 1926)
- [ ] Shared-device cleanup. (source line 1927)
- [ ] Language switching. (source line 1928)
- [ ] Mobile accessibility. (source line 1929)

# PROMPT 8 — ADMIN DASHBOARD, HOSPITAL SETTINGS, ANALYTICS AND FORECASTING

### 1. Administrator overview

- [ ] Total patients registered today. (source line 1945)
- [ ] Active encounters. (source line 1946)
- [ ] GREEN cases. (source line 1947)
- [ ] YELLOW cases. (source line 1948)
- [ ] RED cases. (source line 1949)
- [ ] Patients awaiting triage. (source line 1950)
- [ ] Patients awaiting doctors. (source line 1951)
- [ ] Patients under treatment. (source line 1952)
- [ ] Patients awaiting admission. (source line 1953)
- [ ] Available beds. (source line 1954)
- [ ] Occupied beds. (source line 1955)
- [ ] Available staff. (source line 1956)
- [ ] Unacknowledged alerts. (source line 1957)
- [ ] Active referrals. (source line 1958)

### 2. Department analytics

- [ ] Number of registered patients. (source line 1964)
- [ ] Waiting patients. (source line 1965)
- [ ] Cases under assessment. (source line 1966)
- [ ] Cases in treatment. (source line 1967)
- [ ] Workload. (source line 1968)
- [ ] Available staff. (source line 1969)
- [ ] Available resources. (source line 1970)
- [ ] Current capacity. (source line 1971)

### 3. Hospital configuration

- [ ] Hospital details. (source line 1977)
- [ ] Departments. (source line 1978)
- [ ] Operating hours. (source line 1979)
- [ ] Staff. (source line 1980)
- [ ] Staff roles. (source line 1981)
- [ ] Duty schedules. (source line 1982)
- [ ] Resources. (source line 1983)
- [ ] Bed categories. (source line 1984)
- [ ] Referral facilities. (source line 1985)
- [ ] Notification recipients. (source line 1986)
- [ ] Escalation policies. (source line 1987)
- [ ] Waiting-time warning configuration. (source line 1988)
- [ ] Languages. (source line 1989)

### 4. Clinical protocol administration

- [ ] Draft rule sets. (source line 1997)
- [ ] Version history. (source line 1998)
- [ ] Clinical reference. (source line 1999)
- [ ] Reviewer assignment. (source line 2000)
- [ ] Approval status. (source line 2001)
- [ ] Effective dates. (source line 2002)
- [ ] Protocol activation. (source line 2003)
- [ ] Protocol retirement. (source line 2004)

### 5. Operational forecasting

- [ ] Patient inflow by hour. (source line 2016)
- [ ] Inflow by day. (source line 2017)
- [ ] Department demand. (source line 2018)
- [ ] Bed occupancy patterns. (source line 2019)
- [ ] Referral patterns. (source line 2020)
- [ ] Anticipated peak hours. (source line 2021)

### 6. Hospital reports

- [ ] Daily reports. (source line 2031)
- [ ] Weekly reports. (source line 2032)
- [ ] Monthly reports. (source line 2033)
- [ ] Department reports. (source line 2034)
- [ ] Patient-flow reports. (source line 2035)
- [ ] Resource reports. (source line 2036)
- [ ] Referral reports. (source line 2037)
- [ ] Operational workload reports. (source line 2038)

### 7. Audit dashboard

- [ ] User login activity where available. (source line 2050)
- [ ] Clinical assessment changes. (source line 2051)
- [ ] Priority overrides. (source line 2052)
- [ ] Patient status transitions. (source line 2053)
- [ ] Resource allocation. (source line 2054)
- [ ] Referral updates. (source line 2055)
- [ ] User role changes. (source line 2056)
- [ ] System configuration changes. (source line 2057)

### 8. Dashboard design

### 9. Verification

- [ ] Admin permissions. (source line 2077)
- [ ] Analytics calculations. (source line 2078)
- [ ] Export permissions. (source line 2079)
- [ ] Date filters. (source line 2080)
- [ ] Department filters. (source line 2081)
- [ ] Audit record creation. (source line 2082)
- [ ] Protocol approval restrictions. (source line 2083)
- [ ] Forecast calculation. (source line 2084)
- [ ] Data isolation. (source line 2085)

# PROMPT 9 — COMPLETE INTEGRATION, QA, SECURITY AND DEMONSTRATION

### 1. Integration audit

### 2. End-to-end scenario 1 — Routine patient

- [ ] Reception registers a patient. (source line 2120)
- [ ] QR is generated. (source line 2121)
- [ ] Patient scans QR. (source line 2122)
- [ ] Patient enters routine symptoms. (source line 2123)
- [ ] Nurse reviews the information. (source line 2124)
- [ ] Clinician confirms the appropriate category. (source line 2125)
- [ ] Patient enters the general-care queue. (source line 2126)
- [ ] Nurse is notified. (source line 2127)
- [ ] Doctor or authorised staff completes assessment. (source line 2128)
- [ ] Patient receives documented disposition. (source line 2129)
- [ ] Patient is discharged where appropriate. (source line 2130)

### 3. End-to-end scenario 2 — Urgent patient

- [ ] Patient is registered. (source line 2136)
- [ ] Relevant warning signs or findings are recorded. (source line 2137)
- [ ] The system identifies the need for urgent human assessment. (source line 2138)
- [ ] Nurse and duty doctor are notified. (source line 2139)
- [ ] Staff acknowledge the alert. (source line 2140)
- [ ] Patient is moved to the urgent assessment area. (source line 2141)
- [ ] Doctor reviews the patient. (source line 2142)
- [ ] Treatment or investigation is recorded. (source line 2143)
- [ ] Disposition is recorded. (source line 2144)

### 4. End-to-end scenario 3 — Emergency patient

- [ ] Patient arrives with a configured emergency warning sign. (source line 2150)
- [ ] Patient is not forced to complete registration first. (source line 2151)
- [ ] Staff creates an emergency encounter. (source line 2152)
- [ ] Emergency override is activated. (source line 2153)
- [ ] RED alert is created. (source line 2154)
- [ ] Emergency coordinator receives the alert. (source line 2155)
- [ ] Duty doctor receives the alert. (source line 2156)
- [ ] Stretcher request is recorded. (source line 2157)
- [ ] Emergency response is acknowledged. (source line 2158)
- [ ] Patient is treated. (source line 2159)
- [ ] Resource and treatment records are updated. (source line 2160)
- [ ] Doctor records admission, transfer or another disposition. (source line 2161)

### 5. End-to-end scenario 4 — Deterioration

- [ ] Patient initially receives a lower urgency category. (source line 2167)
- [ ] Patient is waiting. (source line 2168)
- [ ] A nurse enters new concerning observations. (source line 2169)
- [ ] The application triggers reassessment/escalation. (source line 2170)
- [ ] Category is reviewed by qualified staff. (source line 2171)
- [ ] Queue changes appropriately. (source line 2172)
- [ ] Relevant teams are notified. (source line 2173)
- [ ] All transitions are recorded. (source line 2174)

### 6. End-to-end scenario 5 — Offline rural registration

- [ ] Hospital tablet is connected. (source line 2180)
- [ ] Staff opens the application. (source line 2181)
- [ ] Internet disconnects. (source line 2182)
- [ ] Staff creates an offline registration. (source line 2183)
- [ ] Application retains the draft locally. (source line 2184)
- [ ] Internet returns. (source line 2185)
- [ ] Application synchronises. (source line 2186)
- [ ] Duplicate creation is prevented. (source line 2187)
- [ ] Server record is verified. (source line 2188)
- [ ] Local data is handled according to the retention policy. (source line 2189)

### 7. End-to-end scenario 6 — Elderly and assisted registration

- [ ] No smartphone. (source line 2195)
- [ ] Assisted patient registration. (source line 2196)
- [ ] Limited ability to provide information. (source line 2197)
- [ ] Missing data. (source line 2198)
- [ ] Staff verification. (source line 2199)
- [ ] Clinical assessment. (source line 2200)

### 8. End-to-end scenario 7 — No available emergency bed

- [ ] RED case. (source line 2206)
- [ ] No suitable local bed. (source line 2207)
- [ ] Emergency coordinator informed. (source line 2208)
- [ ] Resource shortage recorded. (source line 2209)
- [ ] Alternative transfer pathway reviewed by authorised staff. (source line 2210)
- [ ] Referral status tracked. (source line 2211)

### 9. Automated test suite

- [ ] Vitest or an appropriate unit test framework. (source line 2219)
- [ ] Playwright end-to-end testing. (source line 2220)
- [ ] React/component testing where appropriate. (source line 2221)
- [ ] Database integration tests. (source line 2222)
- [ ] Supabase RLS verification. (source line 2223)
- [ ] API permission testing. (source line 2224)

### 10. Security audit

- [ ] No service-role key in frontend bundles. (source line 2230)
- [ ] No secrets in Git history. (source line 2231)
- [ ] All exposed database tables have RLS. (source line 2232)
- [ ] Role checks are server-side. (source line 2233)
- [ ] No self-assigned staff privileges. (source line 2234)
- [ ] QR tokens are protected. (source line 2235)
- [ ] Public routes are rate-limited. (source line 2236)
- [ ] User input is validated. (source line 2237)
- [ ] Patients cannot access other encounters. (source line 2238)
- [ ] Hospital data cannot leak between tenants. (source line 2239)
- [ ] Audit records are generated. (source line 2240)
- [ ] Document access is protected. (source line 2241)
- [ ] Error messages do not reveal sensitive data. (source line 2242)

### 11. Performance and accessibility

- [ ] Page loading. (source line 2250)
- [ ] Dashboard query performance. (source line 2251)
- [ ] Pagination. (source line 2252)
- [ ] Responsive layouts. (source line 2253)
- [ ] Accessibility. (source line 2254)
- [ ] Large patient queues. (source line 2255)
- [ ] Realtime reconnection. (source line 2256)
- [ ] Loading/error states. (source line 2257)
- [ ] Mobile responsiveness. (source line 2258)

### 12. Demo data and presentation

- [ ] Demo hospital. (source line 2266)
- [ ] Departments. (source line 2267)
- [ ] Staff roles. (source line 2268)
- [ ] Sample patients. (source line 2269)
- [ ] Sample resources. (source line 2270)
- [ ] Sample queue entries. (source line 2271)
- [ ] Sample alerts. (source line 2272)
- [ ] Sample referrals. (source line 2273)

### 13. Final documentation

- [ ] `docs/TEST_PLAN.md` (source line 2281)
- [ ] `docs/TEST_RESULTS.md` (source line 2282)
- [ ] `docs/SECURITY_AUDIT.md` (source line 2283)
- [ ] `docs/DEMO_GUIDE.md` (source line 2284)
- [ ] `docs/FEATURE_STATUS.md` (source line 2285)
- [ ] `docs/DEPLOYMENT_STATUS.md` (source line 2286)
- [ ] Fully implemented. (source line 2290)
- [ ] Tested. (source line 2291)
- [ ] Partially configured. (source line 2292)
- [ ] Awaiting external credentials. (source line 2293)
- [ ] Not ready for operational clinical use. (source line 2294)

# PROMPT 10 — GITHUB REPOSITORY, SUPABASE REMOTE DATABASE AND VERCEL DEPLOYMENT

## A. GitHub

- [ ] Check the authenticated GitHub account. (source line 2314)
- [ ] Create a private repository named `medcipher-triage-platform`. (source line 2315)
- [ ] Initialise Git if needed. (source line 2316)
- [ ] Use `main` as the production branch. (source line 2317)
- [ ] Add a suitable `.gitignore`. (source line 2318)
- [ ] Ensure `.env.local`, `.env`, credentials, `.vercel`, secrets and private patient data are never committed. (source line 2319)
- [ ] Add an informative README. (source line 2320)
- [ ] Add the source code. (source line 2321)
- [ ] Commit in logical milestones. (source line 2322)
- [ ] Push the project to GitHub. (source line 2323)
- [ ] `README.md` (source line 2329)
- [ ] `.gitignore` (source line 2330)
- [ ] `.github/workflows/ci.yml` (source line 2331)
- [ ] `SECURITY.md` (source line 2332)
- [ ] `CONTRIBUTING.md`, if useful. (source line 2333)

## B. GitHub CI

- [ ] Dependency installation. (source line 2341)
- [ ] Formatting verification. (source line 2342)
- [ ] Lint. (source line 2343)
- [ ] TypeScript checking. (source line 2344)
- [ ] Unit tests. (source line 2345)
- [ ] Integration tests where credentials are safely available. (source line 2346)
- [ ] Production build. (source line 2347)
- [ ] Dependency security checks. (source line 2348)

## C. Supabase remote project

- [ ] Use available authenticated Supabase tools or the official CLI. (source line 2362)
- [ ] Confirm the target organisation. (source line 2363)
- [ ] Create the requested project only after the required project selection. (source line 2364)
- [ ] Choose a supported region appropriate for the target users. (source line 2365)
- [ ] Never reset an existing production database. (source line 2366)
- [ ] Project URL. (source line 2370)
- [ ] Publishable key. (source line 2371)
- [ ] Database connection. (source line 2372)
- [ ] Authentication settings. (source line 2373)
- [ ] Email confirmation/redirect settings. (source line 2374)
- [ ] Database migrations. (source line 2375)
- [ ] RLS policies. (source line 2376)
- [ ] Realtime configuration. (source line 2377)
- [ ] Storage policies. (source line 2378)

## D. Environment variables

## E. Vercel project

- [ ] Next.js framework. (source line 2422)
- [ ] Correct project root. (source line 2423)
- [ ] Build command. (source line 2424)
- [ ] Environment variables. (source line 2425)
- [ ] Preview environment. (source line 2426)
- [ ] Production environment. (source line 2427)
- [ ] Main production branch. (source line 2428)

## F. Preview deployment

- [ ] Build the production application locally or with the appropriate Vercel build workflow. (source line 2438)
- [ ] Resolve build errors. (source line 2439)
- [ ] Deploy a preview. (source line 2440)
- [ ] Open the preview URL. (source line 2441)
- [ ] Verify authentication. (source line 2442)
- [ ] Verify the patient QR flow. (source line 2443)
- [ ] Verify the staff dashboards. (source line 2444)
- [ ] Verify the database connection. (source line 2445)
- [ ] Verify realtime notifications. (source line 2446)
- [ ] Verify all essential E2E workflows. (source line 2447)

## G. Production deployment

- [ ] Confirm the target Vercel project. (source line 2453)
- [ ] Confirm the intended GitHub commit. (source line 2454)
- [ ] Confirm production environment variables. (source line 2455)
- [ ] Confirm database migrations are applied and compatible. (source line 2456)
- [ ] Deploy the production branch. (source line 2457)
- [ ] Verify the deployment status. (source line 2458)
- [ ] Verify the live website. (source line 2459)
- [ ] Check application logs. (source line 2460)
- [ ] Check critical API routes. (source line 2461)
- [ ] Check authentication. (source line 2462)
- [ ] Check the Supabase connection. (source line 2463)

## H. Deployment verification

- [ ] GitHub repository URL. (source line 2473)
- [ ] Git branch. (source line 2474)
- [ ] Latest commit. (source line 2475)
- [ ] Supabase project reference. (source line 2476)
- [ ] Database migration status. (source line 2477)
- [ ] Vercel project name. (source line 2478)
- [ ] Preview deployment URL. (source line 2479)
- [ ] Production URL. (source line 2480)
- [ ] Deployment status. (source line 2481)
- [ ] Build status. (source line 2482)
- [ ] CI status. (source line 2483)
- [ ] Remaining environment setup. (source line 2484)

# PROMPT 11 — FINAL MASTER ACCEPTANCE TEST AND PROJECT COMPLETION

## 1. Functional acceptance

- [ ] QR registration. (source line 2506)
- [ ] Patient intake. (source line 2507)
- [ ] Symptom collection. (source line 2508)
- [ ] Multilingual UI. (source line 2509)
- [ ] Assisted registration. (source line 2510)
- [ ] Encounter tracking. (source line 2511)
- [ ] Secure patient status. (source line 2512)
- [ ] Emergency overrides. (source line 2516)
- [ ] GREEN/YELLOW/RED. (source line 2517)
- [ ] Assessment-required state. (source line 2518)
- [ ] Score out of 100. (source line 2519)
- [ ] Decimal scores. (source line 2520)
- [ ] Scoring explanation. (source line 2521)
- [ ] Clinical verification. (source line 2522)
- [ ] Manual override. (source line 2523)
- [ ] Reassessment. (source line 2524)
- [ ] Versioned protocols. (source line 2525)
- [ ] Dynamic ordering. (source line 2529)
- [ ] Emergency priority. (source line 2530)
- [ ] Waiting-time tracking. (source line 2531)
- [ ] Deterioration escalation. (source line 2532)
- [ ] Department queues. (source line 2533)
- [ ] Live updates. (source line 2534)
- [ ] Nurse alerts. (source line 2538)
- [ ] Doctor alerts. (source line 2539)
- [ ] Emergency alerts. (source line 2540)
- [ ] Role-based routing. (source line 2541)
- [ ] Acknowledgement. (source line 2542)
- [ ] Escalation. (source line 2543)
- [ ] Alert history. (source line 2544)
- [ ] Staff management. (source line 2548)
- [ ] Department management. (source line 2549)
- [ ] Bed management. (source line 2550)
- [ ] Stretcher management. (source line 2551)
- [ ] Resource allocation. (source line 2552)
- [ ] Patient movement. (source line 2553)
- [ ] Admissions. (source line 2554)
- [ ] Discharges. (source line 2555)
- [ ] Referrals. (source line 2556)
- [ ] Transfers. (source line 2557)
- [ ] PWA installation. (source line 2561)
- [ ] Offline drafts. (source line 2562)
- [ ] Local storage. (source line 2563)
- [ ] Sync queue. (source line 2564)
- [ ] Duplicate prevention. (source line 2565)
- [ ] Recovery after reconnection. (source line 2566)
- [ ] Low-bandwidth interface. (source line 2567)
- [ ] Language support. (source line 2568)
- [ ] Hospital dashboard. (source line 2572)
- [ ] Workload analytics. (source line 2573)
- [ ] Bed occupancy. (source line 2574)
- [ ] Patient-flow reporting. (source line 2575)
- [ ] Forecasting. (source line 2576)
- [ ] Staff management. (source line 2577)
- [ ] Audit logs. (source line 2578)
- [ ] Protocol administration. (source line 2579)
- [ ] Supabase schema. (source line 2583)
- [ ] Supabase RLS. (source line 2584)
- [ ] Supabase Auth. (source line 2585)
- [ ] Supabase Realtime. (source line 2586)
- [ ] GitHub repository. (source line 2587)
- [ ] CI pipeline. (source line 2588)
- [ ] Vercel preview deployment. (source line 2589)
- [ ] Production deployment. (source line 2590)

## 2. Technical acceptance

- [ ] Formatter. (source line 2596)
- [ ] Linter. (source line 2597)
- [ ] TypeScript compiler. (source line 2598)
- [ ] Unit tests. (source line 2599)
- [ ] Integration tests. (source line 2600)
- [ ] E2E tests. (source line 2601)
- [ ] Production build. (source line 2602)
- [ ] Database security checks. (source line 2603)
- [ ] RLS tests. (source line 2604)
- [ ] Dependency audit. (source line 2605)

## 3. Clinical-safety acceptance

- [ ] Emergency actions never depend on a score. (source line 2613)
- [ ] No automatic diagnosis is presented. (source line 2614)
- [ ] No missing data is treated as normal. (source line 2615)
- [ ] Clinical category overrides are auditable. (source line 2616)
- [ ] Assessment-required cases remain visible to staff. (source line 2617)
- [ ] The patient is never denied entry because of technology. (source line 2618)
- [ ] No resource shortage downgrades priority. (source line 2619)
- [ ] Unvalidated scoring is visibly labelled. (source line 2620)
- [ ] Clinical deployment remains disabled until proper review. (source line 2621)

## 4. User experience acceptance

- [ ] Desktop. (source line 2627)
- [ ] Tablet. (source line 2628)
- [ ] Android-sized mobile screen. (source line 2629)
- [ ] Low-resolution screen. (source line 2630)
- [ ] Keyboard-only navigation. (source line 2631)
- [ ] Screen-reader-oriented form controls. (source line 2632)

## 5. Final deliverables

- [ ] Final GitHub repository. (source line 2640)
- [ ] Working Vercel deployment. (source line 2641)
- [ ] Confirmed Supabase database. (source line 2642)
- [ ] Database migration files. (source line 2643)
- [ ] Complete README. (source line 2644)
- [ ] Architecture document. (source line 2645)
- [ ] Database schema document. (source line 2646)
- [ ] API documentation. (source line 2647)
- [ ] Role permission matrix. (source line 2648)
- [ ] Clinical algorithm documentation. (source line 2649)
- [ ] Test plan and results. (source line 2650)
- [ ] Security audit. (source line 2651)
- [ ] Deployment instructions. (source line 2652)
- [ ] Demo credentials for synthetic data, only in the documented non-production demo environment. (source line 2653)
- [ ] A five-patient demonstration script. (source line 2654)
- [ ] A list of limitations and future development. (source line 2655)

## 6. Final report

- [ ] Feature. (source line 2661)
- [ ] Implementation status. (source line 2662)
- [ ] Test status. (source line 2663)
- [ ] Database integration status. (source line 2664)
- [ ] Deployment status. (source line 2665)
- [ ] Remaining limitation. (source line 2666)
