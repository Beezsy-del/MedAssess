# Five-patient demonstration

Open http://localhost:3000 and select a demo staff role. No real patient details should be entered. Account passwords are kept in ignored local environment configuration; the role buttons perform real Supabase sign-in.

1. **Routine visit:** Doctor → Reception → create a synthetic patient → scan/open the pass → submit symptoms. Assess the encounter, explicitly verify and confirm GREEN with reasoning. Move through WAITING, STAFF_ASSIGNED, ASSESSMENT, TREATMENT, DISPOSITION and DISCHARGED. Confirm timeline and care note.
2. **Urgent assessment:** Triage nurse → open Meera S. → record observations and a YELLOW reassessment. Doctor opens alerts, acknowledges and records response in progress. Resolve only after documented response.
3. **Emergency without registration delay:** Open `/emergency` to show direct-help instructions. Reception can create an unidentified emergency encounter. On a token intake page, request immediate assistance before completing any form. Confirm RED and an emergency alert.
4. **Deterioration:** Reassess an existing waiting synthetic encounter with worsening symptoms and explicit clinical reasoning. Confirm the review flag and historical assessment record. Category changes require staff action.
5. **Rural/offline capture:** With Reception open, disconnect using browser developer tools. Register a synthetic patient. Show the IndexedDB draft count. Reconnect; confirm synchronization and one persisted encounter. A full offline reload shows a non-sensitive fallback, not a live hospital dashboard.

Additional operations: reserve a bed and attempt a competing reservation; only one may succeed. Admit only after bed allocation. Create a referral from a doctor encounter and record each receiving-facility/transport stage. The directory explicitly states external capacity is unverified.

Administrator: configure operational intervals, add a department/resource/destination, schedule shifts, view audit events and export aggregate CSV. Forecasting intentionally shows “More history needed” until enough complete days exist.

Cleanup: run `node --env-file=.env.local scripts/archive-demo-tests.mjs`. It archives active encounters whose names start `Synthetic `, retains events and audit records, and leaves the original five seeded scenarios intact. It never resets a database.
