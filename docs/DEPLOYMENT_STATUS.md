# Deployment status

Verified 20 November 2026. This is a synthetic demonstration, not clinical production readiness. See READINESS_AUDIT.md for separate readiness assessments and outstanding master requirements.

| Item                     | Verified status                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub                   | https://github.com/Beezsy-del/MedAssess — main published; initial history preserved                                                                                                                                              |
| Application source       | e14343a83a835fad5960c85b764837036cace109                                                                                                                                                                                         |
| Supabase                 | MedAssess, kkfqxlwwcwhnmhmsqitx, Mumbai; six migrations applied; 28/28 public tables RLS; clinical_enabled false                                                                                                                 |
| Latest migration         | 20261120133422_audit_concurrency_and_token_hardening                                                                                                                                                                             |
| Vercel project           | medcipher-triage-platform / prj_b5W03SkZFPbvjjRhs5JVbupkQalN; team bloodflow                                                                                                                                                     |
| Preview                  | https://medcipher-triage-platform-fd5ptrczk-bloodflow.vercel.app — READY; dpl_22Vyxcq2pLR5BXew15h4Ga6tdmKd; eight browser scenarios passed in 56.1 seconds                                                                       |
| Production               | https://medcipher-triage-platform.vercel.app — READY; dpl_HEYpJneZHUafoWeerHH7KxdHtZPi                                                                                                                                           |
| Immutable production URL | https://medcipher-triage-platform-q50vijyun-bloodflow.vercel.app                                                                                                                                                                 |
| Environment variables    | Encrypted provider variables for preview/production; synthetic credentials server-only; public Supabase URL/publishable key; no service-role key used                                                                            |
| Separation               | Preview and production use the SAME synthetic Supabase project. This is not isolated production/staging data infrastructure                                                                                                      |
| Deployment method        | Authenticated source upload from committed tree, Node 24, Mumbai region                                                                                                                                                          |
| Git integration          | Vercel GitHub app not installed; deploy-on-push is not connected                                                                                                                                                                 |
| CI verification          | Source verify jobs passed for 1a1f8f5 and e14343a (format/lint/types/tests/build/dependency audit)                                                                                                                               |
| CI integration           | Now configured: six secrets in synthetic-demo environment, main-only branch policy, synthetic hosted browser target. Runs started before promotion detected old production failures; final post-promotion results appended below |

Preview protection remains enabled. A temporary automation bypass was used only for preview acceptance. Production acceptance uses the public canonical host without a bypass. No real patient data, destructive reset or force push was used.

Supabase password-recovery delivery, leaked-password protection, provider log redaction, operational backup/restore evidence and independent security review remain unresolved. GitHub integration CI tests the configured hosted target: deploying new code is a separate step, so pre-deployment test failures must not be treated as evidence that a newer release is deployed.

## Final hosted acceptance

Production dpl_HEYpJneZHUafoWeerHH7KxdHtZPi passed all eight browser scenarios in 53.8 seconds, including forced snapshot response reordering, failed auth/snapshot responses and encrypted offline retention/retry. Public login returned HTTP 200 (0.43 seconds in the availability probe). Error/fatal runtime-log count query returned no entries in the verification window. The preview automation bypass was revoked and its ignored local credential file removed.

Post-promotion GitHub integration verification is recorded in [run 44748224481](https://github.com/Beezsy-del/MedAssess/actions/runs/44748224481); consult the job results for the authoritative status. The latest documentation commits contain audit evidence/tests only; application source remains e14343a. The verify job includes formatting, lint, strict types, 55 unit tests, production build and dependency audit; integration runs 33 hosted assertions plus eight browser scenarios.
