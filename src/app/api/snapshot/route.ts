import { HospitalAccessError } from "@/lib/hospital-selection";
import { snapshot } from "@/lib/data";
export async function GET(request: Request) {
  try {
    return Response.json(
      await snapshot(
        new URL(request.url).searchParams.get("hospital") ?? undefined,
      ),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: "Unable to load hospital. Sign in again or retry." },
      {
        status: error instanceof HospitalAccessError ? 403 : 401,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
