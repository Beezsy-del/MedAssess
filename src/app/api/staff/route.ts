import { z } from "zod";
import { staffPasswordSchema } from "@/features/access/staff-password";
import { createClient } from "@supabase/supabase-js";
import { session } from "@/lib/data";
import { readBoundedJson } from "@/lib/request-json";
import { isAdministrator } from "@/features/access/policy";
import type { Database } from "@/lib/supabase/database.types";
const schema = z.strictObject({
  hospital: z.uuid(),
  email: z.email().max(320),
  password: staffPasswordSchema,
  display_name: z.string().trim().min(2).max(160),
  role: z.enum([
    "doctor",
    "nurse",
    "triage_nurse",
    "receptionist",
    "resource_manager",
    "emergency_coordinator",
  ]),
  operation_id: z.uuid(),
});
const reply = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply({ error: "Invalid origin" }, 403);
  let body: unknown;
  try {
    body = await readBoundedJson(request, 4096);
  } catch {
    return reply({ error: "Invalid request" }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return reply(
      {
        error:
          parsed.error.issues.find((issue) => issue.path[0] === "password")
            ?.message ?? "Check the email and staff name.",
      },
      400,
    );
  const s = await session();
  const input = parsed.data;
  const membership = s?.memberships.find(
    (m) => m.hospital_id === input.hospital,
  );
  if (!s || !membership || !isAdministrator(membership.role))
    return reply({ error: "Administrator access required" }, 403);
  const hospital = await s.db
    .from("hospitals")
    .select("is_demo")
    .eq("id", input.hospital)
    .single();
  if (hospital.error || !hospital.data.is_demo)
    return reply(
      {
        error:
          "Account provisioning is restricted to synthetic demonstrations.",
      },
      403,
    );
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret)
    return reply(
      {
        error:
          "Account provisioning is not configured. Ask the authorized Supabase administrator to create the account.",
      },
      503,
    );
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const created = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (created.error || !created.data.user)
    return reply(
      {
        error:
          "Account could not be created. Check whether the address already has an account.",
      },
      400,
    );
  const result = await s.db.rpc("staff_command", {
    p_hospital: input.hospital,
    p_action: "staff_add",
    p_data: {
      operation_id: input.operation_id,
      user_id: created.data.user.id,
      role: input.role,
      display_name: input.display_name,
      reason: "Administrator created a synthetic staff account",
    },
  });
  if (result.error) {
    const cleanup = await admin.auth.admin.deleteUser(created.data.user.id);
    return reply(
      {
        error: cleanup.error
          ? "Membership failed and the unassigned account requires administrator cleanup."
          : "Membership failed; the new account was removed. Retry after checking hospital permissions.",
      },
      400,
    );
  }
  return reply({ ok: true, user_id: created.data.user.id });
}
