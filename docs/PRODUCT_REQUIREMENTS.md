# MEDIROUTE

— MASTER CODEX DEVELOPMENT PROMPTS

**Project:** MediRoute — Intelligent Clinical Triage & Hospital Flow Management System

**Instruction to the developer:** Execute these prompts sequentially in one Codex project workspace. Each prompt is a development milestone, not a request to merely describe or propose code. Build the feature, integrate it, test it, document it, and verify it before finishing the milestone.

---

# PROMPT 0 — THE SUPER MASTER PROMPT

## Project identity, complete requirements and permanent development instructions

You are acting as a complete senior software engineering team consisting of:

- Senior full-stack architect.
- Senior Next.js and TypeScript developer.
- Supabase database architect.
- UI/UX designer.
- Healthcare workflow systems engineer.
- Application security engineer.
- QA and automation engineer.
- DevOps and deployment engineer.

Your task is to build a complete, professional, working web application called **MediRoute**.

Do not create a static landing page, a collection of disconnected UI screens, or a frontend-only mockup.

You must develop an integrated, functional full-stack healthcare workflow management platform.

## A. Product vision

MediRoute is an intelligent patient triage, emergency coordination and hospital patient-flow management platform designed for:

1. Government hospitals.
2. Rural primary healthcare centres.
3. Community health centres.
4. District hospitals.
5. Large hospitals.
6. Multi-department healthcare facilities.

The purpose is to assist healthcare professionals in identifying patients requiring urgent attention, organising patient queues, communicating with medical personnel, coordinating available hospital resources and managing patient inflow and outflow.

The system must support both patient-operated and staff-assisted registration.

## B. Complete list of functional modules

Implement every module below.

### Module 1 — Patient registration and QR management

- Generate a unique patient encounter ID.
- Generate a secure QR code for every new encounter.
- Allow patients to scan the QR code using their smartphones.
- Open a mobile-friendly patient registration page.
- Collect patient information, symptoms, medical history and relevant information.
- Support assisted registration by receptionists and nurses.
- Support QR printing and manual token entry.
- Allow registration without a smartphone.
- Allow multiple hospital visits for the same patient.
- Distinguish a permanent patient record from an individual encounter.
- Maintain timestamps for arrival and registration.
- Support registration of unidentified emergency patients.

### Module 2 — Patient information and symptom collection

Collect:

- Name.
- Age/date of birth.
- Sex where clinically relevant.
- Contact information where available.
- Primary symptoms.
- Secondary symptoms.
- Symptom duration.
- Symptom progression.
- Pain severity.
- Injuries.
- Bleeding.
- Breathing difficulties.
- Consciousness status.
- Existing medical conditions.
- Allergies.
- Current medications.
- Pregnancy information where relevant and appropriately collected.
- Previous relevant medical history.
- Patient-reported emergency warning signs.
- Vital signs when available.

Support structured symptom selection, text entry and optional voice input.

Include English, Kannada and Hindi as initial languages. Design the translation system so that further languages can be added.

### Module 3 — Intelligent clinical triage engine

Implement a transparent, rule-based clinical decision-support engine.

Three principal classifications:

- GREEN — Non-immediate care.
- YELLOW — Immediate/urgent assessment.
- RED — Critical/emergency.

Also implement an internal assessment-required state for missing, incomplete, unreliable or unverified information. Never silently classify missing information as normal.

The system must support:

- Emergency warning-sign screening.
- Emergency overrides.
- Vital-sign assessment.
- Symptom-severity evaluation.
- Relevant medical risk factors.
- Patient deterioration.
- Human clinical verification.
- Clinician override.
- Clinical reassessment.
- Clinical assessment history.
- Versioned triage protocols.
- Explainable decision results.

The emergency override must take precedence over any numerical score.

Do not use AI-generated diagnoses or an unvalidated scoring algorithm to make clinical decisions.

Implement the numerical 0–100 prioritisation score as a separate, explainable and configurable secondary feature. Decimal values must be supported.

The score must never overrule a more urgent clinical category.

All demo scoring weights and thresholds must be clearly labelled unvalidated demonstration configuration. A clinically approved protocol must be required before enabling clinical operational use.

### Module 4 — Dynamic patient ranking

Create a real-time prioritisation engine.

The patient queue must consider:

- Clinical urgency category.
- Emergency override.
- Clinician-assigned sub-priority.
- Patient deterioration.
- Reassessment status.
- Waiting time.
- Assessment status.
- Assigned department.

Priority ordering must always preserve the established clinical urgency hierarchy.

A GREEN patient's numerical score must never cause the patient to be moved above a RED patient.

Waiting-time escalation should generate reassessment warnings or clinician review tasks rather than silently changing a clinical category.

Update the patient queue when a patient is registered, reassessed, escalated, assigned, admitted, referred or discharged.

### Module 5 — Emergency notifications

Implement notifications for:

GREEN:

- Assigned nurse.
- General-care queue.

YELLOW:

- Triage nurse.
- Duty doctor.
- Urgent assessment area.

RED:

- Emergency team.
- Emergency coordinator.
- Duty doctor.
- Senior emergency clinician according to the hospital's configured escalation policy.

Conditional notifications:

- Cardiac team.
- Stroke team.
- Trauma team.
- Surgical team when clinically requested.
- ICU/critical-care team.
- Bed coordinator.
- Referral coordinator.

Support:

- Instant in-app alerts.
- Real-time notification delivery.
- Alert acknowledgement.
- Staff assignment.
- Alert resolution.
- Escalation of unacknowledged alerts.
- Notification history.
- Read/unread status.
- Timestamps.
- Acknowledgement records.
- Backup escalation contacts.

Web push notifications should be supported when browser permission and VAPID configuration are available.

Implement notification-provider adapters for optional SMS or other external channels. Do not display an SMS as successfully sent when credentials or a real provider are unavailable.

Do not automatically activate an operation theatre or summon every specialist for every emergency. Resource preparation must follow the clinician's assessment and the hospital's escalation policy.

### Module 6 — Nurse dashboard

Create a complete nurse interface.

Include:

- Newly registered patients.
- Patients awaiting triage.
- GREEN queue.
- YELLOW queue.
- RED emergency cases.
- Patients requiring reassessment.
- Patient medical summary.
- Vital-sign entry.
- Clinical verification.
- Priority update.
- Department assignment.
- Alert acknowledgement.
- Status change.
- Reassessment timer.
- Escalation functionality.
- Patient handover.

### Module 7 — Doctor dashboard

Include:

- Assigned patients.
- Emergency cases.
- Urgent cases.
- Pending examinations.
- Patient clinical history.
- Current symptoms.
- Vital-sign history.
- Clinical triage results.
- Priority explanation.
- Previous assessment records.
- Reassessment status.
- Treatment notes.
- Investigation requests.
- Admission decisions.
- Referral decisions.
- Discharge workflow.

### Module 8 — SmartFlow patient-flow management

Build a separate module called **SmartFlow**.

This module must track the complete patient journey:

REGISTERED → TRIAGE PENDING → TRIAGE COMPLETED → WAITING → STAFF ASSIGNED → ASSESSMENT → DIAGNOSTICS → TREATMENT → DISPOSITION.

Supported terminal or onward states:

- Discharged.
- Admitted.
- Referred.
- Transferred.
- Cancelled/no-show, with authorised handling.

Track every status transition with timestamps and responsible users.

Provide:

- Patient inflow monitoring.
- Queue monitoring.
- Department-level patient tracking.
- Doctor workload.
- Nurse workload.
- Waiting-time tracking.
- Diagnostic waiting.
- Bed waiting.
- Referral waiting.
- Discharge tracking.
- Patient outflow analytics.

