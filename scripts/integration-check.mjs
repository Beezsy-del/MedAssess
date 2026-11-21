import { prepareBed, bedAction } from "./bed-helpers.mjs";
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const doctor = createClient(url, key, { auth: { persistSession: false } }),
  nurse = createClient(url, key, { auth: { persistSession: false } }),
  anon = createClient(url, key, { auth: { persistSession: false } });
for (const [client, role] of [
  [doctor, "DOCTOR"],
  [nurse, "NURSE"],
]) {
  const { error } = await client.auth.signInWithPassword({
    email: process.env[`DEMO_${role}_EMAIL`],
    password: process.env[`DEMO_${role}_PASSWORD`],
  });
  assert.equal(error, null, `Sign in ${role}`);
}
const { data: memberships, error: membershipError } = await doctor
  .from("hospital_memberships")
  .select("*");
assert.equal(membershipError, null);
const hospital = memberships[0].hospital_id;
async function command(action, data, client = doctor) {
  return client.rpc("staff_command", {
    p_hospital: hospital,
    p_action: action,
    p_data: data,
  });
}
let count = 0;
const pass = (s) => {
  console.log(`PASS ${++count}: ${s}`);
};
const publicRead = await anon.from("patients").select("*");
assert.ok(publicRead.error);
pass("Anonymous patient reads denied");
const tokens = await doctor.from("encounter_access_tokens").select("*");
assert.ok(tokens.error);
pass("Staff cannot read token hashes");
const directWrite = await doctor
  .from("patients")
  .insert({ hospital_id: hospital, name: "Forbidden direct write" });
assert.ok(directWrite.error);
pass("Direct table writes denied");
const foreign = await doctor.rpc("staff_command", {
  p_hospital: randomUUID(),
  p_action: "register",
  p_data: {},
});
assert.ok(foreign.error);
pass("Unrelated hospital command denied");
const operation = randomUUID();
const { data: created, error } = await command("register", {
  operation_id: operation,
  name: "Synthetic integration test",
  age: 42,
  symptoms: "Software test registration",
});
assert.equal(error, null);
assert.ok(created.id);
assert.equal(created.token.length, 64);
pass("Registration and scoped token persisted");
const duplicate = await command("register", {
  operation_id: operation,
  name: "Must not duplicate",
});
assert.equal(duplicate.error, null);
assert.equal(duplicate.data.id, created.id);
assert.equal(duplicate.data.duplicate, true);
pass("Idempotent offline operation returns original encounter");
const invalid = await command("transition", {
  encounter_id: created.id,
  status: "DISCHARGED",
  reason: "Invalid jump test",
});
assert.ok(invalid.error);
pass("Invalid flow jump denied");
const publicStatus = await anon.rpc("patient_portal", {
  p_token: created.token,
  p_action: "status",
});
assert.equal(publicStatus.error, null);
assert.equal(publicStatus.data.reference, created.reference);
assert.equal(publicStatus.data.name, undefined);
pass("Public token status exposes only scoped non-clinical fields");
const emergency = await anon.rpc("patient_portal", {
  p_token: created.token,
  p_action: "emergency",
});
assert.equal(emergency.error, null);
const { data: emergencyEncounter } = await doctor
  .from("patient_encounters")
  .select("*")
  .eq("id", created.id)
  .single();
