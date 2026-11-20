import { openDB } from "idb";
import { createDeviceKey, openDraft, sealDraft } from "./crypto";
export type OutboxItem = {
  id: string;
  hospital: string;
  user: string;
  data: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  error?: string;
};
type StoredDraft = Omit<OutboxItem, "data"> & {
  iv: Uint8Array<ArrayBuffer>;
  ciphertext: ArrayBuffer;
};
async function db() {
  return openDB("medcipher-device-capture", 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("outbox"))
        db.createObjectStore("outbox", { keyPath: "id" });
      if (!db.objectStoreNames.contains("keys")) db.createObjectStore("keys");
    },
  });
}
let serial: Promise<unknown> = Promise.resolve();
async function exclusively<T>(action: () => Promise<T>): Promise<T> {
  if (navigator.locks)
    return await navigator.locks.request("medcipher-outbox", action);
  const next = serial.then(action, action);
  serial = next.catch(() => {});
  return next;
}
async function deviceKey() {
  const database = await db();
  const existing = await database.get("keys", "device");
  if (existing) return existing as CryptoKey;
  const candidate = await createDeviceKey();
  const tx = database.transaction("keys", "readwrite");
  const key = (await tx.store.get("device")) ?? candidate;
  await tx.store.put(key, "device");
  await tx.done;
  return key as CryptoKey;
}
const scope = (item: Pick<OutboxItem, "id" | "user" | "hospital">) =>
  `${item.id}:${item.user}:${item.hospital}`;
async function write(item: OutboxItem) {
  const { data, ...metadata } = item;
  const sealed = await sealDraft(await deviceKey(), data, scope(item));
  await (await db()).put("outbox", { ...metadata, ...sealed });
}
async function read(user?: string, hospital?: string) {
  const rows = (await (await db()).getAll("outbox")) as (
    StoredDraft | OutboxItem
  )[];
  const result: OutboxItem[] = [];
  for (const row of rows) {
    if ((user && row.user !== user) || (hospital && row.hospital !== hospital))
      continue;
    if ("data" in row) {
      // Preserve and encrypt legacy drafts on first access, never discard a failed draft.
      await write(row);
      result.push(row);
    } else {
      const { iv, ciphertext, ...metadata } = row;
      result.push({
        ...metadata,
        data: await openDraft(
          await deviceKey(),
          { iv, ciphertext },
          scope(row),
        ),
      });
    }
  }
  return result;
}
export function listOutbox(user?: string, hospital?: string) {
  return exclusively(() => read(user, hospital));
}
export function saveOutbox(item: OutboxItem) {
  return exclusively(() => write(item));
}
export function clearOutbox() {
  return exclusively(async () => {
    const tx = (await db()).transaction(["outbox", "keys"], "readwrite");
    await Promise.all([
      tx.objectStore("outbox").clear(),
      tx.objectStore("keys").clear(),
    ]);
    await tx.done;
  });
}
export function syncOutbox(user: string, hospital: string) {
  return exclusively(async () => {
    const database = await db();
    const items = await read(user, hospital);
    let synced = 0,
      failed = 0;
    for (const item of items) {
      try {
        const response = await fetch("/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hospital: item.hospital,
            action: "register",
            data: { ...item.data, operation_id: item.id },
          }),
        });
        const result = await response.json();
        if (!response.ok || result.error)
          throw new Error(
            "Registration not confirmed; draft retained for retry.",
          );
        if (typeof result.id !== "string")
          throw new Error("Server acknowledgement missing; draft retained.");
        await database.delete("outbox", item.id);
        synced++;
      } catch {
        failed++;
        // Another tab without Web Locks may already have synchronized this item.
        if (await database.get("outbox", item.id))
          await write({
            ...item,
            attempts: item.attempts + 1,
            error:
              "Synchronization failed. Draft retained; retry when connected.",
          });
      }
    }
    return { synced, failed };
  });
}