Never allow an arbitrary user to change a patient directly from one state to any other state without validating the transition and recording an event.

### Module 9 — Resource management

Manage:

- Hospital beds.
- Emergency beds.
- ICU beds.
- Stretchers.
- Wheelchairs.
- Emergency equipment.
- Departments.
- Doctors.
- Nurses.
- Available staff shifts.
- Staff assignments.
- Department capacity.

Display live availability.

Allow authorised personnel to reserve and release resources.

Prevent two staff members from simultaneously allocating the same resource to different patients.

Provide an escalation or alternative-pathway recommendation when the appropriate resource is unavailable.

Never downgrade the patient's clinical priority because a resource is unavailable.

### Module 10 — Referral and inter-hospital coordination

Implement a referral module.

Features:

- Referral destination directory.
- Facility contact information.
- Available services and capabilities.
- Referral reason.
- Referring doctor.
- Referral clinical summary.
- Required transport.
- Ambulance coordination status.
- Receiving-hospital acknowledgement.
- Transfer status.
- Referral completion.

Do not claim real-time availability from an external hospital unless it is actually integrated and verified.

### Module 11 — Rural and offline functionality

Make the website an installable PWA.

Implement:

- Web app manifest.
- Service worker.
- Offline application shell.
- Offline registration drafts.
- Offline encounter creation for authorised staff.
- IndexedDB persistence.
- Outbox-based synchronisation.
- Retry mechanisms.
- Idempotent operations.
- Synchronisation status.
- Conflict detection.
- Manual synchronisation.
- Recovery after internet disconnection.

Important architecture boundary:

A Vercel-hosted cloud application cannot provide live communication between different devices when there is absolutely no internet connection. Offline functionality must accurately distinguish between local-device capture, local-network operation if an on-premises gateway is installed, and cloud synchronisation after connectivity returns.

For the hackathon, implement reliable device-level offline registration and synchronisation. Architect the application so that a future local hospital server can support disconnected multi-device operation.

Do not cache confidential patient API responses in the public service-worker cache.

### Module 12 — Administrator dashboard

Provide:

- Total registrations.
- Current queue.
- Critical cases.
- Urgent cases.
- Non-immediate cases.
- Patients waiting for reassessment.
- Department workload.
- Available staff.
- Bed occupancy.
- Available emergency resources.
- Admissions.
- Discharges.
- Referrals.
- Transfers.
- Waiting-time summaries.
- Patient-flow analytics.

### Module 13 — Operational forecasting

Add a non-clinical operational forecasting feature.

Use historical aggregate data to estimate:

- Expected patient arrival patterns.
- Peak hours.
- Department workload.
- Bed demand.
- Resource requirements.
- Potential staffing pressure.

Use explainable statistical forecasting initially.

Do not present operational forecasts as clinical diagnoses or predictions of individual emergencies.

### Module 14 — Security and privacy

Implement:

- Supabase authentication.
- Role-based access control.
- Hospital-level data isolation.
- Row Level Security on all exposed tables.
- Server-side authorisation.
- Secure QR tokens.
- Token expiry and revocation.
- Rate limiting.
- Audit logs.
- Secure validation.
- Protected documents.
- Secure environment variables.
- No exposure of service-role credentials.
- Restricted patient information access.
- Appropriate privacy notices and consent handling.

Never use user-editable profile metadata as an authority for staff roles.

### Module 15 — Testing and reliability

Provide:

- Unit tests.
- Integration tests.
- End-to-end tests.
- Database tests.
- RLS tests.
- Authentication tests.
- Triage scenario tests.
- Queue-ordering tests.
- Notification tests.
- Offline synchronisation tests.
- Resource allocation concurrency tests.
- Accessibility tests.
- Responsive layout tests.

All demo data must be synthetic.

---

## C. Permanent technical requirements

Use:

- Next.js App Router.
- TypeScript with strict mode.
- React.
- Tailwind CSS.
- shadcn/ui or accessible equivalent components.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Realtime where appropriate.
- Supabase Storage only for required protected files.
- `@supabase/ssr` for cookie-based Next.js sessions.
- IndexedDB for offline drafts/outbox.
- Vercel for hosting.
- GitHub for version control.

Use currently supported stable releases. Verify current official documentation before choosing APIs or packages. Pin package versions and commit the lockfile.

Maintain a clean feature-based folder structure.

Separate:

- UI components.
- Server actions and route handlers.
- Database access.
- Business logic.
- Clinical triage rules.
- Queue algorithms.
- Notification adapters.
- Resource allocation.
- Offline synchronisation.
- Tests.

Do not create one oversized component containing all business logic.

## D. Critical clinical safety requirements

MediRoute is a hackathon clinical workflow prototype.

It must not claim to be a validated diagnostic system or an autonomous replacement for trained triage staff.

Use clinician-approved rules before any real clinical deployment.

Emergency warning signs must trigger immediate instructions to seek staff assistance and a rapid human assessment pathway.

The application must never require QR scanning, account creation or form completion before a patient can receive emergency assistance.

Patient self-reported information is not a replacement for examination and vital-sign measurement.

Provide a manual fallback for system failure, no smartphone, incomplete information and loss of connectivity.

Keep demo protocols and scores visibly marked as unvalidated.

## E. Development discipline

Before development:

1. Inspect the complete repository.
2. Inspect all existing files and configuration.
3. Detect whether this is an empty project or an existing application.
4. Never overwrite an existing working project without examining it.
5. Establish the implementation plan.
6. Create a permanent `AGENTS.md` containing project instructions.
7. Create documentation explaining the architecture and feature modules.
8. Maintain a development checklist.
9. Maintain a known-issues register.

After every milestone:

1. Implement the requested functionality.
2. Run formatting.
3. Run lint.
4. Run TypeScript checks.
5. Run relevant tests.
6. Run a production build when appropriate.
7. Fix errors rather than hiding or disabling checks.
8. Update documentation.
9. Update the milestone checklist.
10. Report completed features and remaining blockers.

Do not mark a feature complete unless it has a working implementation and relevant verification.

Do not create inert buttons or simulated API success.

When external credentials are unavailable, implement the integration adapter and a transparent demo fallback. Clearly document what requires configuration.

Do not perform destructive database operations or force-push Git branches.

## F. Final outcome

The final product must contain:

1. A working patient portal.
2. A working reception and QR registration interface.
3. A working clinical triage engine.
4. A working dynamic queue.
5. A working nurse interface.
6. A working doctor interface.
7. A working emergency coordination interface.
8. A working resource management interface.
9. A working SmartFlow module.
10. A working admin dashboard.
11. Working offline registration and synchronisation.
12. Working referral and discharge management.
13. An operational analytics dashboard.
14. A Supabase database with migrations and RLS.
15. A GitHub repository.
16. A Vercel preview deployment.
17. A tested production deployment once configuration and approval are complete.

First inspect the repository and create the permanent project instructions and implementation plan. Then proceed with the implementation milestones.

Do not stop at a planning document. The goal is a functioning integrated application.

---

# PROMPT 1 — PROJECT INITIALISATION, ARCHITECTURE AND PROFESSIONAL UI

I am now authorising you to begin the actual MediRoute project implementation.

Use the complete requirements in the permanent project instructions.

### 1. Repository inspection

Inspect the existing repository and identify:

- Existing framework.
- Package manager.
- Existing components.
- Configuration.
- Git status.
- Existing remotes.
- Existing deployments or Supabase configuration if present.

