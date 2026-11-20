export const hospitalCookie = "medcipher-hospital";

export class HospitalAccessError extends Error {}

/** Preferences never grant authority; every choice is checked against live memberships. */
export function selectMembership<T extends { hospital_id: string }>(
  memberships: T[],
  requested?: string,
  preferred?: string,
): T {
  if (requested !== undefined) {
    const match = memberships.find((m) => m.hospital_id === requested);
    if (!match) throw new HospitalAccessError("Hospital access denied.");
    return match;
  }
  const selected =
    memberships.find((m) => m.hospital_id === preferred) ??
    [...memberships].sort((a, b) =>
      a.hospital_id.localeCompare(b.hospital_id),
    )[0];
  if (!selected) throw new HospitalAccessError("Hospital access denied.");
  return selected;
}
