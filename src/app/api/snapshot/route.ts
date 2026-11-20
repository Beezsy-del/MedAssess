import { snapshot } from "@/lib/data";
export async function GET(request: Request) {
  try {
    return Response.json(
      await snapshot(
        new URL(request.url).searchParams.get("hospital") ?? undefined,
      ),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Unable to load hospital. Sign in again or retry." },
      { status: 401 },
    );
  }
}
