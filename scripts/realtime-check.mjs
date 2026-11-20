import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
assert.equal(
  (
    await db.auth.signInWithPassword({
      email: process.env.DEMO_DOCTOR_EMAIL,
      password: process.env.DEMO_DOCTOR_PASSWORD,
    })
  ).error,
  null,
);
const user = (await db.auth.getUser()).data.user;
const { data: membership } = await db
  .from("hospital_memberships")
  .select("hospital_id")
  .eq("user_id", user.id)
  .eq("active", true)
  .single();
const hospital = membership.hospital_id;
const registered = await db.rpc("staff_command", {
  p_hospital: hospital,
  p_action: "register",
  p_data: {
    operation_id: randomUUID(),
    name: "Synthetic Realtime verification",
    symptoms: "Software delivery verification",
  },
});
assert.equal(registered.error, null);
let resolveEvent;
const received = new Promise((resolve) => {
  resolveEvent = resolve;
});
const channel = db.channel(`acceptance-${randomUUID()}`).on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "patient_encounters",
    filter: `id=eq.${registered.data.id}`,
  },
  (event) => resolveEvent(event),
);
let timer;
try {
  await new Promise((resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error("Realtime subscription timed out")),
      20000,
    );
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timer);
        resolve();
      }
      if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
        clearTimeout(timer);
        reject(new Error("Realtime subscription failed"));
      }
    });
  });
  assert.equal(
    (
      await db.rpc("staff_command", {
        p_hospital: hospital,
        p_action: "subpriority",
        p_data: {
          encounter_id: registered.data.id,
          sub_priority: 1,
          reason: "Synthetic Realtime delivery verification",
        },
      })
    ).error,
    null,
  );
  const event = await Promise.race([
    received,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Realtime delivery timed out")),
        20000,
      );
    }),
  ]);
  assert.equal(event.new.id, registered.data.id);
  assert.equal(event.new.sub_priority, 1);
  console.log(
    "PASS: authenticated Supabase Realtime delivered the committed encounter update.",
  );
} finally {
  clearTimeout(timer);
  await db.removeChannel(channel);
  await db.auth.signOut({ scope: "local" });
  db.realtime.disconnect();
}
