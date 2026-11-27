import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw new Error("Local synthetic load only");
const fixture = JSON.parse(readFileSync(".demo-local-fixture.json", "utf8"));
const db = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
assert.equal(
  (await db.auth.signInWithPassword(fixture.credentials.NURSE)).error,
  null,
);
const durations = [];
const created = await Promise.all(
  Array.from({ length: 20 }, async (_, i) => {
    const start = performance.now();
    const r = await db.rpc("staff_command", {
      p_hospital: fixture.hospital,
      p_action: "register",
      p_data: {
        operation_id: randomUUID(),
        name: `Synthetic concurrent local ${Date.now()} ${i}`,
      },
    });
    assert.equal(r.error, null);
    durations.push(performance.now() - start);
    return r.data;
  }),
);
assert.equal(new Set(created.map((r) => r.id)).size, 20);
const anon = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
const emergencies = await Promise.all(
  created.map((r) =>
    anon.rpc("patient_portal", { p_token: r.token, p_action: "emergency" }),
  ),
);
for (const r of emergencies) assert.equal(r.error, null);
const duplicate = created[0];
const retries = await Promise.all(
  Array.from({ length: 10 }, () =>
    anon.rpc("patient_portal", {
      p_token: duplicate.token,
      p_action: "emergency",
    }),
  ),
);
for (const r of retries) assert.equal(r.error, null);
const requests = await db
  .from("resource_requests")
  .select("id")
  .eq("encounter_id", duplicate.id);
assert.equal(requests.data.length, 1);
const start = performance.now();
const snapshot = await db.rpc("workspace_snapshot", {
  p_hospital: fixture.hospital,
});
assert.equal(snapshot.error, null);
const snapshotMs = performance.now() - start;
for (const item of created)
  assert.ok(
    snapshot.data.encounters.some(
      (e) => e.id === item.id && e.category === "RED",
    ),
  );
durations.sort((a, b) => a - b);
console.log(
  JSON.stringify({
    syntheticRegistrations: 20,
    simultaneousEmergencies: 20,
    duplicateEmergencyRetries: 10,
    registrationP50Ms: Math.round(durations[9]),
    registrationP95Ms: Math.round(durations[18]),
    snapshotMs: Math.round(snapshotMs),
    assertions: "passed",
    scope: "isolated local stack; not a production load certification",
  }),
);
await db.auth.signOut();
