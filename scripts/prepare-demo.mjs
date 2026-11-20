import { randomUUID, randomBytes } from "node:crypto";
import { writeFileSync, appendFileSync, existsSync } from "node:fs";
import bcrypt from "bcryptjs";
if (existsSync(".demo-fixture.json"))
  throw new Error(
    "Demo fixture already exists. Use the non-destructive archive workflow; do not reseed.",
  );
const hospital = randomUUID();
const users = [];
for (const [role, key, name] of [
  ["doctor", "DOCTOR", "Dr. Ananya Rao"],
  ["triage_nurse", "NURSE", "Nurse Kavya M."],
  ["hospital_admin", "ADMIN", "Hospital administrator"],
]) {
  const id = randomUUID(),
    password = randomBytes(32).toString("base64url"),
    email = `demo-${key.toLowerCase()}-${id.slice(0, 8)}@medcipher.example`;
  users.push({ id, email, role, name, hash: await bcrypt.hash(password, 12) });
  appendFileSync(
    ".env.local",
    `DEMO_${key}_EMAIL=${email}\nDEMO_${key}_PASSWORD=${password}\n`,
  );
}
const q = (s) => "'" + s.replaceAll("'", "''") + "'";
let sql = `insert into public.hospitals(id,name,location,is_demo) values('${hospital}','Kaveri District Hospital','Mysuru, Karnataka',true);\ninsert into public.hospital_settings(hospital_id) values('${hospital}');\n`;
for (const u of users) {
  sql += `insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change) values('00000000-0000-0000-0000-000000000000','${u.id}','authenticated','authenticated',${q(u.email)},${q(u.hash)},now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','');\ninsert into auth.identities(id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at) values(gen_random_uuid(),'${u.id}','${u.id}',jsonb_build_object('sub','${u.id}','email',${q(u.email)},'email_verified',true),'email',now(),now(),now());\ninsert into public.hospital_memberships(hospital_id,user_id,role,display_name) values('${hospital}','${u.id}','${u.role}',${q(u.name)});\n`;
}
for (const [name, location, capacity] of [
  ["Emergency medicine", "Ground floor · East wing", 12],
  ["General medicine", "First floor · OPD", 24],
  ["Paediatrics", "First floor · North wing", 16],
  ["Orthopaedics", "Ground floor · West wing", 10],
])
  sql += `insert into public.departments(hospital_id,name,location,capacity) values('${hospital}',${q(name)},${q(location)},${capacity});\n`;
for (let i = 1; i <= 12; i++) {
  const kind =
    i <= 4
      ? "Emergency bed"
      : i <= 8
        ? "General bed"
        : i <= 10
          ? "ICU bed"
          : i === 11
            ? "Stretcher"
            : "Wheelchair";
  sql += `insert into public.hospital_resources(hospital_id,name,kind,location) values('${hospital}','${kind} ${String(i).padStart(2, "0")}','${kind}','${i <= 4 ? "Emergency bay" : "Main block"}');\n`;
}
sql += `insert into public.referral_facilities(hospital_id,name,contact,services) values('${hospital}','Regional Medical Centre (synthetic)','Demo directory — no real contact','Critical care, neurology, trauma');\ninsert into public.triage_protocol_versions(hospital_id,name,version,reference,configuration) values('${hospital}','Demonstration assessment pathway','demo-1.0-unvalidated','Engineering scenarios only; clinical review pending','{"clinical_enabled":false}');\n`;
const cases = [
  [
    "Meera S.",
    34,
    "YELLOW",
    "TRIAGE_COMPLETED",
    "Worsening abdominal pain",
    false,
    42,
  ],
  [
    "Ravi K.",
    62,
    "RED",
    "TRIAGE_PENDING",
    "Reported severe breathing difficulty",
    true,
    8,
  ],
  [
    "Asha P.",
    28,
    "GREEN",
    "WAITING",
    "Minor ankle injury; synthetic clinician verification",
    false,
    57,
  ],
  [
    "Unidentified patient",
    null,
    "ASSESSMENT_REQUIRED",
    "TRIAGE_PENDING",
    "Information unavailable; staff assessment needed",
    false,
    14,
  ],
  [
    "Dev N.",
    9,
    "ASSESSMENT_REQUIRED",
    "TRIAGE_PENDING",
    "Fever reported by guardian",
    false,
    21,
  ],
];
for (const [name, age, cat, status, symptoms, emergency, minutes] of cases) {
  const pid = randomUUID(),
    eid = randomUUID();
  sql += `insert into public.patients(id,hospital_id,name,age,unidentified) values('${pid}','${hospital}',${q(name)},${age ?? "null"},${age === null});\ninsert into public.patient_encounters(id,hospital_id,patient_id,department_id,category,status,symptoms,emergency,idempotency_key,created_by,arrived_at,reassessment_due) values('${eid}','${hospital}','${pid}',(select id from public.departments where hospital_id='${hospital}' and name='${emergency ? "Emergency medicine" : "General medicine"}'),'${cat}','${status}',${q(symptoms)},${emergency},gen_random_uuid(),'${users[0].id}',now()-interval '${minutes} minutes',${cat === "YELLOW" ? "now()-interval '2 minutes'" : "null"});\ninsert into public.patient_status_events(hospital_id,encounter_id,actor,to_status,reason,created_at) values('${hospital}','${eid}','${users[0].id}','${status}','Synthetic scenario seed',now()-interval '${minutes} minutes');\n`;
  if (cat === "RED" || cat === "YELLOW")
    sql += `insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values('${hospital}','${eid}',${q(emergency ? "Immediate assistance requested" : "Reassessment due")},array['doctor','triage_nurse','emergency_coordinator']::public.staff_role[]);\n`;
}
sql += `insert into public.audit_logs(hospital_id,action,details) values('${hospital}','demo.initialized','{"synthetic":true}');\n`;
writeFileSync(".demo-seed.sql", sql);
writeFileSync(
  ".demo-fixture.json",
  JSON.stringify({
    hospital,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
    })),
  }),
);
console.log(
  "Synthetic seed prepared; credentials stored only in ignored .env.local.",
);
