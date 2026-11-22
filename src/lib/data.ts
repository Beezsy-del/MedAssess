import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { hospitalCookie, selectMembership } from "./hospital-selection";
import { serverClient } from "./supabase/server";
import type { WorkspaceRows } from "@/features/workspace/snapshot-model";
import type { Database } from "./supabase/database.types";
export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export const session = cache(async function session() {
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: memberships, error } = await db
    .from("hospital_memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true);
  if (error || !memberships?.length) return null;
  return { db, user, memberships };
});
export class AuthenticationRequiredError extends Error {}
export async function snapshot(hospitalId?: string) {
  const s = await session();
  if (!s)
    throw new AuthenticationRequiredError(
      "Sign in with an authorized hospital account.",
    );
  const membership = selectMembership(
    s.memberships,
    hospitalId,
    (await cookies()).get(hospitalCookie)?.value,
  );
  const h = membership.hospital_id;
  const [response, hospitals] = await Promise.all([
    s.db.rpc("workspace_snapshot", { p_hospital: h }),
    s.db
      .from("hospitals")
      .select("id, name")
      .in(
        "id",
        s.memberships.map((m) => m.hospital_id),
      )
      .order("name"),
  ]);
  if (
    response.error ||
    hospitals.error ||
    !response.data ||
    typeof response.data !== "object" ||
    Array.isArray(response.data)
  )
    throw new Error(
      "Hospital data could not be loaded. Retry or contact your administrator.",
    );
  // This contract is produced by workspace_snapshot, under the caller's RLS.
  const rows = response.data as unknown as WorkspaceRows;
  if (!rows.hospital || !rows.settings || !Array.isArray(rows.encounters))
    throw new Error("Hospital configuration is incomplete.");
  return {
    ...rows,
    coverage:
      "Up to 10,000 permitted encounters; latest 1,000 history records per type. Not a full longitudinal export.",
    userId: s.user.id,
    membership,
    memberships: s.memberships,
    hospitals: hospitals.data,
    loadedAt: new Date().toISOString(),
  };
}
export type Snapshot = Awaited<ReturnType<typeof snapshot>>;
