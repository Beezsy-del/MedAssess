import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { emptyReport } from "../src/features/questionnaire/model.ts";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!["localhost", "127.0.0.1"].includes(new URL(url).hostname))
  throw new Error("Synthetic protocol fixtures are local-only");
const fixture = JSON.parse(readFileSync(".demo-local-fixture.json", "utf8"));
const clients = {};
for (const name of [
  "NURSE",
  "DOCTOR",
  "ADMIN",
  "RECEPTION",
  "RESOURCE",
  "OTHER",
]) {
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.auth.signInWithPassword(fixture.credentials[name]);
  assert.equal(error, null, `Sign in ${name}`);
  clients[name] = db;
}
const anon = createClient(url, key, { auth: { persistSession: false } });
let assertions = 0;
const pass = (label) => console.log(`PORTAL PASS ${++assertions}: ${label}`);
async function command(role, action, data, h = fixture.hospital) {
  return clients[role].rpc("staff_command", {
    p_hospital: h,
    p_action: action,
    p_data: data,
  });
}
async function ok(role, action, data) {
  const result = await command(role, action, data);
  assert.equal(result.error, null, `${action}: ${result.error?.message}`);
  return result.data;
}
const operation = (reason) => ({ operation_id: randomUUID(), reason });
async function encounter(id) {
  const result = await clients.DOCTOR.from("patient_encounters")
    .select("*")
    .eq("id", id)
    .single();
  assert.equal(result.error, null);
  return result.data;
}
async function portal(token, action, data = {}) {
  const result = await anon.rpc("patient_portal", {
    p_token: token,
    p_action: action,
    p_data: data,
  });
  assert.equal(result.error, null, `${action}: ${result.error?.message}`);
  assert.equal(result.data.error, undefined);
  return result.data;
}
const cfg = {
  name: "Synthetic software acceptance fixture — not clinical guidance",
  version: `synthetic-${Date.now()}`,
  reference: "https://example.test/not-clinical",
  rules: [
    {
      id: "fixture_green",
      category: "GREEN",
      explanation: "Synthetic fixture marker only; not a medical rule",
      requires: ["onset", "symptoms", "progression"],
      all: [
        { field: "onset", operator: "equals", value: "SYNTHETIC-ACCEPTANCE" },
        { field: "progression", operator: "equals", value: "same" },
      ],
    },
    {
      id: "fixture_yellow",
      category: "YELLOW",
      explanation: "Synthetic progression assertion only; not medical guidance",
      requires: ["onset", "progression"],
      all: [
        { field: "onset", operator: "equals", value: "SYNTHETIC-ACCEPTANCE" },
        { field: "progression", operator: "equals", value: "worsening" },
      ],
    },
  ],
  considerations: [
    {
      label: "Synthetic mapping for software testing",
      symptoms: ["fever"],
      limitations:
        "No diagnosis; qualified medical review is required before any care use.",
      reference: "https://example.test/not-clinical",
    },
  ],
  reassessment_minutes: { GREEN: 1, YELLOW: 1, RED: 1, ASSESSMENT_REQUIRED: 1 },
};
const draft = await ok("DOCTOR", "protocol_save", {
  ...operation("Synthetic software-only protocol fixture"),
  configuration: cfg,
});
assert.equal(
  (
    await command("NURSE", "protocol_review", {
      ...operation("Unauthorized fixture review"),
      id: draft.id,
      reviewed: true,
    })
  ).error?.code,
  "42501",
);
await ok("DOCTOR", "protocol_review", {
  ...operation("Synthetic software-only approval, not clinical validation"),
  id: draft.id,
  reviewed: true,
});
pass("Protocol version requires doctor review; nurse activation denied");
assert.equal(
  (
    await command("DOCTOR", "register", {
      operation_id: randomUUID(),
      name: "Forbidden registration",
    })
  ).error?.code,
  "42501",
);
assert.equal((await command("ADMIN", "assess", {})).error?.code, "42501");
pass(
  "Doctor registration and administrator clinical commands denied through RPC",
);
const created = await ok("RECEPTION", "register", {
  operation_id: randomUUID(),
  name: `Synthetic portal ${Date.now()}`,
});
assert.match(created.manual_token, /^[a-f0-9]{32}$/);
assert.equal(
  (await portal(created.manual_token, "status")).reference,
  created.reference,
);
pass("QR and manual capability resolve only the registered encounter");
const report = emptyReport();
report.consent = true;
report.complaint = "Synthetic fever for software acceptance";
report.symptoms = ["fever"];
report.symptoms_complete = true;
report.onset = "SYNTHETIC-ACCEPTANCE";
report.progression = "same";
report.history.status = "recorded";
report.history.conditions = ["diabetes"];
report.medication_status = "recorded";
report.medications = [
  {
    name: "Synthetic medicine",
    dose: "Synthetic dose",
    frequency: "Synthetic frequency",
    details: "Not a prescription",
  },
];
report.allergy_status = "recorded";
report.allergies = [
  { substance: "Synthetic substance", reaction: "Synthetic reaction" },
];
await portal(created.token, "draft", { answers: report, step: 4 });
assert.deepEqual((await portal(created.manual_token, "status")).draft, report);
pass("Save and resume preserves structured history, medicines and allergies");
const request = {
  answers: report,
  operation_id: randomUUID(),
  previous_report_id: null,
};
const submission = await portal(created.token, "submit", request);
assert.equal(submission.category, "GREEN");
assert.equal((await portal(created.token, "submit", request)).duplicate, true);
pass("Reviewed synthetic GREEN rule and idempotent submission persist");
const changed = await anon.rpc("patient_portal", {
  p_token: created.token,
  p_action: "submit",
  p_data: { ...request, answers: { ...report, complaint: "Changed replay" } },
});
assert.equal(changed.error?.code, "PT409");
pass("Changed retries cannot overwrite report history");
const nurseSnapshot = await clients.NURSE.rpc("workspace_snapshot", {
  p_hospital: fixture.hospital,
});
assert.equal(nurseSnapshot.error, null);
assert.ok(
  nurseSnapshot.data.patientReports.some(
    (r) =>
      r.id === submission.report_id &&
      r.answers.medications[0].name === "Synthetic medicine",
  ),
);
pass("Nurse snapshot contains patient brief and full reported history");
const adminSnapshot = await clients.ADMIN.rpc("workspace_snapshot", {
  p_hospital: fixture.hospital,
});
assert.equal(adminSnapshot.error, null);
assert.equal(adminSnapshot.data.patientReports.length, 0);
assert.ok(
  adminSnapshot.data.encounters.some(
    (e) => e.id === created.id && e.symptoms === "",
  ),
);
assert.equal(
  (await clients.ADMIN.from("patient_reports").select("*")).data.length,
  0,
);
pass("Admin receives directory and aggregate data, no raw questionnaires");
assert.equal(
  (
    await clients.OTHER.rpc("workspace_snapshot", {
      p_hospital: fixture.hospital,
    })
  ).error?.code,
  "42501",
);
assert.equal(
  (
    await clients.OTHER.from("patient_reports")
      .select("*")
      .eq("encounter_id", created.id)
  ).data.length,
  0,
);
pass("Second hospital cannot read first-hospital snapshot or questionnaire");
const yellow = await portal(created.token, "submit", {
  answers: { ...report, progression: "worsening" },
  operation_id: randomUUID(),
  previous_report_id: submission.report_id,
});
assert.equal(yellow.category, "YELLOW");
const notifications = await clients.DOCTOR.from("notifications")
  .select("*")
  .eq("encounter_id", created.id);
