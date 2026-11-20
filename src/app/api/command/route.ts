import { readBoundedJson } from "@/lib/request-json";
import { actionSchemas, commandEnvelope } from "@/features/commands/schema";
import { session } from "@/lib/data";
import type { Json } from "@/lib/supabase/database.types";
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
  const parsed = commandEnvelope.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check the required fields." },
      { status: 400 },
    );
  const payload = actionSchemas[parsed.data.action].safeParse(parsed.data.data);
  if (!payload.success)
    return Response.json(
      {
        error:
          payload.error.issues[0]?.message ??
          "Check the required fields and values.",
      },
      { status: 400 },
    );
  const s = await session();
  if (!s || !s.memberships.some((m) => m.hospital_id === parsed.data.hospital))
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await s.db.rpc("staff_command", {
    p_hospital: parsed.data.hospital,
    p_action: parsed.data.action,
    p_data: payload.data as Json,
  });
  if (error)
    return Response.json(
      {
        code: error.code,
        error:
          error.code === "PT422"
            ? "Possible existing patient. Search and verify the matching record, or document why this is a different person."
            : error.code === "PT423"
              ? "This patient has an active visit. Resume it, or explain why a new encounter is needed."
              : error.code === "23505"
                ? "This patient identifier already exists. Search for and select that patient."
                : error.code === "PT409"
                  ? "Conflict: record changed. Refresh and review."
                  : error.code === "42501"
                    ? "Your role cannot perform this action."
                    : "Action rejected. Check the record state, required details and permissions.",
      },
      {
        status:
          error.code === "PT409" ? 409 : error.code === "42501" ? 403 : 400,
      },
    );
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
