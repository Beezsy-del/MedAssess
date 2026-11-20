import { readBoundedJson } from "@/lib/request-json";
import { cookies } from "next/headers";
import { z } from "zod";
import { session } from "@/lib/data";
import { hospitalCookie } from "@/lib/hospital-selection";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403, headers });
  let body: unknown;
  try {
    body = await readBoundedJson(request, 1024);
  } catch {
    return Response.json(
      { error: "Request too large or unreadable." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }
  const input = z.strictObject({ hospital: z.uuid() }).safeParse(body);
  if (!input.success)
    return Response.json(
      { error: "Choose a hospital." },
      { status: 400, headers },
    );
  const s = await session();
  if (!s || !s.memberships.some((m) => m.hospital_id === input.data.hospital))
    return Response.json(
      { error: "Hospital access denied." },
      { status: 403, headers },
    );
  (await cookies()).set(hospitalCookie, input.data.hospital, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
  });
  return Response.json({ ok: true }, { headers });
}