Preserve useful code. Do not discard an existing repository.

### 2. Initialise the application

Set up or complete a Next.js App Router application with:

- TypeScript strict mode.
- Tailwind CSS.
- shadcn/ui or accessible equivalent.
- Lucide icons.
- Responsive layouts.
- Reusable components.
- Centralised design tokens.
- Form validation.
- Error boundaries.
- Loading states.
- Toast notifications.
- Accessibility support.

Verify the current stable installation commands using official documentation.

### 3. Professional visual design

Create a premium, professional healthcare-management interface.

Use MediRoute as the brand identity.

Design direction:

- Modern hospital management software.
- Clean professional dashboard.
- Burgundy and subtle gold brand accents inspired by the MediRoute event identity.
- Neutral background surfaces.
- Clear typography.
- Proper spacing.
- Clear distinction between navigation and content.
- Strong visual hierarchy.
- Medical urgency colours used consistently.

Use GREEN, YELLOW and RED only for actual triage classifications and related alerts. Do not use them as arbitrary decorative colours.

Avoid generic template aesthetics, overcrowded dashboards and excessive gradients.

The interface should look like professional enterprise healthcare software.

### 4. Create the global application layout

Implement:

- Responsive sidebar.
- Top navigation.
- Hospital selector, where the user has access to multiple hospitals.
- Notification centre.
- Logged-in user menu.
- Breadcrumbs.
- Responsive mobile navigation.
- Profile settings.
- Logout.
- Global search where appropriate.

### 5. Create the separate application sections

Create route structures for:

Public:

- `/`
- `/patient/start`
- `/patient/intake/[token]`
- `/patient/status/[token]`
- `/emergency`

Authentication:

- `/login`
- `/forgot-password`
- `/auth/callback`

Staff:

- `/dashboard`
- `/reception`
- `/triage`
- `/nurse`
- `/doctor`
- `/emergency-center`
- `/queues`

Management:

- `/smartflow`
- `/resources`
- `/departments`
- `/referrals`
- `/analytics`
- `/forecasting`
- `/settings`
- `/settings/staff`
- `/settings/hospital`
- `/settings/triage-protocol`
- `/audit`

Protect every staff-only route through server-side authentication and authorisation.

Do not expose protected patient data on public pages.

### 6. Build the design system

Create reusable components:

- StatusBadge.
- PriorityBadge.
- PatientCard.
- PatientTable.
- PatientTimeline.
- VitalSignCard.
- MetricCard.
- QueueTable.
- EmergencyAlertCard.
- StaffAvailabilityCard.
- BedAvailabilityCard.
- DepartmentCard.
- NotificationPanel.
- ConfirmationDialog.
- QRCodeDisplay.
- EmptyState.
- LoadingSkeleton.
- ErrorState.
- OfflineIndicator.
- SyncStatusIndicator.

### 7. Responsive requirements

The patient registration interface must work on low-resolution mobile devices.

Staff interfaces must work on desktop, laptop and tablet.

Ensure:

- No horizontal overflow.
- Keyboard navigation.
- Accessible labels.
- Sufficient contrast.
- Large touch targets.
- Screen-reader-friendly forms.
- Proper responsive tables.

### 8. Deliverables

Create:

- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/KNOWN_LIMITATIONS.md`
- Initial application structure.

Do not fill the dashboards with fake hardcoded operational data.

You may use clearly labelled synthetic development data while database integrations are being built.

Complete the project foundation and run the relevant checks.

---

# PROMPT 2 — SUPABASE DATABASE, AUTHENTICATION AND SECURITY

Now implement the complete Supabase backend for MediRoute.

Do not create frontend-only mock data.

### 1. Supabase project setup

Inspect current Supabase configuration and authenticated Supabase tools.

If a project already exists, inspect it before changing anything.

If a new project is needed:

- Use the authenticated Supabase tooling or documented CLI.
- Check the available organisations and existing projects.
- Ask me for the necessary project or organisation selection if it cannot be established.
- Choose a suitable India-region location only after checking the currently supported regions and existing project requirements.
- Do not create unexpected billable infrastructure.

Use official, current Supabase documentation.

### 2. Database schema

Create properly designed migrations for these tables.

**Hospital and access management**

- hospitals
- hospital_memberships
- user_profiles
- departments
- staff_assignments
- staff_shifts
- staff_availability

**Patient management**

- patients
- patient_identifiers
- patient_encounters
- encounter_access_tokens
- patient_emergency_contacts

**Clinical information**

- symptom_catalog
- patient_symptoms
- medical_histories
- patient_allergies
- patient_medications
- clinical_observations
- vital_signs

**Triage**

- triage_protocol_versions
- triage_rule_definitions
- triage_assessments
- triage_assessment_answers
- triage_score_breakdowns
- triage_overrides
- reassessment_records

**Patient queues**

- queue_entries
- queue_events
- patient_status_events

**Notifications**

- notifications
- notification_recipients
- notification_acknowledgements
- notification_delivery_attempts
- escalation_policies

**Hospital resources**

- hospital_resources
- resource_reservations
- resource_status_history

**Referrals**

- referral_facilities
- referrals
- transfer_records
- referral_acknowledgements

**Hospital workflow**

- treatment_records
- investigation_records
- admissions
- discharges
- follow_up_records

**Administration and auditing**

- audit_logs
- hospital_settings
- system_settings
- offline_sync_events
- operational_daily_metrics

Use suitable relational structures, foreign keys, unique constraints, check constraints, timestamps and indexes.

Use UUID identifiers where appropriate.

Represent clinical values with appropriate data types. Store timestamps in `timestamptz` and display them in the Asia/Kolkata timezone.

### 3. Data model requirements

A patient can have multiple encounters.

An encounter belongs to one hospital.

A QR token belongs to a specific encounter, not to a permanent patient identity.

Clinical assessments must be historically preserved.

Triage changes must be auditable.

Resource reservations must prevent double allocation.

Patient-flow events must be preserved rather than silently overwritten.

Every hospital-owned record must have a reliable hospital ownership relationship.

### 4. Authentication

Implement Supabase Auth for medical staff.

Roles:

- super_admin
- hospital_admin
- receptionist
- triage_nurse
- nurse
- doctor
- emergency_coordinator
- resource_manager

Support staff invitations and account activation.

Do not allow public users to register themselves as doctors or administrators.

Patient registration through a secure encounter token should not require the patient to create an account.

Store staff roles and hospital membership in protected database tables or trusted application metadata, not user-editable metadata.

### 5. Row Level Security

Enable RLS on every table in exposed schemas.

Implement policies based on:

- Authenticated user.
- Hospital membership.
- Staff role.
- Assigned department where required.
- Assigned patient/encounter where applicable.

Public users must never receive unrestricted access to patient tables.

For public patient QR operations, use secure server-side handlers which validate the hashed encounter token, token expiry, permissions and rate limits before accessing records.

Do not create broad public policies to make the application work.

Never expose the service-role key through any `NEXT_PUBLIC_` variable.

### 6. Supabase clients

Implement:

- Browser Supabase client.
- Server Supabase client.
- Cookie/session integration.
- Middleware or the currently recommended equivalent for protected routes.
- Safe server-only administrative client when genuinely required.

Use `@supabase/ssr` for Next.js cookie-based authentication according to the latest official guidance.

Verify every user server-side before authorising protected actions.

### 7. Database utilities

Create:

- Database types.
- Typed query helpers.
- Server-side repository functions.
- Safe error handling.
- Transaction-safe resource reservation logic.
- Migration files.
- Seed scripts for development and demo data.

Create separate seed data for synthetic demo hospitals, staff, departments, resources and patients.

Never place actual patient data in seed files.

### 8. Supabase verification

Test:

- Staff login.
- Staff logout.
- Role restrictions.
- Hospital isolation.
- RLS restrictions.
- Patient encounter access.
- QR token expiry.
- Database relationships.
- Resource reservation constraints.
- Audit logging.

Test with different roles and different hospitals.

Ensure Hospital A users cannot access Hospital B patient records.

Run available Supabase database security advisors and resolve issues.

Create:

- `docs/DATABASE_SCHEMA.md`
- `docs/ROLE_PERMISSIONS.md`
- `docs/SUPABASE_SETUP.md`
- `supabase/migrations/`
- `supabase/seed.sql` or equivalent safe seed structure.

Only report Supabase as configured after verifying that the connected project and migrations actually exist.

---

# PROMPT 3 — PATIENT PORTAL, QR GENERATION AND REGISTRATION

Now develop the complete patient-facing and reception-facing registration system.

This must be functional and integrated with Supabase.

### 1. Reception dashboard

Create a patient-registration interface.

Receptionists must be able to:

- Search an existing patient.
- Create a new patient.
- Create a new encounter.
- Register unidentified emergency patients.
- Record arrival time.
- Select the department or hospital location.
- Generate an encounter ID.
- Generate a QR code.
- Print a QR token.
- Copy the patient entry link.
- Revoke and regenerate an encounter access token.
- See registration status.

Duplicate-patient detection should use carefully validated identifiers and avoid accidental merging.

### 2. QR code mechanism

Generate a cryptographically random, high-entropy token for each encounter.

The QR code should contain only a secure encounter URL/token.

Do not place the patient's name, phone number, symptoms, medical history or other sensitive information directly in the QR code.

Store only a securely hashed token where possible.

Implement:

- Token validation.
- Token expiration.
- Token revocation.
- Rate limiting.
- Replay protection where appropriate.
- Safe error messages.
- Access logging without logging raw tokens.

The QR token must never grant unrestricted access to the entire medical record.

### 3. Patient registration flow

When a patient scans the QR code, open a professional mobile page.

Show:

1. MediRoute identity.
2. Language selection.
3. Encounter verification.
4. Patient details.
5. Basic medical history.
6. Symptoms and complaints.
7. Symptom duration.
8. Symptom severity.
9. Bleeding/injury reporting.
10. Breathing status.
11. Consciousness status.
12. Relevant warning signs.
13. Medical conditions.
14. Allergies.
15. Current medications.
16. Vital signs if measured and entered by a qualified staff member or reliable source.
17. Review and submit.

Use conditional questions so patients are not overwhelmed by irrelevant fields.

Add a clear emergency instruction at the beginning and throughout the form.

If a patient reports a concerning emergency warning sign, immediately display an instruction to alert nearby medical staff and create an urgent staff alert through the server-side workflow. Never make them complete the remaining form first.

### 4. Accessibility and language

Provide English, Kannada and Hindi initially.

Use a proper internationalisation framework and translation dictionaries.

Support:

- Large text.
- Pictorial options.
- Simple terminology.
- Voice input where browser support exists.
- Manual typing fallback.
- Clear progress indicators.
- Screen-reader labels.

Do not use unverified machine translations for clinical instructions. Clinical wording should be reviewed.

### 5. Assisted registration

Build an equivalent registration form for receptionists and nurses.

It must support:

- Elderly patients.
- Unconscious patients.
- Injured patients.
- Children with guardians.
- Patients unable to use smartphones.
- Patients who do not understand the available languages.

Keep the distinction between patient-reported and staff-measured information.

### 6. Patient status page

After submission, the patient should see:

- Registration confirmation.
- Encounter token/reference.
- Current general status.
- Waiting instruction approved by staff.
- Department assignment when confirmed.
- General progress updates.

Do not expose internal clinical notes, staff-only comments, other patients' information or detailed clinical scores.

### 7. QR printing

Create a printable patient QR slip with:

- MediRoute branding.
- Encounter reference.
- QR code.
- Simple scan instructions.
- Hospital name.
- Arrival timestamp.

Avoid printing sensitive clinical details.

### 8. Validation

Test:

- Successful QR scan.
- Invalid QR.
- Expired QR.
- Revoked QR.
- Repeated submissions.
- Incomplete form.
- Emergency warning sign.
- Offline reception entry.
- Multiple encounters for one patient.
- Printing.
- Small-screen mobile layout.

All information must be saved through authenticated or securely token-validated backend operations.

---

# PROMPT 4 — CLINICAL TRIAGE ENGINE, EMERGENCY OVERRIDE AND SCORING

Implement the main MediRoute clinical decision-support engine.

This is the most important engineering module.

Do not create a simplistic symptom counter.

### 1. Separate the clinical classification from numerical scoring

Implement two separate components:

A. Clinical urgency classification.

B. Secondary numerical patient-priority score.

The clinical category is authoritative for queue class.

The numerical score is an explainable supplementary indicator and must not supersede emergency classification.

### 2. Emergency override

Create an emergency-warning-sign rules engine.

It must support configurable, clinician-reviewed warning signs including examples such as:

- Cardiac arrest or unresponsiveness.
- Severe respiratory distress.
- Severe uncontrolled bleeding.
- Suspected stroke.
- Ongoing seizure.
- Major trauma.
- Suspected shock.
- Other clinician-approved emergencies.

When a validated trigger is identified:

1. Create an emergency escalation record.
2. Bypass routine queue waiting.
3. Activate the emergency notification workflow.
4. Notify the assigned response team.
5. Request necessary assistance.
6. Record the trigger and timestamp.
7. Continue to request human assessment.
8. Preserve the override in the audit history.

Use clinically approved rule definitions. Do not independently invent clinical cutoffs.

### 3. Triage categories

GREEN:
Non-immediate care.

YELLOW:
Urgent/immediate assessment.

RED:
Critical/emergency.

Internal assessment-required:
Information incomplete, uncertain or unverified and needing prompt human triage.

Never classify missing vital signs as normal.

Never automatically classify a patient as GREEN only because the patient reports a low pain score.

### 4. Rule engine architecture

Build a modular clinical rules engine.

Separate:

- Rule definitions.
- Input validation.
- Warning-sign detection.
- Missing-data detection.
- Vital-sign evaluation.
- Symptom evaluation.
- Risk-factor evaluation.
- Classification.
- Explanation generation.
- Clinician verification.
- Audit recording.

Make the rules versioned.

A protocol version must include:

- Name.
- Version.
- Status.
- Source/reference.
- Author.
- Clinical reviewer.
- Approval timestamp.
- Effective date.
- Expiry or review date where applicable.

Never allow unreviewed draft rules to silently become the active clinical protocol.

### 5. Score out of 100

Create a configurable score engine.

Illustrative structure:

- Clinical urgency indicators: 0–40.
- Vital-sign abnormalities: 0–25.
- Symptom severity/progression: 0–15.
- Relevant risk factors: 0–10.
- Waiting-time escalation component: 0–10.

These weights are prototype engineering examples, not clinically validated measurements.

Requirements:

- Allow decimal scores.
- Return a score from 0 to 100.
- Produce a component breakdown.
- Explain why points were assigned.
- Handle missing information.
- Store the scoring protocol version.
- Make every calculation reproducible.
- Include unit tests.

Do not allow waiting time to change the patient's clinical category automatically.

The numerical score should be visibly marked as demonstration-only until the relevant scoring protocol has undergone clinical review and validation.

Provide a way to disable the score or display "Not available — insufficient information."

### 6. Human verification

Nurses and authorised clinicians should be able to:

- Review the assessment.
- Confirm the category.
- Change a proposed category.
- Enter a clinical reason for override.
- Update vital signs.
- Record a reassessment.
- Escalate the patient.
- Record who made the final decision.

No override should erase the original algorithmic recommendation.

Keep both values in the assessment history.

### 7. Reassessment

Implement reassessment scheduling through configurable hospital protocol settings.

The nurse interface must show:

- Last assessment time.
- Next reassessment due.
- Overdue indicator.
- Current patient status.
- Deterioration history.

When concerning new information is entered, trigger an urgent reassessment task.

Escalation intervals must be hospital-configurable and treated as operational demo settings until approved.

### 8. Clinical simulation tests

Create synthetic cases for:

- Mild fever.
- Mild injury.
- Worsening symptoms.
- Concerning chest pain.
- Suspected stroke.
- Severe bleeding.
- Respiratory distress.
- Cardiac arrest.
- Missing information.
- Elderly patient.
- Unconscious patient.
- Changing vital signs.

Have test expectations reviewed by the clinical team.

The goal is to verify the software's handling of configured cases, not claim diagnostic sensitivity or clinical validation.

### 9. Deliverables

Implement:

- Clinical engine.
- Rule versioning.
- Score engine.
- Breakdown UI.
- Clinical assessment UI.
- Override workflow.
- Reassessment logic.
- Unit and integration tests.
- `docs/TRIAGE_ALGORITHM.md`
- `docs/CLINICAL_SAFETY.md`

---

# PROMPT 5 — DYNAMIC QUEUES, STAFF DASHBOARDS AND EMERGENCY NOTIFICATIONS

Implement real-time communication and staff coordination.

### 1. Live patient queue

Create separate queues:

- Awaiting triage.
- GREEN/general care.
- YELLOW/urgent assessment.
- RED/emergency.
- Reassessment required.
- Awaiting doctor.
- Awaiting investigation.
- Awaiting admission.
- Awaiting referral.

The system must support hospital and department filters.

### 2. Queue ordering

Apply a deterministic ordering model:

1. Active emergency cases.
2. Other RED cases.
3. YELLOW cases.
4. GREEN cases.

Within a clinical category, consider:

- Clinical sub-priority.
- Deterioration alerts.
- Reassessment overdue.
- Validated secondary priority indicator.
- Waiting time.
- Arrival time as a tie-breaker.

Keep assessment-required patients in an explicit triage-assessment queue. Do not quietly place them in GREEN.

Never let a lower clinical category overtake a higher one through numerical scoring.

Provide clear explanations for each queue position.

### 3. Supabase Realtime

Use Supabase Realtime for relevant events:

- New patient.
- Updated patient status.
- New alert.
- Alert acknowledgement.
- Queue movement.
- Resource update.

Subscribe only to the records the authenticated user is authorised to access.

Implement reconnection and safe refresh behaviour.

Do not depend exclusively on WebSockets. Add a sensible polling or refresh fallback.

### 4. Nurse dashboard

Display:

- Patient queue.
- Triage status.
- Vital signs.
- Reassessment deadlines.
- Alerts.
- Patients assigned to the nurse.
- Unacknowledged tasks.

Provide working buttons for:

- Open patient.
- Begin assessment.
- Record vital signs.
- Verify category.
- Request doctor.
- Escalate.
- Complete assessment.
- Update patient destination.

### 5. Doctor dashboard

Display:

- Urgent cases.
- Critical cases.
- Assigned cases.
- Pending cases.
- Clinical history.
- Current status.
- Vital-sign trends.
- Assessment breakdown.
- Nurse handover.
- Investigation history.

Implement working actions for:

- Review patient.
- Add assessment.
- Record treatment.
- Request investigations.
- Recommend admission.
- Initiate referral.
- Discharge after appropriate documentation.

### 6. Emergency coordination dashboard

Create a dedicated emergency control room interface.

Display:

- Active RED cases.
- Time since alert.
- Patient location.
- Emergency reason.
- Acknowledgement status.
- Assigned team.
- Assigned doctor.
- Stretcher request.
- Emergency bed request.
- Current response status.

Allow the authorised coordinator to:

- Acknowledge alert.
- Assign response team.
- Assign staff.
- Request a stretcher.
- Request equipment.
- Record arrival of the response team.
- Mark emergency assistance in progress.
- Escalate an unacknowledged alert.
- Close the alert with appropriate documentation.

### 7. Alert system

Implement notification lifecycle:

CREATED → SENT → ACKNOWLEDGED → IN PROGRESS → RESOLVED.

Alternative transitions:

- ESCALATED.
- CANCELLED.

Every alert must record:

- Trigger.
- Encounter.
- Recipient.
- Sender.
- Timestamp.
- Delivery status.
- Acknowledgement time.
- Resolution time.

### 8. Escalation mechanism

Configure acknowledgement intervals by hospital.

If the assigned recipient fails to acknowledge:

- Notify configured backup staff.
- Notify emergency coordinator.
- Record escalation.
- Continue to display an active unacknowledged alert.

Do not mark an alert as completed merely because a notification provider accepted a message.

### 9. Notification channels

Implement:

- In-app notifications.
- Real-time notification panel.
- Browser push when configured.
- Optional SMS adapter.
- Optional external notification adapter.

Provide a fully working in-app mode without requiring paid external APIs.

### 10. Verification

Test:

- Different user roles.
- Queue ordering.
- Real-time updates.
- Alert acknowledgement.
- Escalation.
- Duplicate notification prevention.
- Notification permissions.
- Unavailable notification service.
- Browser refresh.
- Reconnection.

---

# PROMPT 6 — SMARTFLOW, RESOURCE ALLOCATION, REFERRAL AND PATIENT OUTFLOW

Now implement the entire hospital operations module.

Call this module **MediRoute SmartFlow**.

### 1. Patient journey engine

Implement the full patient lifecycle.

REGISTERED  
→ INTAKE PENDING  
→ TRIAGE PENDING  
→ TRIAGE COMPLETED  
→ QUEUE ASSIGNED  
→ STAFF ASSESSMENT  
→ DIAGNOSTICS  
→ TREATMENT  
→ DISPOSITION.

Disposition:

- Discharged.
- Admitted.
- Referred/transferred.
- Follow-up scheduled.

All transitions must be stored in a chronological event history.

### 2. Patient tracking

Every patient's details page should include:

- Encounter information.
- Current department.
- Assigned staff.
- Clinical assessment history.
- Queue information.
- Current status.
- Status history.
- Investigation records.
- Treatment notes.
- Resources assigned.
- Referral records.
- Admission details.
- Discharge summary.

Protect this data using role-based permissions.

### 3. Resource management

Create a resource inventory.

Resource categories:

- General beds.
- Emergency beds.
- ICU beds.
- Stretchers.
- Wheelchairs.
- Diagnostic equipment.
- Other hospital-defined resources.

Each resource should have:

- Resource ID.
- Type.
- Department.
- Current status.
- Location.
- Capacity, where appropriate.
- Availability.
- Maintenance status.
- Reservation information.

### 4. Reservation logic

Implement transaction-safe resource allocation.

Prevent double booking.

Reservation lifecycle:

- Available.
- Reserved.
- Occupied.
- Cleaning/maintenance.
- Unavailable.

Require the appropriate user permissions.

When no appropriate resource is available:

- Notify the responsible coordinator.
- Show the shortage.
- Display alternative resources or destinations for staff review.
- Preserve clinical priority.

### 5. Staff coordination

Implement:

- Staff directory.
- Department assignments.
- Shift availability.
- Staff status.
- Assigned patients.
- Current workload.
- Staff notifications.

Only authorised administrators should edit duty schedules and staff availability.

### 6. Department management

Create department records with:

- Name.
- Description.
- Location.
- Supported services.
- Operating status.
- Capacity.
- Assigned doctors.
- Assigned nurses.
- Assigned resources.

Allow administrators to configure department routing rules.

### 7. Smart hospital routing

Implement a routing recommendation engine based on:

- Confirmed triage category.
- Patient's clinical requirement.
- Appropriate available department.
- Facility capabilities.
- Verified resource availability.

Do not use department congestion alone to decide where a patient must go.

Present routing as a recommendation for authorised staff confirmation.

### 8. Referral management

Create a referral directory.

Each facility has:

- Name.
- Location.
- Contact information.
- Supported specialities.
- Available services.
- Facility level.
- Referral requirements.
- Operating status.

Create a referral workflow:

1. Clinician initiates referral.
2. Reason and summary recorded.
3. Destination selected.
4. Receiving facility contacted through an available channel.
5. Acceptance or acknowledgement recorded.
6. Ambulance requirement recorded.
7. Transfer assigned.
8. Transfer departure recorded.
9. Receiving-facility arrival recorded.
10. Referral completed.

Do not claim the receiving facility has capacity without confirmation or a verified integration.

### 9. Discharge and admission

Implement discharge workflow with:

- Doctor approval.
- Final clinical notes.
- Discharge instructions.
- Follow-up date.
- Prescription reference, where entered by clinician.
- Discharge timestamp.

Implement admission with:

- Admission reason.
- Assigned ward.
- Bed reservation.
- Responsible doctor.
- Admission confirmation.

### 10. SmartFlow dashboard

Display:

- Total patients.
- Registered today.
- Currently waiting.
- Under assessment.
- In treatment.
- Awaiting diagnostics.
- Awaiting beds.
- Awaiting transfer.
- Admitted.
- Discharged.
- Referred.

Add department-level filters and patient timeline visualisations.

### 11. Analytics

Calculate:

- Average registration-to-triage time.
- Average triage-to-assessment time.
- Total waiting time.
- Average treatment duration where timestamps are available.
- Department workload.
- Resource utilisation.
- Admission and discharge counts.
- Referral turnaround.

Show missing or incomplete data honestly. Do not invent values or patient treatment outcomes.

### 12. Tests

Test:

- Status transitions.
- Resource concurrency.
- Bed reservation.
- Staff assignments.
- Referral lifecycle.
- Admission workflow.
- Discharge workflow.
- Patient history integrity.
- Role restrictions.

---

# PROMPT 7 — OFFLINE-FIRST PWA, RURAL MODE AND MULTILINGUAL ACCESSIBILITY

Now transform the website into an installable, rural-friendly Progressive Web Application.

This feature is a major differentiator for MediRoute.

### 1. PWA

Implement:

- Web manifest.
- Application icons.
- Installation prompt.
- Service worker.
- Offline landing page.
- Network status detection.
- Update management.
- Responsive mobile interface.

### 2. Offline registration

Use IndexedDB to store authorised staff's offline registration drafts.

Support:

- Patient details.
- Encounter creation.
- Basic symptom information.
- Locally generated provisional encounter identifiers.
- Offline form submission.
- Outbox management.
- Synchronisation status.

Offline mutations must have stable idempotency keys.

When connectivity returns:

1. Verify the authenticated staff session.
2. Send queued records securely.
3. Check whether the server already processed each operation.
4. Sync in a deterministic order.
5. Record success or failure.
6. Retry recoverable failures.
7. Show conflicts for staff review.
8. Remove locally retained drafts according to the configured data-retention policy after successful acknowledgement.

Never silently overwrite newer clinical assessments with stale offline submissions.

### 3. Offline QR limitations and handling

When creating an encounter offline:

- Generate a provisional encounter ID.
- Generate a local reference QR if appropriate.
- Clearly distinguish provisional and server-issued tokens.
- Synchronise securely when online.

Never claim that a patient's separate smartphone can access the cloud-hosted patient portal without internet.

Support a future local-network gateway architecture for multi-device disconnected hospital usage.

### 4. Service-worker security

Do not cache:

- Patient medical records.
- Authenticated API responses.
- Clinical assessments.
- Sensitive staff dashboards.
- Raw QR access tokens.

Cache only the required static application assets and approved non-sensitive public resources.

### 5. Rural mode

Provide a simplified mode for low-resource healthcare centres.

Include:

- Large buttons.
- Low-bandwidth layouts.
- Simple registration.
- Assisted registration.
- Printable forms/tokens.
- Regional languages.
- Manual workflow fallback.
- Connection warning.
- Offline data status.

### 6. Voice support

Implement optional voice-to-text symptom entry using supported browser capabilities.

Include:

- Permission handling.
- Unsupported-browser fallback.
- Manual text entry.
- Editing before submission.
- Language-specific input where supported.

Do not automatically interpret voice input as a confirmed clinical finding.

### 7. Language support

Implement complete user-interface translation for:

- English.
- Kannada.
- Hindi.

All validation messages, instructions, menus, navigation and patient questions should be translated.

Clinical terms must be reviewed before being treated as approved translations.

### 8. Accessibility

Follow WCAG 2.2 AA principles where applicable.

Implement:

- Keyboard navigation.
- Focus indicators.
- Colour contrast.
- Form labels.
- Screen-reader support.
- Large text option.
- Responsive layouts.
- Accessible emergency alert controls.

### 9. Testing

Test:

- Installation.
- Offline page.
- Offline registration.
- Queue persistence.
- Reconnection.
- Duplicate sync.
- Failed sync.
- Conflict handling.
- Browser refresh while offline.
- Shared-device cleanup.
- Language switching.
- Mobile accessibility.

Document exactly what works offline, what requires internet and what requires an on-premises gateway.

---

# PROMPT 8 — ADMIN DASHBOARD, HOSPITAL SETTINGS, ANALYTICS AND FORECASTING

Build the complete hospital administrator interface.

### 1. Administrator overview

Create a professional dashboard with real Supabase data.

Display:

- Total patients registered today.
- Active encounters.
- GREEN cases.
- YELLOW cases.
- RED cases.
- Patients awaiting triage.
- Patients awaiting doctors.
- Patients under treatment.
- Patients awaiting admission.
- Available beds.
- Occupied beds.
- Available staff.
- Unacknowledged alerts.
- Active referrals.

### 2. Department analytics

For every hospital department, show:

- Number of registered patients.
- Waiting patients.
- Cases under assessment.
- Cases in treatment.
- Workload.
- Available staff.
- Available resources.
- Current capacity.

### 3. Hospital configuration

Allow authorised administrators to configure:

- Hospital details.
- Departments.
- Operating hours.
- Staff.
- Staff roles.
- Duty schedules.
- Resources.
- Bed categories.
- Referral facilities.
- Notification recipients.
- Escalation policies.
- Waiting-time warning configuration.
- Languages.

### 4. Clinical protocol administration

Create a clinical protocol administration area.

Support:

- Draft rule sets.
- Version history.
- Clinical reference.
- Reviewer assignment.
- Approval status.
- Effective dates.
- Protocol activation.
- Protocol retirement.

Do not allow an ordinary administrator or unqualified user to activate a clinically unreviewed triage protocol.

Keep demonstration scoring clearly separated from approved clinical decision support.

### 5. Operational forecasting

Implement statistical, explainable forecasting based on historical aggregate operational data.

Provide:

- Patient inflow by hour.
- Inflow by day.
- Department demand.
- Bed occupancy patterns.
- Referral patterns.
- Anticipated peak hours.

Add transparent limitations and the historical window used.

Never present aggregate forecasts as predictions of individual patients' conditions.

### 6. Hospital reports

Allow authorised users to generate:

- Daily reports.
- Weekly reports.
- Monthly reports.
- Department reports.
- Patient-flow reports.
- Resource reports.
- Referral reports.
- Operational workload reports.

Use synthetic data in demo reports.

Export CSV and PDF where feasible.

Ensure users can only export data permitted by their role.

### 7. Audit dashboard

Display:

- User login activity where available.
- Clinical assessment changes.
- Priority overrides.
- Patient status transitions.
- Resource allocation.
- Referral updates.
- User role changes.
- System configuration changes.

Every record should identify actor, action, timestamp and relevant entity.

Audit records must not be silently editable by normal users.

### 8. Dashboard design

Use professional charts and tables.

Charts should be based on actual database results.

Do not display hardcoded percentages as if they were live hospital measurements.

Provide sensible empty states for newly created hospitals.

### 9. Verification

Test:

- Admin permissions.
- Analytics calculations.
- Export permissions.
- Date filters.
- Department filters.
- Audit record creation.
- Protocol approval restrictions.
- Forecast calculation.
- Data isolation.

---

# PROMPT 9 — COMPLETE INTEGRATION, QA, SECURITY AND DEMONSTRATION

Now perform a full end-to-end review of the application.

Do not add random new features before verifying the existing modules.

### 1. Integration audit

Verify that these systems operate together:

Patient portal  
→ QR verification  
→ Registration  
→ Symptom collection  
→ Triage  
→ Priority queue  
→ Nurse notification  
→ Doctor dashboard  
→ Emergency coordination  
→ Resource allocation  
→ SmartFlow  
→ Treatment  
→ Admission/discharge/referral  
→ Analytics.

Ensure every step uses actual persisted database records.

### 2. End-to-end scenario 1 — Routine patient

Simulate:

1. Reception registers a patient.
2. QR is generated.
3. Patient scans QR.
4. Patient enters routine symptoms.
5. Nurse reviews the information.
6. Clinician confirms the appropriate category.
7. Patient enters the general-care queue.
8. Nurse is notified.
9. Doctor or authorised staff completes assessment.
10. Patient receives documented disposition.
11. Patient is discharged where appropriate.

### 3. End-to-end scenario 2 — Urgent patient

Simulate:

1. Patient is registered.
2. Relevant warning signs or findings are recorded.
3. The system identifies the need for urgent human assessment.
4. Nurse and duty doctor are notified.
5. Staff acknowledge the alert.
6. Patient is moved to the urgent assessment area.
7. Doctor reviews the patient.
8. Treatment or investigation is recorded.
9. Disposition is recorded.

### 4. End-to-end scenario 3 — Emergency patient

Simulate:

1. Patient arrives with a configured emergency warning sign.
2. Patient is not forced to complete registration first.
3. Staff creates an emergency encounter.
4. Emergency override is activated.
5. RED alert is created.
6. Emergency coordinator receives the alert.
7. Duty doctor receives the alert.
8. Stretcher request is recorded.
9. Emergency response is acknowledged.
10. Patient is treated.
11. Resource and treatment records are updated.
12. Doctor records admission, transfer or another disposition.

### 5. End-to-end scenario 4 — Deterioration

Simulate:

1. Patient initially receives a lower urgency category.
2. Patient is waiting.
3. A nurse enters new concerning observations.
4. The application triggers reassessment/escalation.
5. Category is reviewed by qualified staff.
6. Queue changes appropriately.
7. Relevant teams are notified.
8. All transitions are recorded.

### 6. End-to-end scenario 5 — Offline rural registration

Simulate:

1. Hospital tablet is connected.
2. Staff opens the application.
3. Internet disconnects.
4. Staff creates an offline registration.
5. Application retains the draft locally.
6. Internet returns.
7. Application synchronises.
8. Duplicate creation is prevented.
9. Server record is verified.
10. Local data is handled according to the retention policy.

### 7. End-to-end scenario 6 — Elderly and assisted registration

Simulate:

- No smartphone.
- Assisted patient registration.
- Limited ability to provide information.
- Missing data.
- Staff verification.
- Clinical assessment.

### 8. End-to-end scenario 7 — No available emergency bed

Simulate:

- RED case.
- No suitable local bed.
- Emergency coordinator informed.
- Resource shortage recorded.
- Alternative transfer pathway reviewed by authorised staff.
- Referral status tracked.

Do not downgrade the patient's priority.

### 9. Automated test suite

Implement:

- Vitest or an appropriate unit test framework.
- Playwright end-to-end testing.
- React/component testing where appropriate.
- Database integration tests.
- Supabase RLS verification.
- API permission testing.

### 10. Security audit

Verify:

- No service-role key in frontend bundles.
- No secrets in Git history.
- All exposed database tables have RLS.
- Role checks are server-side.
- No self-assigned staff privileges.
- QR tokens are protected.
- Public routes are rate-limited.
- User input is validated.
- Patients cannot access other encounters.
- Hospital data cannot leak between tenants.
- Audit records are generated.
- Document access is protected.
- Error messages do not reveal sensitive data.

Review dependency vulnerabilities and remove unused packages.

### 11. Performance and accessibility

Check:

- Page loading.
- Dashboard query performance.
- Pagination.
- Responsive layouts.
- Accessibility.
- Large patient queues.
- Realtime reconnection.
- Loading/error states.
- Mobile responsiveness.

### 12. Demo data and presentation

Create a clearly labelled synthetic demo environment.

Provide:

- Demo hospital.
- Departments.
- Staff roles.
- Sample patients.
- Sample resources.
- Sample queue entries.
- Sample alerts.
- Sample referrals.

Create a repeatable demo reset mechanism for local/demo data only. Never use a destructive reset against production data.

### 13. Final documentation

Create:

- `docs/TEST_PLAN.md`
- `docs/TEST_RESULTS.md`
- `docs/SECURITY_AUDIT.md`
- `docs/DEMO_GUIDE.md`
- `docs/FEATURE_STATUS.md`
- `docs/DEPLOYMENT_STATUS.md`

Report honestly which features are:

- Fully implemented.
- Tested.
- Partially configured.
- Awaiting external credentials.
- Not ready for operational clinical use.

Do not claim clinical validation.

---

# PROMPT 10 — GITHUB REPOSITORY, SUPABASE REMOTE DATABASE AND VERCEL DEPLOYMENT

Now prepare MediRoute for real hosted deployment.

This stage requires actual authenticated infrastructure operations, not just deployment configuration files.

## A. GitHub

Inspect the current Git repository.

If an existing remote is configured, verify it and preserve it.

If no remote exists:

1. Check the authenticated GitHub account.
2. Create a private repository named `medcipher-triage-platform`.
3. Initialise Git if needed.
4. Use `main` as the production branch.
5. Add a suitable `.gitignore`.
6. Ensure `.env.local`, `.env`, credentials, `.vercel`, secrets and private patient data are never committed.
7. Add an informative README.
8. Add the source code.
9. Commit in logical milestones.
10. Push the project to GitHub.

Do not overwrite or force-push an existing remote.

Create:

- `README.md`
- `.gitignore`
- `.github/workflows/ci.yml`
- `SECURITY.md`
- `CONTRIBUTING.md`, if useful.

## B. GitHub CI

Configure GitHub Actions to run on pull requests and pushes.

Jobs:

- Dependency installation.
- Formatting verification.
- Lint.
- TypeScript checking.
- Unit tests.
- Integration tests where credentials are safely available.
- Production build.
- Dependency security checks.

Use least-privilege permissions and pin third-party Actions to reviewed versions where practical.

Do not place secrets in pull-request workflows that execute untrusted code.

A failing check should fail the pipeline.

## C. Supabase remote project

Now verify the Supabase project.

If it has not yet been created:

- Use available authenticated Supabase tools or the official CLI.
- Confirm the target organisation.
- Create the requested project only after the required project selection.
- Choose a supported region appropriate for the target users.
- Never reset an existing production database.

Check:

- Project URL.
- Publishable key.
- Database connection.
- Authentication settings.
- Email confirmation/redirect settings.
- Database migrations.
- RLS policies.
- Realtime configuration.
- Storage policies.

Apply the migrations in dependency order.

Seed synthetic demo data only in the appropriate demo environment.

Generate and verify TypeScript database types.

Never expose the Supabase service-role key.

## D. Environment variables

Prepare `.env.example` with placeholders for:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_APP_URL`

