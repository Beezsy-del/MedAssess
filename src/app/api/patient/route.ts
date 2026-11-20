import { readBoundedJson } from "@/lib/request-json";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/lib/supabase/database.types";
const schema = z.strictObject({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.enum(["status", "intake", "emergency"]),
  data: z.record(z.string(), z.json()).default({}),
});
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  let input: unknown;
  try {
    input = await readBoundedJson(request, 25000);
  } catch {
    return Response.json(
      { error: "Request too large or unreadable." },
      { status: 413 },
    );
  }
  const p = schema.safeParse(input);
  if (!p.success)
    return Response.json(
      { error: "Link unavailable or input invalid." },
      { status: 400 },
    );
  try {
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
        status: error
          ? 400
          : data &&
              typeof data === "object" &&
              !Array.isArray(data) &&
              typeof data.error === "string"
            ? data.error.startsWith("Too many")
              ? 429
              : 400
            : 200,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      },
    );
  } catch {
    return Response.json(
      {
        error:
          "Service unavailable. Contact hospital staff directly for assistance.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      },
    );
  }
}
