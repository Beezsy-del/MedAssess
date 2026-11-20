import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/lib/supabase/database.types";
const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.enum(["status", "intake", "emergency"]),
  data: z.record(z.string(), z.json()).default({}),
});
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.text();
  if (body.length > 25000)
    return Response.json({ error: "Request too large" }, { status: 413 });
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const p = schema.safeParse(input);
  if (!p.success)
    return Response.json(
      { error: "Link unavailable or input invalid." },
      { status: 400 },
    );
  const db = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await db.rpc("patient_portal", {
    p_token: p.data.token,
    p_action: p.data.action,
    p_data: p.data.data as Json,
  });
  return Response.json(
    error
      ? { error: "Unable to process this link. Ask reception for help." }
      : data,
    {
      status: error ? 400 : 200,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