`VAPID_PUBLIC_KEY`

`VAPID_PRIVATE_KEY`

Add other provider variables only when an actual integration is implemented.

The service-role key must remain server-side and must never use a `NEXT_PUBLIC_` prefix.

Create `.env.local` only in the local environment and ensure it is gitignored.

Set project secrets directly through secure provider authentication or the Vercel environment configuration interface. Never print their values in terminal output or commit them.

## E. Vercel project

Connect the GitHub repository to Vercel.

Create or link the project:

`medcipher-triage-platform`

Configure:

- Next.js framework.
- Correct project root.
- Build command.
- Environment variables.
- Preview environment.
- Production environment.
- Main production branch.

Ensure the application uses the proper Supabase URL and publishable key for each environment.

Use server-side environment variables for privileged credentials.

## F. Preview deployment

Before production deployment:

1. Build the production application locally or with the appropriate Vercel build workflow.
2. Resolve build errors.
3. Deploy a preview.
4. Open the preview URL.
5. Verify authentication.
6. Verify the patient QR flow.
7. Verify the staff dashboards.
8. Verify the database connection.
9. Verify realtime notifications.
10. Verify all essential E2E workflows.

## G. Production deployment

When the preview has passed the checks and deployment approval is available:

1. Confirm the target Vercel project.
2. Confirm the intended GitHub commit.
3. Confirm production environment variables.
4. Confirm database migrations are applied and compatible.
5. Deploy the production branch.
6. Verify the deployment status.
7. Verify the live website.
8. Check application logs.
9. Check critical API routes.
10. Check authentication.
11. Check the Supabase connection.

