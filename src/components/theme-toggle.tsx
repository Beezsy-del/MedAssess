"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
const eventName = "medcipher-theme-change";
function subscribe(notify: () => void) {
  window.addEventListener(eventName, notify);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "medcipher-theme") return;
    document.documentElement.dataset.theme =
      event.newValue === "dark" ? "dark" : "light";
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(eventName, notify);
    window.removeEventListener("storage", onStorage);
  };
}
function snapshot() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={
        theme === "dark"
          ? "Dark theme: Switch to light theme"
          : "Light theme: Switch to dark theme"
      }
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("medcipher-theme", next);
        } catch {
          /* Device preference is optional. */
        }
        window.dispatchEvent(new Event(eventName));
      }}
    >
      {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
