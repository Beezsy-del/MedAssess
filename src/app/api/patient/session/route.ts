import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { readBoundedJson } from "@/lib/request-json";
import {
  patientRequest,
  patientToken,
} from "@/features/questionnaire/requests";
import { activeReport } from "@/features/questionnaire/model";
import type { Database, Json } from "@/lib/supabase/database.types";
const cookieName = "medcipher-patient-session";
const headers = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
};
const reply = (value: unknown, status = 200) =>
  Response.json(value, { status, headers });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply({ error: "Invalid origin" }, 403);
  let input: unknown;
  try {
    input = await readBoundedJson(request, 55000);
  } catch {
    return reply({ error: "Request too large or unreadable." }, 413);
  }
  const parsed = patientRequest.safeParse(input);
  if (!parsed.success)
    return reply(
      {
        error: parsed.error.issues[0]?.message ?? "Check the required fields.",
      },
      400,
    );
  const data = parsed.data;
  const jar = await cookies();
  if (data.action === "logout") {
    jar.delete(cookieName);
    return reply({ ok: true });
  }
  const token =
    data.action === "open" ? data.token : jar.get(cookieName)?.value;
  if (!patientToken.safeParse(token).success || !token)
    return reply({ error: "Open your private patient pass again." }, 401);
  try {
    const db = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const payload: Json =
      data.action === "draft"
        ? { answers: activeReport(data.answers), step: data.step }
        : data.action === "submit"
          ? {
              answers: activeReport(data.answers),
              operation_id: data.operation_id,
              previous_report_id: data.previous_report_id,
            }
          : {};
    const result = await db.rpc("patient_portal", {
      p_token: token,
      p_action: data.action === "open" ? "status" : data.action,
      p_data: payload,
    });
    if (result.error)
      return reply(
        {
          error:
            result.error.code === "PT409"
              ? "This report changed. Reopen the latest saved report before submitting."
              : "Unable to save. Contact hospital staff directly for assistance.",
        },
        result.error.code === "PT409" ? 409 : 400,
      );
    const value = result.data;
    if (!value || typeof value !== "object" || Array.isArray(value))
      return reply({ error: "Patient service unavailable." }, 502);
    if (typeof value.error === "string")
      return reply(
        { error: value.error },
        value.error.startsWith("Too many") ? 429 : 401,
      );
    if (data.action === "open")
      jar.set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/patient/session",
        maxAge: 60 * 60 * 8,
      });
    return reply(value);
  } catch {
    return reply(
      {
        error:
          "Service unavailable. Ask hospital staff for help. Emergency care must not wait for this form.",
      },
      503,
    );
  }
}