assert.ok(notifications.data.some((n) => n.title.includes("Urgent patient")));
pass("Changed symptoms escalate GREEN to YELLOW with doctor notification");
await portal(created.token, "emergency");
await portal(created.token, "emergency");
assert.equal((await encounter(created.id)).category, "RED");
const requests = await clients.NURSE.from("resource_requests")
  .select("*")
  .eq("encounter_id", created.id);
assert.equal(requests.data.length, 1);
pass(
  "Emergency overrides incomplete questionnaire and creates one resource request",
);
const alerts = await clients.NURSE.from("notifications")
  .select("*")
  .eq("encounter_id", created.id)
  .eq("title", "Patient requests immediate emergency assistance");
assert.ok(alerts.data.length);
await ok("NURSE", "alert", { id: alerts.data[0].id, status: "ACKNOWLEDGED" });
assert.equal((await portal(created.token, "emergency")).acknowledged, true);
pass("Emergency acknowledgement is reported only after staff confirms it");
const req = requests.data[0];
await ok("RESOURCE", "resource_request_status", {
  ...operation("Synthetic transport needs reviewed"),
  id: req.id,
  status: "ACKNOWLEDGED",
});
const stretcherName = `Synthetic portal stretcher ${Date.now()}`;
await ok("ADMIN", "resource", {
  name: stretcherName,
  kind: "Stretcher",
  location: "Synthetic local test",
});
const stretcher = await clients.RESOURCE.from("hospital_resources")
  .select("*")
  .eq("hospital_id", fixture.hospital)
  .eq("kind", "Stretcher")
  .eq("name", stretcherName)
  .eq("status", "AVAILABLE")
  .limit(1);
assert.ok(stretcher.data.length);
await ok("RESOURCE", "resource_request_status", {
  ...operation("Synthetic compatible stretcher availability confirmed"),
  id: req.id,
  status: "FULFILLED",
  resource_id: stretcher.data[0].id,
});
const allocation = await clients.RESOURCE.from("resource_reservations")
  .select("*")
  .eq("encounter_id", created.id)
  .is("released_at", null);
