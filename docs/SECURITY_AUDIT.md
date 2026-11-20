# Security audit — prototype assessment

This is an engineering self-review, not an independent security certification.

## Verified controls

- Every public application table has RLS. Anonymous roles have no patient-table grants.
- Staff roles come from protected hospital memberships. User metadata is not used for authority.
- Authenticated sessions are verified server-side. Database commands independently check identity, hospital membership and operation-specific role.
- Composite tenant foreign keys prevent cross-hospital patient, encounter, department, resource and destination references.
- Normal clients cannot directly insert/update/delete application tables, read token hashes or elevate their memberships.
- Encounter tokens contain 256 bits of random entropy, are hashed at rest, expire after 24 hours, support revocation, and expose only scoped status/intake/emergency operations.
- Resource reservation uses row locks and a unique partial index. Concurrent allocation test has exactly one winner.
- Assessment version conflicts fail with HTTP 409. Original and confirmed categories remain in immutable history.
- Non-clinical roles cannot read clinical assessment/vital/treatment tables. Doctor cannot browse administrator audit records.
- API responses are uncached. Service worker caches only a public offline page and icon.
- No service-role credential is required or exposed. Local credentials and seed payloads are gitignored.
- Origin checks protect mutating application endpoints. Native Supabase Auth also applies provider-side controls.
- Database clinical-use flag is constrained false; workflow commands require explicitly synthetic hospitals.

## Advisor findings that remain intentional

Supabase reports authenticated/anonymous SECURITY DEFINER gateways. `staff_command` is intentionally authenticated and enforces trusted membership + operation role internally; `patient_portal` is intentionally anonymous but requires a high-entropy scoped capability. `escalate_alerts` and `archive_demo_tests` independently enforce membership/administrator constraints. All use empty search paths and explicit grants. Token and rate-limit tables use explicit deny policies.

The final advisor also reports **leaked-password protection disabled** in Supabase Auth. No authenticated configuration tool is available to change that setting in this session. Enable and verify it in the project Auth settings before deployment: [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

These warnings are not hidden or described as a clean advisor result. Before deployment, review the gateway code independently. [Supabase security-definer guidance](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) explains the risk.

## Remaining work

- Assigned-patient and department-level data minimization; members currently read broad hospital encounter summaries.
- Independent review of all privileged functions; full malformed-input fuzzing and exhaustive operation-specific validation.
- Distributed IP rate limiting; current public-token rate limiting is per valid-format capability bucket.
- Retention/encryption of local drafts; shared-device policy and secure automatic expiry.
- Provider-side URL log redaction for bearer-token paths. Local request logging is disabled; hosted logging has not been configured.
- Staff invitation lifecycle, credential rotation, session-revocation policy and recovery email verification.
- Strict content security policy tuned to the eventual deployment; current headers include nosniff, frame denial, no-referrer and permissions restrictions.
- No real PHI/privacy/legal assessment or production security acceptance has been completed.

Dependency audit currently reports zero vulnerabilities. See TEST_RESULTS.md for final verification and any subsequent changes.