assert.equal(emergencyEncounter.category, "RED");
pass("Patient emergency bypasses intake");
const input = {
  warningSigns: [],
  symptoms: "Synthetic review",
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
const downgrade = await command(
  "assess",
  {
    encounter_id: created.id,
    category: "GREEN",
    reason: "Synthetic downgrade denied",
    input,
  },
  nurse,
);
assert.ok(downgrade.error);
pass("Nurse cannot downgrade active emergency");
const assessed = await command("assess", {
  encounter_id: created.id,
  category: "RED",
  reason: "Synthetic emergency assessment confirmed",
  input,
});
assert.equal(assessed.error, null);
pass("Clinical decision retained in assessment history");
const stale = await command("assess", {
  encounter_id: created.id,
  version: 1,
  category: "RED",
  reason: "Stale overwrite must fail",
  input,
});
assert.equal(stale.error?.code, "PT409");
pass("Stale record version fails with conflict");
const second = await command("register", {
  operation_id: randomUUID(),
  name: "Synthetic concurrent allocation",
  symptoms: "Test only",
});
assert.equal(second.error, null);
const { data: resources } = await doctor
  .from("hospital_resources")
  .select("*")
  .eq("status", "AVAILABLE");
assert.ok(resources.length);
const resource = resources.find((r) => !r.kind.endsWith("bed"));
assert.ok(resource);
const concurrent = await Promise.all([
  command("reserve", { resource_id: resource.id, encounter_id: created.id }),
  command(
    "reserve",
    { resource_id: resource.id, encounter_id: second.data.id },
    nurse,
  ),
]);
assert.equal(concurrent.filter((r) => !r.error).length, 1);
pass("Concurrent resource allocation has exactly one winner");
await command("release", { resource_id: resource.id });
await command("release", { resource_id: resource.id });
const before = await doctor
  .from("patient_encounters")
  .select("category")
  .eq("id", created.id)
  .single();
assert.equal(before.data.category, "RED");
pass("Resource state never downgrades priority");
const rotated = await command("token", { encounter_id: created.id });
assert.equal(rotated.error, null);
const revoked = await anon.rpc("patient_portal", {
  p_token: created.token,
  p_action: "status",
});
assert.ok(revoked.data.error);
pass("Rotated token revokes previous access");
const audit = await doctor.from("audit_logs").select("*");
assert.equal(audit.data.length, 0);
pass("Clinical role cannot browse administrator audit trail");
const { data: assessments } = await doctor
  .from("triage_assessments")
  .select("*")
  .eq("encounter_id", created.id);
assert.ok(assessments.length);
assert.equal(assessments[0].confirmed_category, "RED");
pass("Original recommendation and final category preserved");

const completeInput = {
  ...input,
  pain: 2.5,
  worsening: false,
  vitals: {
    pulse: 80,
    spo2: 98,
    respiratoryRate: 18,
    systolic: 120,
    temperature: 37,
  },
};
const secondId = second.data.id;
assert.equal(
  (
    await command("assess", {
      encounter_id: secondId,
      category: "GREEN",
      reason: "Synthetic complete assessment",
      input: completeInput,
    })
  ).error,
  null,
);
const scored = await doctor
  .from("triage_assessments")
  .select("result")
  .eq("encounter_id", secondId)
  .single();
assert.equal(scored.data.result.score, 3.75);
assert.equal(scored.data.result.breakdown.length, 3);
pass("Decimal demonstration score and breakdown persist reproducibly");
const doctorUser = (await doctor.auth.getUser()).data.user.id;
for (const status of [
  "WAITING",
  "STAFF_ASSIGNED",
  "ASSESSMENT",
  "DISPOSITION",
]) {
  const moved = await command("transition", {
    encounter_id: secondId,
    status,
    assigned_to: doctorUser,
    reason: "Synthetic workflow handover",
  });
  assert.equal(moved.error, null);
}
const noBed = await command("transition", {
  encounter_id: secondId,
  status: "ADMITTED",
  reason: "Must require reserved bed",
});
assert.ok(noBed.error);
pass("Admission without a reserved bed is denied");
const nurseDischarge = await command(
  "transition",
  {
    encounter_id: secondId,
    status: "DISCHARGED",
    reason: "Nurse must not approve disposition",
  },
  nurse,
);
assert.ok(nurseDischarge.error);
pass("Discharge requires doctor approval");
const bed = resources.find((r) => r.kind === "General bed");
assert.ok(bed);
assert.equal((await prepareBed(doctor, hospital, secondId, bed)).error, null);
assert.equal(
  (
    await bedAction(doctor, hospital, "bed_assign", bed.id, secondId, {
      confirmed: true,
      reassign: false,
      hold: true,
    })
  ).error,
  null,
);
assert.equal(
  (
    await command("transition", {
      encounter_id: secondId,
      status: "ADMITTED",
      reason: "Synthetic ward admission with responsible doctor",
    })
  ).error,
  null,
);
const occupancy = await doctor
  .from("hospital_resources")
  .select("status")
  .eq("id", bed.id)
  .single();
assert.equal(occupancy.data.status, "OCCUPIED");
pass("Admission changes the reserved bed to occupied");
const closed = await command("note", {
  encounter_id: secondId,
  kind: "Treatment",
  note: "Closed encounter cannot change",
});
assert.ok(closed.error);
pass("Closed encounters reject further mutation");
assert.equal(
  (await bedAction(doctor, hospital, "bed_release", bed.id, secondId)).error,
  null,
);
assert.equal(
  (
    await bedAction(doctor, hospital, "bed_status", bed.id, null, {
      status: "AVAILABLE",
      checks_confirmed: true,
    })
  ).error,
  null,
);
const settingsDenied = await command("settings", {
  reassessment_minutes: 15,
  alert_minutes: 5,
});
assert.ok(settingsDenied.error);
pass("Doctor cannot edit administrator configuration");
const { data: facilities } = await doctor
  .from("referral_facilities")
  .select("*");
assert.ok(facilities.length);
assert.equal(
  (
    await command("referral", {
      encounter_id: created.id,
      facility_id: facilities[0].id,
      reason: "Synthetic transfer pathway review",
      summary: "Synthetic clinical handover; external capacity unverified",
      transport: "Ambulance required",
    })
  ).error,
  null,
);
const { data: ref } = await doctor
  .from("referrals")
  .select("*")
  .eq("encounter_id", created.id)
  .single();
const jump = await command("referral_status", {
  id: ref.id,
  encounter_id: created.id,
  status: "COMPLETED",
  reason: "Invalid jump must fail",
});
assert.ok(jump.error);
pass("Referral cannot skip receiving-team acknowledgement");
for (const status of [
  "CONTACTED",
  "ACCEPTED",
  "DEPARTED",
  "ARRIVED",
  "COMPLETED",
])
  assert.equal(
    (
      await command("referral_status", {
        id: ref.id,
        encounter_id: created.id,
        status,
        reason: "Synthetic receiving-team and transport evidence recorded",
      })
    ).error,
    null,
  );
pass("Referral lifecycle records contact through completion");
const { data: alerts } = await doctor
  .from("notifications")
  .select("*")
  .eq("encounter_id", created.id)
  .in("status", ["CREATED", "ESCALATED"]);
assert.ok(alerts.length);
const alert = alerts[0];
for (const status of ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"])
  assert.equal(
    (
      await command("alert", {
        id: alert.id,
        status,
        reason: "Synthetic response complete",
      })
    ).error,
    null,
  );
const { data: ack } = await doctor
  .from("notifications")
  .select("*")
  .eq("id", alert.id)
  .single();
assert.ok(ack.acknowledged_at && ack.resolved_at);
pass("Alert acknowledgement and resolution have timestamps");
const deniedArchive = await doctor.rpc("archive_demo_tests", {
  p_hospital: hospital,
});
assert.ok(deniedArchive.error);
pass("Clinical role cannot run administrator demo reset");

assert.equal(
  (
    await command(
      "reassessment",
      {
        encounter_id: created.id,
        reason: "Synthetic deterioration requires clinical reassessment",
      },
      nurse,
    )
  ).error,
  null,
);
const pending = await doctor
  .from("reassessment_records")
  .select("*")
  .eq("encounter_id", created.id)
  .is("resolved_at", null);
assert.equal(pending.data.length, 1);
assert.equal(
  (
    await command(
      "reassessment",
      { encounter_id: created.id, reason: "Repeated deterioration report" },
      nurse,
    )
  ).error,
  null,
);
assert.equal(
  (
    await doctor
      .from("reassessment_records")
      .select("*")
      .eq("encounter_id", created.id)
      .is("resolved_at", null)
  ).data.length,
  1,
);
assert.equal(
  (
    await doctor
      .from("patient_encounters")
      .select("category")
      .eq("id", created.id)
      .single()
  ).data.category,
  "RED",
);
pass("Deterioration creates one open task without changing urgency");
assert.equal(
  (
    await command("assess", {
      encounter_id: created.id,
      category: "RED",
      reason: "Synthetic reassessment completed",
      input,
    })
  ).error,
  null,
);
assert.equal(
  (
    await doctor
      .from("reassessment_records")
      .select("*")
      .eq("encounter_id", created.id)
      .is("resolved_at", null)
  ).data.length,
  0,
);
pass("Clinical reassessment resolves the task with preserved history");
assert.equal(
  (
    await command(
      "shortage",
      {
        encounter_id: created.id,
        kind: "Emergency bed",
        reason: "Synthetic no suitable bed; coordinator reviewing transfer",
      },
      nurse,
    )
  ).error,
  null,
);
assert.equal(
  (
    await doctor
      .from("resource_shortages")
      .select("*")
      .eq("encounter_id", created.id)
  ).data.length,
  1,
);
assert.equal(
  (
    await doctor
      .from("patient_encounters")
      .select("category")
      .eq("id", created.id)
      .single()
  ).data.category,
  "RED",
);
pass("Resource shortage persists without downgrading RED");
assert.equal(
  (
    await command("follow_up", {
      encounter_id: secondId,
      due_at: new Date(Date.now() + 86400000).toISOString(),
      reason: "Synthetic follow-up appointment and instructions",
    })
  ).error,
  null,
);
assert.ok(
  (
    await command(
      "follow_up",
      {
        encounter_id: secondId,
        due_at: new Date(Date.now() + 86400000).toISOString(),
        reason: "Nurse cannot authorize follow-up",
      },
      nurse,
    )
  ).error,
);
assert.equal(
  (
    await doctor
      .from("follow_up_records")
      .select("*")
      .eq("encounter_id", secondId)
  ).data.length,
  1,
);
pass("Follow-up persists on closed encounter and requires doctor");
assert.equal(
  (await doctor.from("admissions").select("*").eq("encounter_id", secondId))
    .data.length,
  1,
);
assert.ok(
  (
    await doctor
      .from("resource_status_history")
      .select("*")
      .eq("resource_id", bed.id)
  ).data.length >= 3,
);
assert.ok(
  (
    await doctor
      .from("notification_acknowledgements")
      .select("*")
      .eq("notification_id", alert.id)
  ).data.length >= 3,
);
pass("Admission, resource and alert histories persist transactionally");
assert.ok((await anon.from("follow_up_records").select("*")).error);
assert.ok(
  (
    await doctor.from("reassessment_records").insert({
      hospital_id: hospital,
      encounter_id: created.id,
      reason: "Forbidden direct task",
      source: "staff",
    })
  ).error,
);
pass("New workflow tables deny anonymous reads and direct writes");
console.log(
  `All ${count} integration assertions passed. Synthetic records intentionally retained for audit.`,
);