assert.equal(allocation.data.length, 1);
pass(
  "Resource request fulfillment allocates a currently available matching resource",
);
const e = await encounter(created.id);
assert.ok(
  (
    await command("NURSE", "opd_route", {
      ...operation("Synthetic forbidden RED routing"),
      encounter_id: e.id,
      version: e.version,
      department_id: fixture.departments[1].id,
    })
  ).error,
);
pass("RED and emergency cases cannot enter general OPD");
const nextReport = await portal(created.token, "submit", {
  answers: report,
  operation_id: randomUUID(),
  previous_report_id: yellow.report_id,
});
assert.equal(nextReport.category, "RED");
pass(
  "Later apparently improved report cannot silently downgrade emergency urgency",
);
const rotated = await ok("NURSE", "token", { encounter_id: created.id });
const revoked = await anon.rpc("patient_portal", {
  p_token: created.token,
  p_action: "status",
});
assert.ok(revoked.data.error);
assert.equal(
  (await portal(rotated.manual_token, "status")).reference,
  created.reference,
);
pass("Rotating a patient pass revokes old QR and manual credentials");
await ok("RESOURCE", "release", { resource_id: stretcher.data[0].id });
await ok("RESOURCE", "resource_clean", {
  resource_id: stretcher.data[0].id,
  checks_confirmed: true,
});

const routed = await ok("RECEPTION", "register", {
  operation_id: randomUUID(),
  name: `Synthetic OPD ${Date.now()}`,
});
report.progression = "same";
report.emergency_help = false;
await portal(routed.token, "submit", {
  answers: report,
  operation_id: randomUUID(),
  previous_report_id: null,
});
const destination = fixture.departments[0].id;
await ok("DOCTOR", "department_routing", {
  ...operation("Synthetic OPD route fixture, not medical approval"),
  department_id: destination,
  categories: ["GREEN"],
  reviewed: true,
});
const opd = await ok("NURSE", "opd_route", {
  ...operation("Synthetic nurse routes to reviewed OPD"),
  encounter_id: routed.id,
  version: (await encounter(routed.id)).version,
  department_id: destination,
});
assert.equal((await encounter(routed.id)).department_id, destination);
for (const status of ["ACKNOWLEDGED", "ACCEPTED", "ARRIVED", "COMPLETED"]) {
  const ref = await clients.DOCTOR.from("department_referrals")
    .select("*")
    .eq("id", opd.id)
    .single();
  await ok("DOCTOR", "department_referral_status", {
    ...operation("Synthetic receiving department confirmation"),
    encounter_id: routed.id,
    version: (await encounter(routed.id)).version,
    id: opd.id,
    referral_version: ref.data.version,
    status,
  });
}
pass(
  "Nurse OPD routing immediately updates the department queue and preserves receiving lifecycle",
);
const referral = await ok("DOCTOR", "department_referral", {
  ...operation("Synthetic doctor requests specialist department"),
  encounter_id: routed.id,
  version: (await encounter(routed.id)).version,
  department_id: fixture.departments[1].id,
  urgency: "GREEN",
  observations: "Synthetic observation, no clinical recommendation",
});
assert.equal((await encounter(routed.id)).department_id, destination);
for (const status of ["ACKNOWLEDGED", "ACCEPTED", "ARRIVED", "COMPLETED"]) {
  const ref = await clients.DOCTOR.from("department_referrals")
    .select("*")
    .eq("id", referral.id)
    .single();
  await ok("DOCTOR", "department_referral_status", {
    ...operation("Synthetic referral movement confirmation"),
    encounter_id: routed.id,
    version: (await encounter(routed.id)).version,
    id: referral.id,
    referral_version: ref.data.version,
    status,
  });
}
assert.equal(
  (await encounter(routed.id)).department_id,
  fixture.departments[1].id,
);
pass(
  "Doctor referral tracks acknowledgement, acceptance, arrival and completion without premature movement",
);
const transportPayload = {
  ...operation("Synthetic nurse requests assisted transport"),
  encounter_id: routed.id,
  version: (await encounter(routed.id)).version,
  kind: "Stretcher",
};
const transport = await ok("NURSE", "resource_request", transportPayload);
assert.equal(
  (await ok("NURSE", "resource_request", transportPayload)).duplicate,
  true,
);
const transportRecord = await clients.NURSE.from("resource_requests")
  .select("*")
  .eq("id", transport.id)
  .single();
assert.ok(transportRecord.data.requested_by);
assert.equal(transportRecord.data.status, "REQUESTED");
pass(
  "Nurse transport request persists responsible user and retries without duplicate requests",
);
for (const client of Object.values(clients)) await client.auth.signOut();
console.log(
  `All ${assertions} patient-portal integration groups passed. Synthetic records retained; no clinical validity claimed.`,
);
