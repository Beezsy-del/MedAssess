import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const options = { auth: { persistSession: false } };
const nurse = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const login = await nurse.auth.signInWithPassword({
  email: process.env.DEMO_NURSE_EMAIL,
  password: process.env.DEMO_NURSE_PASSWORD,
});
assert.equal(login.error, null);
const user = login.data.user.id;
const membership = await nurse
  .from("hospital_memberships")
  .select("*")
  .eq("user_id", user)
  .eq("active", true);
assert.equal(membership.error, null);
const hospital = membership.data[0].hospital_id;
let count = 0;
const pass = (label) => console.log(`INTAKE PASS ${++count}: ${label}`);
function payload() {
  return {
    operation_id: randomUUID(),
    name: `Synthetic intake ${randomUUID()}`,
    age: null,
    date_of_birth: "1992-04-12",
    sex: "Female",
    phone: String(Date.now()).slice(-10),
    identifier: `TEST-${randomUUID()}`,
    emergency_contact: "Synthetic contact",
    unidentified: false,
    identity_confirmed: true,
    duplicate_reason: "",
    new_visit_reason: "",
    department_id: "",
    arrival_method: "Walk-in",
    history: "Synthetic history",
    allergies: "Not known",
    notes: "Synthetic observations",
    category: "YELLOW",
    reason: "Synthetic nurse assessment",
    input: {
      warningSigns: [],
      symptoms: "Synthetic ankle discomfort",
      pain: 3,
      worsening: false,
      verified: true,
      vitals: {
        pulse: 80,
        spo2: 98,
        respiratoryRate: 18,
        systolic: 120,
        temperature: 37,
      },
    },
  };
}
const command = (data) =>
  nurse.rpc("staff_command", {
    p_hospital: hospital,
    p_action: "intake",
    p_data: data,
  });
const first = payload();
const results = await Promise.all([command(first), command(first)]);
for (const r of results) assert.equal(r.error, null);
assert.equal(results[0].data.id, results[1].data.id);
const receipt = results[0].data;
pass("Concurrent identical intake creates one encounter");
const encounter = await nurse
  .from("patient_encounters")
  .select("*")
  .eq("id", receipt.id)
  .single();
assert.equal(encounter.error, null);
assert.equal(encounter.data.status, "WAITING");
assert.equal(encounter.data.category, "YELLOW");
assert.deepEqual(encounter.data.intake, {});
assert.equal(encounter.data.created_by, user);
pass("Patient enters the confirmed queue with history and responsible user");
const patient = await nurse
  .from("patients")
  .select("*")
  .eq("id", receipt.patient_id)
  .single();
assert.equal(patient.data.date_of_birth, first.date_of_birth);
assert.equal(patient.data.identifier, first.identifier);
assert.equal(patient.data.emergency_contact, first.emergency_contact);
pass("Demographics and optional identity fields persist");
const assessment = await nurse
  .from("triage_assessments")
  .select("*")
  .eq("encounter_id", receipt.id);
assert.equal(assessment.data.length, 1);
assert.equal(assessment.data[0].actor, user);
assert.equal(assessment.data[0].input.medical_history, first.history);
assert.equal(assessment.data[0].input.allergies, first.allergies);
assert.equal(assessment.data[0].proposed_category, "ASSESSMENT_REQUIRED");
assert.equal(assessment.data[0].confirmed_category, "YELLOW");
pass("Recommendation and single human confirmation are preserved");
const audit = await nurse
  .from("audit_logs")
  .select("*")
  .eq("entity_id", receipt.id)
  .eq("action", "intake.confirmed");
assert.equal(audit.data.length, 0);
assert.equal(receipt.actor, user);
pass(
  "Confirmation identifies the actor; administrative audit history remains restricted",
);
const changed = await command({ ...first, category: "GREEN" });
assert.equal(changed.error?.code, "PT409");
pass("Changed replay is rejected");
const duplicate = await command({
  ...first,
  operation_id: randomUUID(),
  identifier: "",
});
assert.equal(duplicate.error?.code, "PT422");
const matching = await nurse
  .from("patients")
  .select("id")
  .eq("name", first.name);
