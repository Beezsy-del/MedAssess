# Verification results

Run date: 20 November 2026 (Asia/Kolkata). All records used are synthetic.

| Check                                      | Result                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Strict TypeScript                          | Passed in final verification                                                                      |
| ESLint                                     | Passed with zero errors and zero warnings                                                         |
| Production build                           | Passed with Next.js 16.4.6                                                                        |
| Domain tests                               | 33 passed                                                                                         |
| Hosted integration                         | 27 assertions passed against kkfqxlwwcwhnmhmsqitx                                                 |
| RLS transaction suite                      | 9 isolation/permission assertions passed; fixtures rolled back                                    |
| Browser routine workflow                   | Registration → QR → human assessment → discharge passed                                           |
| Browser patient emergency/intake           | Passed after correcting ambiguous SQL variable                                                    |
| Browser offline capture/reconnect          | Passed                                                                                            |
| Dashboard axe serious/critical checks      | Passed after color-contrast corrections                                                           |
| Responsive page overflow                   | Passed at 768, 390 and 320 pixels after fixing scroll-container positioning                       |
| Anonymous-route/browser emergency guidance | Passed                                                                                            |
| Dependency audit                           | Zero vulnerabilities                                                                              |
| Supabase migrations                        | Four applied successfully                                                                         |
| Supabase security advisor                  | Privileged-gateway warnings and disabled leaked-password protection remain; see SECURITY_AUDIT.md |
| GitHub Actions                             | Not run: repository creation/authentication blocked                                               |
| Hosted frontend acceptance                 | Not run: Vercel team authorization blocked                                                        |
| Clinical validation                        | Not performed; clinical operation disabled                                                        |

Browser screenshots are in `output/playwright/`. Hosted tests retain synthetic audit records. The archive command can remove active test cases from queues without deleting histories.

## Bugs found and fixed

- Patient intake SQL had an ambiguous `emergency` variable; corrected in a follow-up migration.
- Application optimistic-concurrency conflicts initially used a transaction serialization error; replaced with explicit PostgREST HTTP 409 signaling.
- Low-contrast microcopy and a screen-reader-only table label caused contrast/overflow failures; corrected styles and scroll-container positioning.
- The generated Tailwind Turbopack loader served stale styles during development; switched to the documented PostCSS plugin.
- Admission initially reserved a bed without changing occupancy; added transactional occupancy trigger.
- The demo archive authorization check needed an explicit NULL-membership rejection; corrected before final acceptance and tested for unauthorized clinical roles.

Final verification: formatting, lint, typecheck, all 33 domain tests and production build passed. The full five-scenario Playwright run passed in 27.3 seconds. The latest RLS suite passed after all four migrations; 20/20 public tables have RLS. Hosted integration passed 27 assertions. Dependency audit found zero vulnerabilities. No feature is considered clinically validated by these tests.
