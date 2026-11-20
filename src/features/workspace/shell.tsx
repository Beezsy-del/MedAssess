"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  ClipboardPlus,
  Stethoscope,
  HeartPulse,
  Workflow,
  BedDouble,
  Building2,
  ArrowRightLeft,
  ChartNoAxesCombined,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  Menu,
  LogOut,
  RefreshCw,
  ChevronDown,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "./context";
import { clearOutbox } from "@/features/offline/outbox";
const nav = [
  [
    "Workspace",
    [
      ["/dashboard", "Overview", LayoutDashboard],
      ["/reception", "Reception", ClipboardPlus],
      ["/triage", "Triage & queues", HeartPulse],
      ["/doctor", "Clinical workspace", Stethoscope],
      ["/emergency-center", "Emergency centre", Activity],
    ],
  ],
  [
    "Hospital operations",
    [
      ["/smartflow", "SmartFlow", Workflow],
      ["/resources", "Beds & resources", BedDouble],
      ["/departments", "Departments", Building2],
      ["/referrals", "Referrals", ArrowRightLeft],
    ],
  ],
  [
    "Management",
    [
      ["/analytics", "Analytics", ChartNoAxesCombined],
      ["/audit", "Audit trail", ShieldCheck],
      ["/settings", "Settings", Settings],
    ],
  ],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const { data, online, message, setMessage, refresh } = useWorkspace();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unread = data.notifications.filter(
    (n) => n.status === "CREATED" || n.status === "ESCALATED",
  ).length;
  async function logout() {
    await clearOutbox();
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="app-shell">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link className="brand" href="/dashboard">
          <span className="brand-symbol">
            <Activity size={25} />
          </span>
          <span>
            MedCipher<small>Connected care. Clear decisions.</small>
          </span>
        </Link>
        <div className="hospital-label">
          <Building2 size={20} />
          <div>
            <strong>{data.hospital.name}</strong>
            <small>{data.hospital.location}</small>
          </div>
          <ChevronDown size={15} />
        </div>
        {nav.map(([group, items]) => (
          <nav key={group} aria-label={group}>
            <p>{group}</p>
            {items.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={
                  path === href ||
                  (href === "/triage" && ["/queues", "/nurse"].includes(path))
                    ? "active"
                    : ""
                }
              >
                <Icon size={18} />
                {label}
                {href === "/emergency-center" &&
                  data.encounters.some((e) => e.emergency) && (
                    <span className="nav-dot" />
                  )}
              </Link>
            ))}
          </nav>
        ))}
        <div className="sidebar-bottom">
          <ShieldCheck size={18} />
          <div>
            <strong>Synthetic demo environment</strong>
            <small>Clinical operations disabled</small>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              onClick={() => setOpen(!open)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Hospital workspace <span>/</span>{" "}
              {path.split("/")[1]?.replaceAll("-", " ")}
            </span>
          </div>
          <div className="topbar-actions">
            <form className="global-search" action="/queues">
              <Search size={16} />
              <input
                name="q"
                aria-label="Search patients"
                placeholder="Find a patient or encounter…"
              />
            </form>
            <button
              className="icon-button"
              aria-label="Refresh data"
              onClick={() =>
                void refresh().catch(() =>
                  setMessage("Refresh failed. Retry when connected."),
                )
              }
            >
              <RefreshCw size={17} />
            </button>
            <Link
              href="/notifications"
              className="notification-button"
              aria-label={`${unread} alerts`}
            >
              <Bell size={19} />
              {unread > 0 && <span>{unread}</span>}
            </Link>
            <Link href="/settings" className="user-chip">
              <span className="avatar">
                {data.membership.display_name
                  .split(" ")
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join("")}
              </span>
              <span>
                {data.membership.display_name}
                <small>{data.membership.role.replaceAll("_", " ")}</small>
              </span>
            </Link>
            <button
              className="icon-button"
              onClick={() => void logout()}
              aria-label="Log out and clear local drafts"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {!online && (
          <div className="connection-banner">
            <WifiOff size={17} />
            Offline. Registration drafts stay on this device. Emergency
            communication requires direct staff assistance.
          </div>
        )}
        <main id="main">{children}</main>
        <footer className="workspace-footer">
          <span>MedCipher · Clinical workflow prototype</span>
          <span>Unvalidated demo protocol · Asia/Kolkata</span>
        </footer>
      </div>
      {message && (
        <div className="toast" role="status">
          {message}
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