assert.equal(matching.data.length, 1);
pass("Duplicate identity requires deliberate resolution");
const identifier = await command({
  ...payload(),
  identifier: first.identifier,
  duplicate_reason: "Verified as a different synthetic person",
});
assert.equal(identifier.error?.code, "23505");
pass("Unique hospital identifier prevents duplicate patient records");
for (const query of [
  first.identifier,
  first.name,
  first.date_of_birth,
  receipt.patient_id,
  first.phone,
]) {
  const found = await nurse.rpc("find_patients", {
    p_hospital: hospital,
    p_query: query,
  });
  assert.equal(found.error, null);
  assert.ok(
    found.data.some((p) =>
      query === first.date_of_birth
        ? p.date_of_birth === query
        : p.id === receipt.patient_id,
    ),
  );
}
pass("Patient lookup supports ID, MRN, name, DOB and phone");
const existing = { ...payload(), patient_id: receipt.patient_id };
const conflict = await command(existing);
assert.equal(conflict.error?.code, "PT423");
const second = await command({
  ...existing,
  new_visit_reason: "Separate synthetic return visit",
});
assert.equal(second.error, null);
assert.equal(second.data.patient_id, receipt.patient_id);
assert.notEqual(second.data.id, receipt.id);
pass(
  "Existing patient keeps history; another active visit requires explanation",
);
const pending = await nurse.rpc("staff_command", {
  p_hospital: hospital,
  p_action: "register",
  p_data: {
    operation_id: randomUUID(),
    name: `Synthetic awaiting ${randomUUID()}`,
  },
});
assert.equal(pending.error, null);
const pendingRow = await nurse
  .from("patient_encounters")
  .select("*")
  .eq("id", pending.data.id)
  .single();
const resume = {
  ...payload(),
  patient_id: pendingRow.data.patient_id,
  encounter_id: pendingRow.data.id,
  version: pendingRow.data.version,
};
const resumed = await command(resume);
assert.equal(resumed.error, null);
assert.equal(resumed.data.id, pendingRow.data.id);
pass("Initial assessment resumes the same pending encounter");
const stale = await command({ ...resume, operation_id: randomUUID() });
assert.equal(stale.error?.code, "PT409");
pass("Stale or already-assessed encounter is rejected");
for (const variation of ["unverified", "emergency", "invalid-vital"]) {
  const bad = payload();
  if (variation === "unverified") bad.input.verified = false;
  if (variation === "emergency") {
    bad.input.warningSigns = ["Unresponsive"];
    bad.category = "GREEN";
  }
  if (variation === "invalid-vital") bad.input.vitals.spo2 = 101;
  const failed = await command(bad);
  assert.ok(failed.error);
  const absent = await nurse.from("patients").select("id").eq("name", bad.name);
  assert.equal(absent.data.length, 0);
}
pass(
  "Clinical validation failure rolls back patient, encounter and assessment",
);
const incomplete = { ...payload(), category: "ASSESSMENT_REQUIRED" };
incomplete.input.verified = false;
incomplete.input.vitals = {
  pulse: null,
  spo2: null,
  respiratoryRate: null,
  systolic: null,
  temperature: null,
};
const saved = await command(incomplete);
assert.equal(saved.error, null);
assert.equal(saved.data.status, "TRIAGE_PENDING");
pass("Incomplete assessment remains unknown and awaiting human assessment");
const foreign = await nurse.rpc("staff_command", {
  p_hospital: randomUUID(),
  p_action: "intake",
  p_data: payload(),
});
assert.equal(foreign.error?.code, "42501");
const wrongPatient = await command({ ...payload(), patient_id: randomUUID() });
assert.equal(wrongPatient.error?.code, "42501");
pass("Tenant and patient membership checks fail closed");
const publicLookup = await anon.rpc("find_patients", {
  p_hospital: hospital,
  p_query: first.name,
});
assert.ok(publicLookup.error);
const publicSubmit = await anon.rpc("staff_command", {
  p_hospital: hospital,
  p_action: "intake",
  p_data: payload(),
});
assert.ok(publicSubmit.error);
pass("Anonymous lookup and intake denied");
console.log(
  `All ${count} intake assertions passed. Synthetic records retained for audit.`,
);
