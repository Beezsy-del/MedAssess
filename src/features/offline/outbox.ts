import { openDB } from "idb";
export type OutboxItem = {
  id: string;
  hospital: string;
  user: string;
  data: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  error?: string;
};
async function db() {
  return openDB("medcipher-device-capture", 1, {
    upgrade(db) {
      db.createObjectStore("outbox", { keyPath: "id" });
    },
  });
}
export async function listOutbox() {
  return (await db()).getAll("outbox") as Promise<OutboxItem[]>;
}
export async function saveOutbox(item: OutboxItem) {
  await (await db()).put("outbox", item);
}
export async function clearOutbox() {
  await (await db()).clear("outbox");
}
export async function syncOutbox(user: string, hospital: string) {
  const database = await db();
  const items = await listOutbox();
  let synced = 0;
  for (const item of items) {
    if (item.user !== user || item.hospital !== hospital) continue;
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
      if (!response.ok)
        throw new Error(result.error ?? "Synchronization failed");
      await database.delete("outbox", item.id);
      synced++;
    } catch (e) {
      await database.put("outbox", {
        ...item,
        attempts: item.attempts + 1,
        error: e instanceof Error ? e.message : "Connection unavailable",
      });
    }
  }
  return synced;
}
