import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
const login = await db.auth.signInWithPassword({
  email: process.env.DEMO_DOCTOR_EMAIL,
  password: process.env.DEMO_DOCTOR_PASSWORD,
});
if (login.error) throw new Error("Audit sign-in failed");
const user = login.data.user.id;
const m = await db
  .from("hospital_memberships")
  .select("hospital_id")
  .eq("user_id", user)
  .eq("active", true)
  .single();
if (m.error) throw new Error("Audit membership unavailable");
const hospital = m.data.hospital_id;
const h = await db
  .from("hospitals")
  .select("is_demo")
  .eq("id", hospital)
  .single();
if (h.data?.is_demo !== true) throw new Error("Synthetic hospital required");
const results = [],
  times = [];
const cmd = (action, data) =>
  db.rpc("staff_command", {
    p_hospital: hospital,
    p_action: action,
    p_data: data,
  });
const timed = async (fn) => {
  const start = performance.now();
  const r = await fn();
  times.push(performance.now() - start);
  return r;
};
try {
  const created = [];
  for (let batch = 0; batch < 4; batch++) {
    const rows = await Promise.all(
      Array.from({ length: 5 }, () =>
        timed(() =>
          cmd("register", {
            operation_id: randomUUID(),
            name: "Synthetic bounded load audit",
            symptoms: "Software-only concurrency test",
          }),
        ),
      ),
    );
    created.push(...rows);
  }
  results.push({
    check: "20 registrations, concurrency 5",
    pass: created.every((r) => !r.error),
    success: created.filter((r) => !r.error).length,
  });
  const op = randomUUID();
  const duplicates = await Promise.all(
    Array.from({ length: 10 }, () =>
      timed(() =>
        cmd("register", {
          operation_id: op,
          name: "Synthetic duplicate sync audit",
        }),
      ),
    ),
  );
  const persisted = await db
    .from("patient_encounters")
    .select("id")
    .eq("hospital_id", hospital)
    .eq("idempotency_key", op);
  results.push({
    check: "10 simultaneous retries of one operation",
    pass: duplicates.every((r) => !r.error) && persisted.data?.length === 1,
    success: duplicates.filter((r) => !r.error).length,
    persisted: persisted.data?.length,
    errorCodes: [
      ...new Set(duplicates.filter((r) => r.error).map((r) => r.error.code)),
    ],
  });
  const first = created.find((r) => !r.error).data;
  const emergencies = await Promise.all(
    Array.from({ length: 10 }, () =>
      timed(() =>
        db.rpc("patient_portal", {
          p_token: first.token,
          p_action: "emergency",
        }),
      ),
    ),
  );
  const e = await db
    .from("patient_encounters")
    .select("category,emergency")
    .eq("id", first.id)
    .single();
  const alerts = await db
    .from("notifications")
    .select("id")
    .eq("encounter_id", first.id)
    .eq("title", "Patient requests immediate emergency assistance");
  results.push({
    check: "10 simultaneous emergency reports",
    pass:
      emergencies.every((r) => !r.error && !r.data.error) &&
      e.data.category === "RED" &&
      alerts.data.length === 1,
    alerts: alerts.data?.length,
  });
  const resource = await db
    .from("hospital_resources")
    .select("id")
    .eq("hospital_id", hospital)
    .eq("status", "AVAILABLE")
    .limit(1)
    .single();
  if (resource.data) {
    const bookings = await Promise.all(
      created
        .filter((r) => !r.error)
        .slice(0, 5)
        .map((r) =>
          cmd("reserve", {
            encounter_id: r.data.id,
            resource_id: resource.data.id,
          }),
        ),
    );
    results.push({
      check: "5 competing resource reservations",
      pass: bookings.filter((r) => !r.error).length === 1,
      winners: bookings.filter((r) => !r.error).length,
    });
    await cmd("release", { resource_id: resource.data.id });
    await cmd("release", { resource_id: resource.data.id });
  }
  times.sort((a, b) => a - b);
  const report = {
    at: new Date().toISOString(),
    scope: "Synthetic remote smoke load; not capacity certification",
    concurrency: 5,
    results,
    latencyMs: {
      samples: times.length,
      p50: Math.round(times[Math.floor(times.length * 0.5)]),
      p95: Math.round(times[Math.floor(times.length * 0.95)]),
      max: Math.round(times.at(-1)),
    },
  };
  await writeFile(
    process.env.AUDIT_OUTPUT ?? "docs/AUDIT_LOAD_RESULTS.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  if (results.some((r) => !r.pass)) process.exitCode = 1;
} finally {
  await db.auth.signOut({ scope: "local" });
  db.realtime.disconnect();
}