Use Vercel's current official CLI and documentation. Discover CLI commands using help rather than guessing.

Never perform production database resets or destructive schema changes.

## H. Deployment verification

Report:

- GitHub repository URL.
- Git branch.
- Latest commit.
- Supabase project reference.
- Database migration status.
- Vercel project name.
- Preview deployment URL.
- Production URL.
- Deployment status.
- Build status.
- CI status.
- Remaining environment setup.

Do not claim that GitHub, Supabase or Vercel deployment is successful until the external service has actually confirmed it.

If credentials or account permissions are unavailable, complete the code and configuration, identify the exact blocked operation and give the required secure account-side setup instructions.

---

# PROMPT 11 — FINAL MASTER ACCEPTANCE TEST AND PROJECT COMPLETION

You are now responsible for conducting a final project-wide acceptance audit.

Do not merely summarise the project.

Inspect the actual repository, database migrations, tests, CI workflow and deployed application.

## 1. Functional acceptance

Verify every requirement below.

PATIENT:

- QR registration.
- Patient intake.
- Symptom collection.
- Multilingual UI.
- Assisted registration.
- Encounter tracking.
- Secure patient status.

CLINICAL TRIAGE:

- Emergency overrides.
- GREEN/YELLOW/RED.
- Assessment-required state.
- Score out of 100.
- Decimal scores.
- Scoring explanation.
- Clinical verification.
- Manual override.
- Reassessment.
- Versioned protocols.

