import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { bedRows, prepareBed, bedAction } from "./bed-helpers.mjs";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
const login = await db.auth.signInWithPassword({
  email: process.env.DEMO_NURSE_EMAIL,
  password: process.env.DEMO_NURSE_PASSWORD,
});
assert.equal(login.error, null);
const { data: members } = await db
  .from("hospital_memberships")
  .select("*")
  .eq("user_id", login.data.user.id);
const hospital = members[0].hospital_id;
const call = (action, data) =>
  db.rpc("staff_command", {
    p_hospital: hospital,
    p_action: action,
    p_data: data,
  });
let count = 0;
const pass = (s) => console.log(`BED PASS ${++count}: ${s}`);
const input = {
  warningSigns: [],
  symptoms: "Synthetic bed test",
  pain: null,
  worsening: null,
  verified: true,
  vitals: {
    pulse: null,
    spo2: null,
    respiratoryRate: null,
    systolic: null,
    temperature: null,
  },
};
async function patient() {
  const r = await call("intake", {
    operation_id: randomUUID(),
    name: `Synthetic bed ${randomUUID()}`,
    identity_confirmed: true,
    category: "YELLOW",
    reason: "Synthetic human review",
    input,
  });
  assert.equal(r.error, null);
  return r.data.id;
}
const ids = await Promise.all([patient(), patient(), patient()]);
const rows = await bedRows(db, hospital);
const beds = rows.resources.filter(
  (b) => b.kind === "Emergency bed" && b.status === "AVAILABLE",
);
assert.ok(beds.length >= 2, "Two free synthetic emergency beds required");
const b = beds[0],
  other = beds[1];
assert.ok(
  (
    await bedAction(db, hospital, "bed_assign", b.id, ids[0], {
      confirmed: true,
      reassign: false,
      hold: false,
    })
  ).error,
);
pass("Empty bed without reviewed requirements is rejected");
assert.equal(
  (await prepareBed(db, hospital, ids[0], b, ["isolation"])).error,
  null,
);
assert.equal(
  (
    await bedAction(db, hospital, "bed_assign", b.id, ids[0], {
      confirmed: true,
      reassign: false,
      hold: false,
    })
  ).error?.code,
  "PT428",
);
pass("Missing required isolation prevents allocation");
for (const id of ids)
  assert.equal(
    (await prepareBed(db, hospital, id, b, ["oxygen", "cardiac_monitor"]))
      .error,
    null,
  );
const wrong = rows.resources.find(
  (x) => x.kind === "General bed" && x.status === "AVAILABLE",
);
assert.ok(wrong);
assert.equal(
  (
    await bedAction(db, hospital, "bed_assign", wrong.id, ids[0], {
      confirmed: true,
      reassign: false,
      hold: false,
    })
  ).error?.code,
  "PT428",
);
pass("Wrong ward and bed type rejected despite availability");
const claims = await Promise.all(
  ids.slice(0, 2).map((id) =>
    bedAction(db, hospital, "bed_assign", b.id, id, {
      confirmed: true,
      reassign: false,
      hold: true,
    }),
  ),
);
assert.equal(claims.filter((x) => !x.error).length, 1);
const winner = ids[claims.findIndex((x) => !x.error)];
pass("Concurrent reservations have exactly one winner");
assert.ok(
  (
    await bedAction(db, hospital, "bed_assign", b.id, ids[2], {
      confirmed: true,
      reassign: false,
      hold: false,
    })
  ).error,
);
pass("Held bed cannot be double-booked");
const { data: current } = await db
  .from("hospital_resources")
  .select("*")
  .eq("id", b.id)
  .single();
const { data: e } = await db
  .from("patient_encounters")
  .select("*")
  .eq("id", winner)
  .single();
const { data: review } = await db
  .from("bed_placement_plans")
  .select("reviewed_at")
  .eq("encounter_id", winner)
  .single();
const { data: held } = await db
  .from("resource_reservations")
  .select("id")
  .eq("encounter_id", winner)
  .eq("is_bed", true)
  .is("released_at", null)
  .single();
const payload = {
  plan_reviewed_at: review.reviewed_at,
  expected_reservation_id: held.id,
  operation_id: randomUUID(),
  resource_id: b.id,
  bed_version: current.version,
  encounter_id: winner,
  version: e.version,
  confirmed: true,
  reassign: false,
  hold: false,
  reason: "Synthetic final bed confirmation",
};
const replay = await Promise.all([
  call("bed_assign", payload),
  call("bed_assign", payload),
]);
assert.ok(replay.every((x) => !x.error));
assert.deepEqual(replay[0].data, replay[1].data);
pass("Duplicate assignment returns identical receipt without duplicates");
assert.equal(
  (await call("bed_assign", { ...payload, reason: "Changed request rejected" }))
    .error?.code,
  "PT409",
);
pass("Changed idempotent replay is rejected");
const { data: freshBed } = await db
  .from("hospital_resources")
  .select("version")
  .eq("id", b.id)
  .single();
