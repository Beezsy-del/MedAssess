import { canVisit } from "@/features/access/policy";
import { hospitalCookie, selectMembership } from "@/lib/hospital-selection";
import type { Database } from "@/lib/supabase/database.types";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    /^\/patient(?:\/|$)/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api/patient/") ||
    request.nextUrl.pathname === "/emergency"
  )
    return response;
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const { data } = await client.auth.getClaims();
  const section = request.nextUrl.pathname.split("/")[1];
  if (
    data?.claims &&
    [
      "dashboard",
      "registration",
      "reception",
      "patients",
      "nurse",
      "doctor",
      "triage",
      "queues",
      "encounters",
      "smartflow",
      "resources",
      "beds",
      "departments",
      "referrals",
      "analytics",
      "forecasting",
      "settings",
      "audit",
      "notifications",
      "staff",
      "protocols",
    ].includes(section)
  ) {
    const memberships = await client
      .from("hospital_memberships")
      .select("hospital_id,role")
      .eq("user_id", data.claims.sub)
      .eq("active", true);
    if (memberships.error)
      return new NextResponse(
        "Access verification unavailable. Please retry.",
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    const member = memberships.data.length
      ? selectMembership(
          memberships.data,
          undefined,
          request.cookies.get(hospitalCookie)?.value,
        )
      : null;
    if (!member || !canVisit(member.role, request.nextUrl.pathname)) {
      const denied = new NextResponse(
        "Access denied: your hospital role cannot open this workspace.",
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
      for (const cookie of response.cookies.getAll())
        denied.cookies.set(cookie);
      return denied;
    }
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|.*\\.(?:svg|png|webmanifest)$).*)",
  ],
};
