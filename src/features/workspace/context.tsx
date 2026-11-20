"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import type { Snapshot } from "@/lib/data";
import { browserClient } from "@/lib/supabase/browser";
export type CommandData = Record<string, unknown>;
type Workspace = {
  data: Snapshot;
  refresh: () => Promise<void>;
  command: (
    action: string,
    payload: CommandData,
  ) => Promise<Record<string, unknown>>;
  busy: boolean;
  online: boolean;
  message: string;
  setMessage: (s: string) => void;
};
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({
  initial,
  children,
}: {
  initial: Snapshot;
  children: React.ReactNode;
}) {
  const [data, setData] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [online, setOnline] = useState(true);
  const refreshSequence = useRef(0);
  const latestRefresh = useRef<Promise<void> | null>(null);
  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    const pending = (async () => {
      const response = await fetch(
        `/api/snapshot?hospital=${data.hospital.id}`,
        {
          cache: "no-store",
        },
      );
      if (!response.ok)
        throw new Error(
          "Unable to refresh. Check your connection or sign in again.",
        );
      const next = await response.json();
      if (sequence === refreshSequence.current) setData(next);
    })();
    latestRefresh.current = pending;
    await pending;
    // A command cannot finish on an ignored response: wait for the newer
    // snapshot before allowing the next versioned mutation.
    let settled = pending;
    while (latestRefresh.current && latestRefresh.current !== settled) {
      settled = latestRefresh.current;
      await settled;
    }
  }, [data.hospital.id]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    const db = browserClient();
    const reload = () =>
      void refresh().catch(() =>
        setMessage("Live refresh paused. Retry when connected."),
      );
    const channel = db
      .channel(`hospital-${data.hospital.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_encounters",
          filter: `hospital_id=eq.${data.hospital.id}`,
        },
        reload,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `hospital_id=eq.${data.hospital.id}`,
        },
        reload,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hospital_resources",
          filter: `hospital_id=eq.${data.hospital.id}`,
        },
        reload,
      )
      .subscribe();
    const timer = setInterval(reload, 30000);
    window.addEventListener("online", reload);
    return () => {
      void db.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener("online", reload);
    };
  }, [data.hospital.id, refresh]);
  const command = async (action: string, payload: CommandData) => {
    setBusy(true);
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital: data.hospital.id,
          action,
          data: payload,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new CommandError(
          result.error ?? "Action failed",
          response.status,
          result.code,
        );
      try {
        await refresh();
        setMessage("Saved to hospital records.");
      } catch {
        setMessage(
          "Saved to hospital records. Refresh when the connection returns.",
        );
      }
      return result;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed.");
      throw e;
    } finally {
      setBusy(false);
    }
  };
  return (
    <Context.Provider
      value={{ data, refresh, command, busy, online, message, setMessage }}
    >
      {children}
    </Context.Provider>
  );
}
export class CommandError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace context missing");
  return context;
}
