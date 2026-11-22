"use client";
import Link from "next/link";
import { canVisit } from "@/features/access/policy";
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
  WifiOff,
  ChevronDown,
  Grid2X2,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "./context";
import { clearOutbox } from "@/features/offline/outbox";
import { Modal } from "@/components/ui";
import { Brand } from "@/components/chrome";
import { ThemeToggle } from "@/components/theme-toggle";
const nav = [
  [
    "Workspace",
    [
      ["/dashboard", "Overview", LayoutDashboard],
      ["/registration", "Patient registration", ClipboardPlus],
      ["/nurse", "Nursing queue", HeartPulse],
      ["/patients", "Patient directory", ClipboardPlus],
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
      ["/staff", "Staff access", ShieldCheck],
      ["/protocols", "Reviewed protocols", ShieldCheck],
    ],
  ],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const { data, online, message, setMessage, refresh, busy } = useWorkspace();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  async function switchHospital(hospital: string) {
    if (hospital === data.hospital.id) return;
    setSwitching(true);
    try {
      const response = await fetch("/api/hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital }),
      });
      if (!response.ok)
        throw new Error(
          "Hospital switch failed. Refresh and check your access.",
        );
      // A new document clears forms, old requests and prefetched tenant pages.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- tenant switch must discard the entire previous workspace and router cache
      window.location.assign("/");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Hospital switch failed.",
      );
      setSwitching(false);
    }
  }
  const unread = data.notifications.filter(
    (n) => n.status === "CREATED" || n.status === "ESCALATED",
  ).length;
  async function logout() {
    await clearOutbox();
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    if (!response.ok) {
      setMessage(
        "Sign-out failed. Your local drafts were cleared; retry sign-out when connected.",
      );
      return;
    }
    router.push("/login");
    router.refresh();
  }
  const current =
    nav
      .map(([, items]) => items.find(([href]) => href === path)?.[1])
      .find(Boolean) ??
    (path.startsWith("/encounters") ? "Encounter" : "Workspace");
  return (
    <div className="app-shell">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-left">
          <Brand
            href={
              data.membership.role === "triage_nurse" ||
              data.membership.role === "nurse"
                ? "/registration"
                : "/dashboard"
            }
          />
          <button
            className="workspace-trigger"
            aria-label="Open navigation: Workspace"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <Grid2X2 size={17} />
            <span>Workspace</span>
            <ChevronDown size={14} />
          </button>
          <span className="breadcrumb">
            <span>/</span>
            {current}
          </span>
        </div>
        <div className="topbar-actions">
          <form className="global-search" action="/queues">
            <Search size={16} />
            <input
              name="q"
              aria-label="Search patients"
              placeholder="Find an encounter…"
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
            <Bell size={18} />
            {unread > 0 && <span>{unread}</span>}
          </Link>
          <ThemeToggle />
          <span className="environment-label">
            <ShieldCheck size={14} />
            Synthetic demo
          </span>
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
            onClick={() =>
              void logout().catch(() =>
                setMessage("Sign-out unavailable. Retry when connected."),
              )
            }
            aria-label="Log out and clear local drafts"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="workspace">
        {!online && (
          <div className="connection-banner">
            <WifiOff size={17} />
            Offline. Registration drafts stay on this device. Emergency
            communication requires direct staff assistance.
          </div>
        )}
        <main id="main">
          <div className="hospital-context">
            <Building2 size={15} />
            <span>{data.hospital.name}</span>
            <span className="hospital-location">{data.hospital.location}</span>
            <span className="clinical-lock">
              <ShieldCheck size={13} />
              Clinical operations disabled
            </span>
          </div>
          {children}
          <details className="snapshot-note">
            <summary>
              Data coverage: active encounters and recent history
            </summary>
            <p>{data.coverage}</p>
          </details>
        </main>
        <footer className="workspace-footer">
          <span>
            <Activity size={14} />
            MedCipher
          </span>
          <span>Synthetic data only. Unvalidated clinical protocol.</span>
          <span>Hospital workspace</span>
        </footer>
      </div>
      <nav className="workspace-dock" aria-label="Quick navigation">
        {(
          [
            ["/dashboard", "Overview", LayoutDashboard],
            [
              data.membership.role === "triage_nurse" ||
              data.membership.role === "nurse"
                ? "/registration"
                : "/reception",
              data.membership.role === "triage_nurse" ||
              data.membership.role === "nurse"
                ? "Register"
                : "Reception",
              ClipboardPlus,
            ],
            ["/doctor", "Clinical", Stethoscope],
            ["/resources", "Resources", BedDouble],
          ] as const
        )
          .filter(([href]) => canVisit(data.membership.role, href))
          .map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          ))}
        <button
          onClick={() => setOpen(true)}
          aria-label="More workspaces"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
      {open && (
        <Modal title="Workspace navigation" onClose={() => setOpen(false)}>
          <div className="navigation-hospital">
            <Building2 size={22} />
            <div>
              {data.hospitals.length > 1 ? (
                <select
                  aria-label="Selected hospital"
                  value={data.hospital.id}
                  disabled={!online || busy || switching}
                  onChange={(event) => void switchHospital(event.target.value)}
                >
                  {data.hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              ) : (
                <strong>{data.hospital.name}</strong>
              )}
              <p>{data.hospital.location}</p>
            </div>
          </div>
          <div className="navigation-grid">
            {nav
              .filter(([, items]) =>
                items.some(([href]) => canVisit(data.membership.role, href)),
              )
              .map(([group, items]) => (
                <nav key={group} aria-label={group}>
                  <h3>{group}</h3>
                  {items
                    .filter(([href]) => canVisit(data.membership.role, href))
                    .map(([href, label, Icon]) => (
                      <Link
                        href={href}
                        key={href}
                        aria-current={path === href ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                      </Link>
                    ))}
                </nav>
              ))}
          </div>
          <div className="navigation-footer">
            <ShieldCheck size={15} />
            Synthetic demo. Clinical operations disabled.
          </div>
        </Modal>
      )}
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
