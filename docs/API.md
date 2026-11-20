# HTTP and database API

All application responses containing patient or staff data use `Cache-Control: no-store`. Mutating routes reject mismatched browser origins. Server-side sessions use `@supabase/ssr` and `auth.getUser()`; roles are loaded from protected memberships.

| Endpoint                        | Access                          | Behavior                                                                                                     |
| ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| POST /api/auth                  | Public / authenticated          | Password login, demo login when explicitly enabled, recovery email request, logout                           |
| GET /api/snapshot?hospital=UUID | Hospital member                 | RLS-filtered dashboard snapshot; maximum 500 recent encounters; safe refresh fallback                        |
| POST /api/command               | Hospital member, operation role | `{hospital, action, data}` validated then delegated to `staff_command`                                       |
| POST /api/patient               | Valid scoped capability         | `{token, action: status/intake/emergency, data}`; does not reveal name, clinical history or other encounters |
| GET /auth/callback              | Valid Supabase code             | Exchanges PKCE code and redirects to account settings                                                        |

Staff command operations: register, token, assess, transition, note, reserve, release, alert, referral, referral_status, settings, department, resource, facility, shift.

Registration requires a UUID operation ID. The same hospital + operation ID returns the original encounter. Assessment and transition requests can include a record version; stale versions receive HTTP 409. Database role enforcement applies even when callers bypass the HTTP routes and call RPCs directly.

Tokens are generated with 32 random bytes and only their SHA-256 digest is stored. The 24-hour token can access status, submit intake once, or request emergency assistance. Repeated emergency requests do not create duplicate alerts. Rotation revokes all existing encounter tokens. Terminal discharge/transfer/cancellation revokes patient tokens. Errors do not echo raw tokens.

Database RPCs also include `escalate_alerts` (authenticated hospital member; overdue in-app alerts), and `archive_demo_tests` (demo-hospital administrator only; archives named synthetic test encounters without deleting data).

Known API limits: generic command payload validation is supplemented by SQL checks rather than exhaustive per-operation Zod schemas; token rate limiting is per capability rather than globally distributed per IP; dashboard pagination is capped, not a full cursor API. These must be strengthened before real-world deployment.
