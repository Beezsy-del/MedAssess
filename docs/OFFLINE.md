# Offline behavior

The installable shell has a manifest and a service worker. Only `/offline.html` and the non-sensitive icon are cached. Staff HTML, patient API responses, token responses and medical records are not cached by the service worker.

An already-open authorized Reception screen can store registration payloads in IndexedDB. Every item includes its hospital, originating staff user, UUID operation ID, attempt count and last failure. Reconnection or “Sync now” submits only the current staff user's items for the current hospital. The database's unique operation key prevents duplicate encounters. Confirmed items are removed locally; failed items remain for retry. Logout clears the device outbox. Manual deletion is confirmed in the UI.

After a complete page refresh without connectivity, the public offline shell is shown. Existing IndexedDB drafts remain, but new staff registration is disabled there because the shell cannot verify staff identity. Reconnect, sign in and synchronize. Offline capture after a full offline refresh, encrypted local PHI, automatic expiry/retention, background sync, and an on-premises LAN gateway are not implemented.

No disconnected multi-device communication is claimed. Offline drafts are not hospital records until synchronization succeeds. Emergency communication always falls back to direct staff contact.