QUEUES:

- Dynamic ordering.
- Emergency priority.
- Waiting-time tracking.
- Deterioration escalation.
- Department queues.
- Live updates.

NOTIFICATIONS:

- Nurse alerts.
- Doctor alerts.
- Emergency alerts.
- Role-based routing.
- Acknowledgement.
- Escalation.
- Alert history.

HOSPITAL OPERATIONS:

- Staff management.
- Department management.
- Bed management.
- Stretcher management.
- Resource allocation.
- Patient movement.
- Admissions.
- Discharges.
- Referrals.
- Transfers.

RURAL ACCESS:

- PWA installation.
- Offline drafts.
- Local storage.
- Sync queue.
- Duplicate prevention.
- Recovery after reconnection.
- Low-bandwidth interface.
- Language support.

ADMINISTRATION:

- Hospital dashboard.
- Workload analytics.
- Bed occupancy.
- Patient-flow reporting.
- Forecasting.
- Staff management.
- Audit logs.
- Protocol administration.

INFRASTRUCTURE:

- Supabase schema.
- Supabase RLS.
- Supabase Auth.
- Supabase Realtime.
- GitHub repository.
- CI pipeline.
- Vercel preview deployment.
- Production deployment.

## 2. Technical acceptance

Run:

- Formatter.
- Linter.
- TypeScript compiler.
- Unit tests.
- Integration tests.
- E2E tests.
- Production build.
- Database security checks.
- RLS tests.
- Dependency audit.

