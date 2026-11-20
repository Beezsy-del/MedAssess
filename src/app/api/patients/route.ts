import { z } from "zod";
import { session } from "@/lib/data";
import { readBoundedJson } from "@/lib/request-json";
const schema = z.strictObject({
  hospital: z.uuid(),
  query: z.string().trim().min(2).max(160),
});
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403, headers });
  try {
    const body = schema.safeParse(await readBoundedJson(request, 2048));
    if (!body.success)
      return Response.json(
        { error: "Enter at least two characters." },
        { status: 400, headers },
      );
    const s = await session();
    const membership = s?.memberships.find(
      (m) => m.hospital_id === body.data.hospital,
    );
    if (
      !s ||
      !membership ||
      !["triage_nurse", "nurse", "doctor", "receptionist"].includes(
        membership.role,
      )
    )
      return Response.json(
        { error: "Patient lookup is not available for this role." },
        { status: 403, headers },
      );
    const { data, error } = await s.db.rpc("find_patients", {
      p_hospital: body.data.hospital,
      p_query: body.data.query,
    });
    if (error)
      return Response.json(
        { error: "Patient search unavailable. Keep your entries and retry." },
        { status: 503, headers },
      );
    return Response.json(
      { patients: data.slice(0, 25), hasMore: data.length > 25 },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Patient search unavailable. Retry when connected." },
      { status: 503, headers },
    );
  }
}
