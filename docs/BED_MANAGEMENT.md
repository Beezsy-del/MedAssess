# Visual bed management — 21 November 2026

## Workflow and boundaries

Successful nursing intake automatically opens the bed allocation workspace inside the same registration page. The registration and assessment are already committed; a placement error never rolls them back or creates a second encounter. The receipt remains below the map. The encounter page links back to its placement workspace. Staff can review/correct the saved assessment through the existing history-preserving assessment workflow.

The map uses actual hospital_resources, resource_reservations and new bed_profiles/bed_wards records. Care levels are physical sections, with persisted ward/row/column coordinates. Filters hide nonmatching tiles without moving the remaining beds. No patient names appear on the main grid. Authorized users can inspect occupant details and open the encounter.

A nurse/triage nurse/doctor explicitly reviews the destination, required ward/care level, bed type, monitoring, equipment and isolation needs. Nothing is inferred from absent observations. Unknown needs can be recorded as awaiting placement. No-bed-required and another-destination decisions are persisted too. Awaiting placement notifies the resource/emergency coordination roles without changing triage urgency. A referral destination note is not a completed referral; the existing referral lifecycle remains separate.

Recommendations require a current reviewed BED_REQUIRED plan, a verified configuration, an accepted existing RED/YELLOW/GREEN category, exact required ward and bed type, every requested capability, and AVAILABLE status. No bed is assigned automatically. Final confirmation requires staff to verify patient, ward, equipment and suitability. This checks software constraints, **not clinical validity**. Hospital protocols, ward acceptance rules, staffing and equipment inventories require qualified review before any operational use. Clinical operations remain disabled.

## Interface design

The map extends the existing BloodFlow-inspired system: raspberry actions (#920942), navy text (#172033), slate canvas (#f5f7fb), white ward surfaces, and existing system typography. Green/red/amber/blue/grey identify availability states with icons and text; zone boundaries identify care levels separately. Consistent bed-shaped tiles and stable coordinates convey physical location. The map occupies the main column; patient requirements and selected-bed controls occupy the side column. Saved requirements collapse to keep actions close. Tablet/mobile retain the map's geometry inside a horizontally scrollable ward rather than compressing beds into unreadable controls.

## Database and API

- Extend resources with BLOCKED status and optimistic version numbers; reservations with hold_until and server-derived is_bed.
- bed_wards: hospital/department, care zone, accepted triage categories, ordering.
- bed_profiles: existing resource identity, ward and row/column, verified capabilities and restrictions.
- bed_placement_plans: encounter-specific reviewed decision, actor/time, required capabilities and encounter version.
- bed_allocation_events: append-only client access, actor-attributed assignments, releases, plans and configuration history. Existing resource_status_history and audit_logs are retained.
- private.bed_operations: actor-bound operation receipts for idempotent retries; no client access.
- New commands: bed_plan, bed_assign, bed_release, bed_status, bed_ward, bed_configure and bed_refresh. The existing authenticated, origin-checked, bounded, validated command endpoint is reused.
- All new public tables have tenant/role RLS and SELECT-only client grants. Database commands independently check active membership and permissions. Configuration is restricted to administrators/resource managers; clinical review to nurses/doctors; allocation to clinical and coordination/resource roles. Administrators do not make clinical placement decisions merely because they can configure wards.
- Hospital advisory locking provides a consistent order across bed and existing clinical commands; resource versions and encounter versions reject stale state. Confirmations also bind the exact placement review timestamp and current reservation identity; the UI invalidates its confirmation when those records change. Unique indexes enforce one active reservation per resource and one active bed per encounter. Bed identifiers are unique within the hospital.
- Legacy generic reserve/release/maintenance commands reject beds, closing the empty-bed suitability bypass. They continue to handle stretchers and other resources.
- Reassignment commits target assignment and old-bed release atomically. Old beds enter CLEANING. Occupied beds cannot be held for another patient. Holds expire after ten minutes; expiration is reconciled on authorized snapshot refresh (including the 30-second fallback), not a standalone scheduler.
- Discharge/transfer reuse existing transactional release behavior and now append bed history. Admission additionally requires a current compatible reviewed allocation, including unexpired holds. Cleaning and safety confirmation is required before AVAILABLE; maintenance/blocked clearance requires a resource/administrator role and passes through turnover checks.
- Supabase realtime resources/plans/profiles/wards refresh the existing snapshot; reconnection refresh and periodic fallback remain enabled. Realtime bursts are coalesced to one in-flight refresh and one trailing refresh; a foreground command owns its acknowledgement refresh so background events cannot indefinitely extend its completion. The server rechecks state even if realtime is delayed or disconnected. Offline allocation is disabled; saved registration remains available after reconnect.

## Synthetic configuration and limitations

Existing synthetic beds were assigned physical positions in critical care, high-acuity and treatment/observation wards. Existing occupancy was not fabricated or reset. Initial capabilities and category acceptance are explicitly synthetic demonstration configurations, not approved protocols. Administrators can add physical wards and beds, configure existing free beds, and move them between wards; this is a logical ward map, not a measured building floor plan.

The model supports oxygen, cardiac monitoring, ventilation, isolation, negative pressure and accessible beds as explicit capabilities. It does not verify live device telemetry, equipment maintenance certification, staffing ratios, infection-control cohorting, age/sex specialty restrictions or external-hospital capacity. Staff must review unsupported needs outside the software. Restriction text is shown for final review, not interpreted as automated rules. A missing capability cannot be overridden by a nurse selecting an empty bed.

History views show the latest 300 bed events in the hospital snapshot. Existing queue/snapshot limits remain. Plans require re-review after any encounter version change, which is conservative and may ask for review after nonclinical workflow changes. A hold expiry returns an unused reserved bed to AVAILABLE; an occupied/released bed always needs cleaning. No cross-device offline coordination is claimed.

Security advisors retain the existing gated-RPC warnings and disabled leaked-password protection. Private receipt tables deliberately have no client policies. See [password-protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) and the existing readiness audit. Short release checks do not establish production or clinical readiness.

## Verification

Eight bed unit cases plus three realtime scheduling cases cover missing requirements, incorrect ward/type, absent equipment, stale assessments, unverified inventory and explicit API confirmation. Twenty hosted database assertions passed, including concurrency, idempotency, reservations, reassignment, cleaning, role denial and awaiting placement. The eight-role/two-tenant rollback fixture passed, including hold expiry and discharge cleanup. The existing 33 database regression assertions passed after moving bed admission tests onto the reviewed allocation path. Browser, build and hosted release evidence will be recorded after completion.
