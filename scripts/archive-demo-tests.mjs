import { createClient } from "@supabase/supabase-js";
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
const { error: authError } = await client.auth.signInWithPassword({
  email: process.env.DEMO_ADMIN_EMAIL,
  password: process.env.DEMO_ADMIN_PASSWORD,
});
if (authError) throw new Error("Demo administrator sign-in failed");
const { data: memberships } = await client
  .from("hospital_memberships")
  .select("hospital_id");
const { data, error } = await client.rpc("archive_demo_tests", {
  p_hospital: memberships[0].hospital_id,
});
if (error) throw new Error(error.message);
console.log(
  `Archived ${data} synthetic test encounters; all histories retained.`,
);
