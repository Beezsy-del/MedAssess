import { serverClient } from "@/lib/supabase/server";
import { z } from "zod";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const db = await serverClient();
  const input = await request.json();
  if (input.action === "logout") {
    await db.auth.signOut();
    return Response.json({ ok: true });
  }
  if (input.action === "demo") {
    if (process.env.DEMO_MODE !== "true")
      return Response.json(
        { error: "Demo access is disabled" },
        { status: 403 },
      );
    const role = z.enum(["doctor", "nurse", "admin"]).safeParse(input.role);
    if (!role.success)
      return Response.json({ error: "Invalid role" }, { status: 400 });
    const email = process.env[`DEMO_${role.data.toUpperCase()}_EMAIL`],
      password = process.env[`DEMO_${role.data.toUpperCase()}_PASSWORD`];
    if (!email || !password)
      return Response.json(
        { error: "Demo account is not configured." },
        { status: 503 },
      );
    const { error } = await db.auth.signInWithPassword({ email, password });
    return Response.json(
      error ? { error: "Demo sign-in unavailable." } : { ok: true },
      { status: error ? 401 : 200 },
    );
  }
  const p = z
    .object({
      email: z.email(),
      password: z.string().min(8).optional(),
      action: z.enum(["login", "reset"]),
    })
    .safeParse(input);
  if (!p.success)
    return Response.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  if (p.data.action === "reset") {
    await db.auth.resetPasswordForEmail(p.data.email, {
      redirectTo: new URL("/auth/callback", request.url).toString(),
    });
    return Response.json({
      ok: true,
      message: "If this account exists, a reset email has been requested.",
    });
  }
  const { error } = await db.auth.signInWithPassword({
    email: p.data.email,
    password: p.data.password ?? "",
  });
  return Response.json(
    error ? { error: "Sign-in failed. Check your credentials." } : { ok: true },
    { status: error ? 401 : 200 },
  );
}
