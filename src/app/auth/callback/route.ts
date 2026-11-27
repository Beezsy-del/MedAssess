import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  try {
    if (code) {
      const db = await serverClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL("/update-password", url.origin));
    }
  } catch {
    /* Expired links and provider failures return to a safe sign-in page. */
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
