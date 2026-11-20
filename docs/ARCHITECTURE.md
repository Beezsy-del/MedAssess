# Architecture and design

Next.js App Router provides public patient routes and server-authorized staff routes. Supabase Auth cookies identify users; protected hospital memberships determine roles. PostgreSQL is the source of truth. Domain modules implement triage, queue ordering, workflow validation and aggregate forecasting. Database commands enforce tenant ownership and transaction boundaries; append-only events preserve decisions.

Public encounter access uses scoped random tokens, persisted only as hashes. No public table reads. Realtime subscriptions use authenticated RLS and a refresh fallback. IndexedDB stores explicitly captured local drafts/outbox items; successful sync removes local payloads. The service worker caches only the non-sensitive offline shell.

## Visual plan

Palette: burgundy #651D38, ink #252634, gold #A38143, canvas #F5F6F8, white #FFFFFF, muted #646979. Clinical green/yellow/red are reserved for urgency and emergency feedback. Typography uses a system humanist sans stack with compact, clear operational tables. Left-aligned hospital navigation, a wide work area, and a contextual right rail keep urgent work visible. The distinctive element is an encounter flow strip with explicit stage counts; decoration is restrained. Patient screens are a single readable column with large controls.

```
Hospital navigation | context / search / staff
                    | title + primary action
                    | live census strip
                    | prioritized patient table | attention / capacity
```

Review against brief: avoided decorative triage colors, gradients and oversized marketing metrics. Counts derive from records and the synthetic environment is always labelled.