Do not suppress errors to achieve a green status.

## 3. Clinical-safety acceptance

Verify:

- Emergency actions never depend on a score.
- No automatic diagnosis is presented.
- No missing data is treated as normal.
- Clinical category overrides are auditable.
- Assessment-required cases remain visible to staff.
- The patient is never denied entry because of technology.
- No resource shortage downgrades priority.
- Unvalidated scoring is visibly labelled.
- Clinical deployment remains disabled until proper review.

## 4. User experience acceptance

Test the complete application on:

- Desktop.
- Tablet.
- Android-sized mobile screen.
- Low-resolution screen.
- Keyboard-only navigation.
- Screen-reader-oriented form controls.

Verify that all advertised buttons and actions work.

## 5. Final deliverables

Prepare:

1. Final GitHub repository.
2. Working Vercel deployment.
3. Confirmed Supabase database.
4. Database migration files.
5. Complete README.
6. Architecture document.
7. Database schema document.
8. API documentation.
9. Role permission matrix.
10. Clinical algorithm documentation.
11. Test plan and results.
12. Security audit.
13. Deployment instructions.
14. Demo credentials for synthetic data, only in the documented non-production demo environment.
15. A five-patient demonstration script.
16. A list of limitations and future development.

## 6. Final report

Produce a final table with these columns:

- Feature.
- Implementation status.
- Test status.
- Database integration status.
- Deployment status.
- Remaining limitation.

Use only verified results.

The final MediRoute application must be a complete integrated working prototype, not a presentation mockup.

Do not stop just because a preview deployment succeeds. Verify the features in the deployed application.

Finish by providing the actual repository URL, preview URL, production URL if deployed, and a concise explanation of any remaining external setup requirements.
