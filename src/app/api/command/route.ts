import { readBoundedJson } from "@/lib/request-json";
import { z } from "zod";
import { session } from "@/lib/data";
import type { Json } from "@/lib/supabase/database.types";
const schema = z.object({
  hospital: z.uuid(),
  action: z.enum([
    "register",
    "assess",
    "transition",
    "note",
    "reserve",
    "release",
    "alert",
    "referral",
    "referral_status",
    "token",
    "settings",
    "department",
    "resource",
    "facility",
    "shift",
  ]),
  data: z.record(z.string(), z.json()),
});
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  let body: unknown;
  try {
    body = await readBoundedJson(request, 40000);
  } catch {
    return Response.json(
      { error: "Request too large or unreadable." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check the required fields." },
      { status: 400 },
    );
  const s = await session();
  if (!s || !s.memberships.some((m) => m.hospital_id === parsed.data.hospital))
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await s.db.rpc("staff_command", {
    p_hospital: parsed.data.hospital,
    p_action: parsed.data.action,
    p_data: parsed.data.data as Json,
  });
  if (error)
    return Response.json(
      {
        error:
          error.code === "PT409"
            ? "Conflict: record changed. Refresh and review."
            : error.message,
      },
      { status: error.code === "PT409" ? 409 : 400 },
    );
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
