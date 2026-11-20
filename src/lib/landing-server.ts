import "server-only";
import { cookies } from "next/headers";
import { session } from "./data";
import { hospitalCookie, selectMembership } from "./hospital-selection";
import { landingForRole } from "./landing";
export async function staffLanding() {
  const s = await session();
  if (!s) return "/login";
  return landingForRole(
    selectMembership(
      s.memberships,
      undefined,
      (await cookies()).get(hospitalCookie)?.value,
    ).role,
  );
}
