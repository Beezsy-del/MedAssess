import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
const env = parseEnv(
  readFileSync(
    process.env.LOCAL_SUPABASE_ENV ?? "/tmp/medcipher-local-supabase.env",
    "utf8",
  ),
);
const url = env.API_URL;
if (!url || !["localhost", "127.0.0.1"].includes(new URL(url).hostname))
  throw new Error("Local-only setup requires a loopback Supabase URL");
if (existsSync(".demo-local-fixture.json"))
  throw new Error(
    "Local fixture already exists; preserve it and reuse .env.local-test",
  );
const db = createClient(url, env.SERVICE_ROLE_KEY ?? env.SECRET_KEY, {
  auth: { persistSession: false },
});
async function insert(table, values) {
  const r = await db.from(table).insert(values).select();
  if (r.error) throw new Error(`${table}: ${r.error.message}`);
  return r.data;
}
const hospital = randomUUID(),
  secondHospital = randomUUID();
await insert("hospitals", [
  {
    id: hospital,
    name: "Synthetic MediRoute local hospital",
    location: "Local test environment",
    is_demo: true,
  },
  {
    id: secondHospital,
    name: "Synthetic isolated second hospital",
    location: "Local test environment",
    is_demo: true,
  },
]);
await insert("hospital_settings", [
  { hospital_id: hospital },
  { hospital_id: secondHospital },
]);
const credentials = {};
const members = [];
for (const [key, role] of [
  ["NURSE", "triage_nurse"],
  ["DOCTOR", "doctor"],
  ["ADMIN", "hospital_admin"],
  ["RECEPTION", "receptionist"],
  ["RESOURCE", "resource_manager"],
  ["EMERGENCY", "emergency_coordinator"],
  ["OTHER", "doctor"],
]) {
  const email = `synthetic-${key.toLowerCase()}-${randomUUID().slice(0, 8)}@example.test`,
    password = randomBytes(24).toString("base64url");
  const result = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (result.error) throw result.error;
  credentials[key] = { email, password, id: result.data.user.id };
  members.push({
    hospital_id: key === "OTHER" ? secondHospital : hospital,
    user_id: result.data.user.id,
    role,
    display_name: `Synthetic ${key.toLowerCase()}`,
  });
}
await insert("hospital_memberships", members);
const departments = await insert("departments", [
  {
    hospital_id: hospital,
    name: "Emergency assessment",
    location: "Ground floor",
    capacity: 12,
  },
  {
    hospital_id: hospital,
    name: "General OPD",
    location: "First floor",
    capacity: 24,
  },
  {
    hospital_id: hospital,
    name: "Specialist assessment",
    location: "East wing",
    capacity: 12,
  },
]);
await insert(
  "staff_department_memberships",
  ["NURSE", "DOCTOR", "EMERGENCY"].flatMap((key) =>
    departments.map((d) => ({
      hospital_id: hospital,
      user_id: credentials[key].id,
      department_id: d.id,
      assigned_by: credentials.ADMIN.id,
    })),
  ),
);
const wards = await insert("bed_wards", [
  {
    hospital_id: hospital,
    department_id: departments[0].id,
    name: "Critical care",
    zone: "critical",
    categories: ["RED"],
    display_order: 1,
  },
  {
    hospital_id: hospital,
    department_id: departments[2].id,
    name: "High acuity",
    zone: "high",
    categories: ["YELLOW"],
    display_order: 2,
  },
  {
    hospital_id: hospital,
    department_id: departments[1].id,
    name: "Standard care",
    zone: "standard",
    categories: ["GREEN"],
    display_order: 3,
  },
]);
const beds = [];
for (const [i, ward] of wards.entries())
  for (let n = 1; n <= 4; n++) {
    const [resource] = await insert("hospital_resources", {
      hospital_id: hospital,
      name: `${ward.name} ${n}`,
      kind: i === 0 ? "ICU bed" : i === 1 ? "Emergency bed" : "General bed",
      location: ward.name,
      department_id: ward.department_id,
    });
    beds.push(resource);
    await insert("bed_profiles", {
      resource_id: resource.id,
      hospital_id: hospital,
      ward_id: ward.id,
      row_number: 1,
      column_number: n,
      capabilities: i < 2 ? ["oxygen", "cardiac_monitor"] : [],
      verified: true,
    });
  }
await insert("hospital_resources", [
  {
    hospital_id: hospital,
    name: "Synthetic stretcher 1",
    kind: "Stretcher",
    location: "Emergency bay",
  },
  {
    hospital_id: hospital,
    name: "Synthetic wheelchair 1",
    kind: "Wheelchair",
    location: "Reception",
  },
]);
await insert("referral_facilities", {
  hospital_id: hospital,
  name: "Synthetic regional facility",
  contact: "Synthetic test contact only",
  services: "Synthetic referral test",
});
const lines = [
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${env.PUBLISHABLE_KEY ?? env.ANON_KEY}`,
  "DEMO_MODE=true",
  `SUPABASE_SECRET_KEY=${env.SECRET_KEY ?? env.SERVICE_ROLE_KEY}`,
];
for (const [key, value] of Object.entries(credentials))
  lines.push(
    `DEMO_${key}_EMAIL=${value.email}`,
    `DEMO_${key}_PASSWORD=${value.password}`,
  );
writeFileSync(".env.local-test", lines.join("\n") + "\n", { mode: 0o600 });
writeFileSync(
  ".demo-local-fixture.json",
  JSON.stringify({
    hospital,
    secondHospital,
    credentials,
    departments,
    wards,
    beds,
  }),
  { mode: 0o600 },
);
console.log(
  "Created synthetic local accounts, two tenants, department memberships, wards and resources. Credentials saved to ignored local files.",
);