assert.equal(
  (
    await call("bed_assign", {
      ...payload,
      operation_id: randomUUID(),
      bed_version: freshBed.version,
      expected_reservation_id: "",
    })
  ).error?.code,
  "PT409",
);
pass("Stale current-allocation identity is rejected");
assert.equal(
  (
    await call("bed_assign", {
      ...payload,
      operation_id: randomUUID(),
      bed_version: freshBed.version,
      plan_reviewed_at: new Date(0).toISOString(),
    })
  ).error?.code,
  "PT409",
);
pass("Changed placement review requires fresh confirmation");
const { data: active } = await db
  .from("resource_reservations")
  .select("*")
  .eq("encounter_id", winner)
  .eq("is_bed", true)
  .is("released_at", null);
assert.equal(active.length, 1);
pass("One active bed per encounter");
assert.ok(
  (await call("reserve", { resource_id: other.id, encounter_id: winner }))
    .error,
);
pass("Legacy reservation cannot bypass bed suitability");
assert.equal(
  (
    await bedAction(db, hospital, "bed_assign", other.id, winner, {
      confirmed: true,
      reassign: true,
      hold: false,
    })
  ).error,
  null,
);
assert.equal(
  (await db.from("hospital_resources").select("status").eq("id", b.id).single())
    .data.status,
  "CLEANING",
);
pass("Atomic reassignment sends old bed for cleaning");
assert.ok(
  (
    await bedAction(db, hospital, "bed_status", b.id, null, {
      status: "AVAILABLE",
      checks_confirmed: false,
    })
  ).error,
);
pass("Cleaning cannot be skipped");
assert.equal(
  (
    await bedAction(db, hospital, "bed_status", b.id, null, {
      status: "AVAILABLE",
      checks_confirmed: true,
    })
  ).error,
  null,
);
assert.equal(
  (await bedAction(db, hospital, "bed_release", other.id, winner)).error,
  null,
);
assert.equal(
  (
    await db
      .from("hospital_resources")
      .select("status")
      .eq("id", other.id)
      .single()
  ).data.status,
  "CLEANING",
);
pass("Release persists cleaning state and reservation history");
assert.equal(
  (
    await bedAction(db, hospital, "bed_status", other.id, null, {
      status: "AVAILABLE",
      checks_confirmed: true,
    })
  ).error,
  null,
);
assert.ok(
  (
    await db
      .from("bed_profiles")
      .update({ verified: false })
      .eq("resource_id", b.id)
  ).error,
);
pass("Direct bed configuration writes denied");
assert.ok(
  (
    await db.rpc("staff_command", {
      p_hospital: randomUUID(),
      p_action: "bed_refresh",
      p_data: {},
    })
  ).error,
);
pass("Foreign hospital operations denied");
assert.ok(
  (
    await bedAction(db, hospital, "bed_status", b.id, null, {
      status: "MAINTENANCE",
      checks_confirmed: false,
    })
  ).error,
);
pass("Nursing role cannot change administrative maintenance controls");
const { data: events } = await db
  .from("bed_allocation_events")
  .select("*")
  .eq("encounter_id", winner);
assert.ok(
  events.some(
    (x) => x.action === "bed_assign" && x.actor === login.data.user.id,
  ),
);
assert.ok(events.some((x) => x.action === "released"));
pass("Attributable allocation and release events persisted");
const before = await db
  .from("patient_encounters")
  .select("version")
  .eq("id", ids[2])
  .single();
assert.equal(
  (
    await call("assess", {
      encounter_id: ids[2],
      version: before.data.version,
      category: "YELLOW",
      reason: "Synthetic reassessment",
      input,
    })
  ).error,
  null,
);
assert.equal(
  (
    await bedAction(db, hospital, "bed_assign", b.id, ids[2], {
      confirmed: true,
      reassign: false,
      hold: false,
    })
  ).error?.code,
  "PT428",
);
pass("Changed assessment invalidates previous placement review");
const noBed = await db
  .from("patient_encounters")
  .select("version")
  .eq("id", ids[2])
  .single();
assert.equal(
  (
    await call("bed_plan", {
      operation_id: randomUUID(),
      encounter_id: ids[2],
      version: noBed.data.version,
      decision: "AWAITING",
      ward_id: "",
      bed_kind: "",
      required_capabilities: [],
      reason: "Synthetic no compatible bed; coordinator required",
      reviewed: true,
    })
  ).error,
  null,
);
pass("Awaiting placement persists without reducing urgency");
console.log(
  `All ${count} bed assertions passed; synthetic history retained and beds returned to availability.`,
);
await db.auth.signOut({ scope: "local" });
