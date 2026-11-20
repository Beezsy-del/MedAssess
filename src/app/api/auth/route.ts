import { serverClient } from "@/lib/supabase/server";
import { readBoundedJson } from "@/lib/request-json";
import { z } from "zod";
const schema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("logout") }),
  z.strictObject({
    action: z.literal("demo"),
    role: z.enum(["doctor", "nurse", "admin"]),
  }),
  z.strictObject({
    action: z.literal("login"),
    email: z.email().max(320),
    password: z.string().min(8).max(1024),
  }),
  z.strictObject({ action: z.literal("reset"), email: z.email().max(320) }),
]);
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  let body: unknown;
  try {
    body = await readBoundedJson(request, 4096);
  } catch {
    return Response.json(
      { error: "Request too large or unreadable." },
      { status: 413 },
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check your sign-in details." },
      { status: 400 },
    );
  const input = parsed.data;
  try {
    const db = await serverClient();
    if (input.action === "logout") {
      const { error } = await db.auth.signOut({ scope: "local" });
      if (error)
        return Response.json(
          { error: "Sign-out could not be completed. Please retry." },
          { status: 503 },
        );
      return Response.json({ ok: true });
    }
    if (input.action === "demo") {
      if (process.env.DEMO_MODE !== "true")
        return Response.json(
          { error: "Demo access is disabled" },
          { status: 403 },
        );
      const email = process.env[`DEMO_${input.role.toUpperCase()}_EMAIL`];
      const password = process.env[`DEMO_${input.role.toUpperCase()}_PASSWORD`];
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
    if (input.action === "reset") {
      const { error } = await db.auth.resetPasswordForEmail(input.email, {
        redirectTo: new URL("/auth/callback", request.url).toString(),
      });
      if (error)
        return Response.json(
          { error: "Recovery request unavailable. Please retry later." },
          { status: 503 },
        );
      return Response.json({
        ok: true,
        message: "If this account exists, a reset email has been requested.",
      });
    }
    const { error } = await db.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    return Response.json(
      error
        ? { error: "Sign-in failed. Check your credentials." }
        : { ok: true },
      { status: error ? 401 : 200 },
    );
  } catch {
    return Response.json(
      { error: "Authentication service unavailable. Please retry." },
      { status: 503 },
    );
  }
}
