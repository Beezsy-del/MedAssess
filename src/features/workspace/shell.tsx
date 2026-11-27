"use client";
import NextLink from "next/link";
import { canVisit } from "@/features/access/policy";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  RefreshCw,
  WifiOff,
  ChevronDown,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWorkspace } from "./context";
import { clearOutbox } from "@/features/offline/outbox";
import { Modal } from "@/components/ui";
import { Brand } from "@/components/chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AcuityShieldIcon,
  AnalyticsTrendIcon,
  AuditSealIcon,
  BedBayIcon,
  DepartmentUnitIcon,
  EmergencyBeaconIcon,
  FlowJunctionIcon,
  MediRouteLogo,
  OverviewPulseIcon,
  PatientIntakeIcon,
  ReceptionDeskIcon,
  ReferralTransferIcon,
  StethoscopeCrossIcon,
} from "@/components/icons";

function Link(props: React.ComponentProps<typeof NextLink>) {
  const { data } = useWorkspace();
  if (
    typeof props.href === "string" &&
    !canVisit(data.membership.role, props.href)
  )
    return null;
  return <NextLink {...props} />;
}

const nav = [
  [
    "Workspace",
    [
      ["/dashboard", "Overview", OverviewPulseIcon],
      ["/registration", "Patient registration", PatientIntakeIcon],
      ["/reception", "Reception", ReceptionDeskIcon],
      ["/triage", "Triage & queues", AcuityShieldIcon],
      ["/doctor", "Clinical workspace", StethoscopeCrossIcon],
      ["/emergency-center", "Emergency centre", EmergencyBeaconIcon],
    ],
  ],
  [
    "Hospital operations",
    [
      ["/smartflow", "SmartFlow", FlowJunctionIcon],
      ["/resources", "Beds & resources", BedBayIcon],
      ["/departments", "Departments", DepartmentUnitIcon],
      ["/referrals", "Referrals", ReferralTransferIcon],
    ],
  ],
  [
    "Management",
    [
      ["/analytics", "Analytics", AnalyticsTrendIcon],
      ["/audit", "Audit trail", AuditSealIcon],
      ["/settings", "Settings", Settings],
      ["/staff", "Staff access", ShieldCheck],
      ["/protocols", "Reviewed protocols", ShieldCheck],
    ],
  ],
] as const;

function resolveBreadcrumb(path: string) {
  for (const [, items] of nav) {
    const match = items.find(([href]) => href === path);
    if (match) return match[1];
  }
  if (path.startsWith("/encounters")) return "Encounter";
  if (path.startsWith("/beds")) return "Beds & resources";
  if (path.startsWith("/notifications")) return "Response & notifications";
  if (path.startsWith("/queues")) return "Triage & queues";
  if (path.startsWith("/nurse")) return "Nursing workspace";
  if (path.startsWith("/forecasting")) return "Analytics & forecasting";
  if (path.startsWith("/settings/triage-protocol")) return "Clinical protocols";
  if (path.startsWith("/settings/staff")) return "Staff & shifts";
  if (path.startsWith("/settings")) return "Settings";
  return "Workspace";
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { data, online, message, setMessage, refresh, busy } = useWorkspace();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const refreshing = refreshCount > 0;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

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

  async function handleRefresh() {
    setRefreshCount((c) => c + 1);
    try {
      await refresh();
    } catch {
      setMessage("Refresh failed. Retry when connected.");
    } finally {
      setRefreshCount((c) => Math.max(0, c - 1));
    }
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
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
    } catch {
      setMessage("Sign-out unavailable. Retry when connected.");
    } finally {
      setLoggingOut(false);
    }
  }

  const isNurse =
    data.membership.role === "triage_nurse" || data.membership.role === "nurse";
  const current = resolveBreadcrumb(path);

  return (
    <div className="app-shell">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-left">
          <Brand href={isNurse ? "/registration" : "/dashboard"} />
          <button
            type="button"
            className="workspace-trigger"
            aria-label="Open navigation: Workspace"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <LayoutGrid size={15} />
            <span>Workspace</span>
            <ChevronDown size={14} />
          </button>
          <span className="breadcrumb">
            <span aria-hidden="true">/</span>
            {current}
          </span>
        </div>
        <div className="topbar-actions">
          <form className="global-search" action="/queues">
            <Search size={15} aria-hidden="true" />
            <input
              name="q"
              aria-label="Search patients"
              placeholder="Find an encounter…"
            />
          </form>
          <button
            type="button"
            className={`icon-button ${refreshing ? "is-spinning" : ""}`}
            aria-label="Refresh data"
            onClick={() => void handleRefresh()}
          >
            <RefreshCw size={17} />
          </button>
          <Link
            href="/notifications"
            className="notification-button"
            aria-label={`${unread} alerts`}
          >
            <Bell size={17} />
            {unread > 0 && <span>{unread}</span>}
          </Link>
          <ThemeToggle />
          <span className="environment-label">
            <ShieldCheck size={14} />
            Synthetic demo
          </span>
          <Link href="/settings" className="user-chip">
            <span className="avatar" aria-hidden="true">
              {data.membership.display_name
                .split(" ")
                .slice(0, 2)
                .map((x) => x[0])
                .join("")}
            </span>
            <span>
              <strong>{data.membership.display_name}</strong>
              <small>{data.membership.role.replaceAll("_", " ")}</small>
            </span>
          </Link>
          <button
            type="button"
            className="icon-button"
            disabled={loggingOut}
            onClick={() => void logout()}
            aria-label="Log out and clear local drafts"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="shell-body">
        <nav className="workspace-dock" aria-label="Quick navigation">
          <div className="rail-group">
            <span className="rail-group-label">Care & queues</span>
            <Link
              href="/dashboard"
              aria-current={path === "/dashboard" ? "page" : undefined}
            >
              <OverviewPulseIcon size={18} />
              <span>Overview</span>
            </Link>
            <Link
              href={isNurse ? "/registration" : "/reception"}
              aria-current={
                path === (isNurse ? "/registration" : "/reception")
                  ? "page"
                  : undefined
              }
            >
              <PatientIntakeIcon size={18} />
              <span>{isNurse ? "Register" : "Reception"}</span>
            </Link>
            {!isNurse && (
              <Link
                href="/registration"
                className="rail-desktop-only"
                aria-current={path === "/registration" ? "page" : undefined}
              >
                <ReceptionDeskIcon size={18} />
                <span>Nursing intake</span>
              </Link>
            )}
            <Link
              href="/triage"
              className="rail-desktop-only"
              aria-current={
                path === "/triage" || path === "/queues" ? "page" : undefined
              }
            >
              <AcuityShieldIcon size={18} />
              <span>Triage queue</span>
            </Link>
            <Link
              href="/doctor"
              aria-current={path === "/doctor" ? "page" : undefined}
            >
              <StethoscopeCrossIcon size={18} />
              <span>Clinical</span>
            </Link>
            <Link
              href="/emergency-center"
              className="rail-desktop-only"
              aria-current={
                path === "/emergency-center" || path === "/notifications"
                  ? "page"
                  : undefined
              }
            >
              <EmergencyBeaconIcon size={18} />
              <span>Alerts</span>
              {unread > 0 && <span className="rail-badge">{unread}</span>}
            </Link>
          </div>

          <div className="rail-group">
            <span className="rail-group-label">Operations</span>
            <Link
              href="/smartflow"
              className="rail-desktop-only"
              aria-current={path === "/smartflow" ? "page" : undefined}
            >
              <FlowJunctionIcon size={18} />
              <span>Flow board</span>
            </Link>
            <Link
              href="/resources"
              aria-current={
                path === "/resources" || path.startsWith("/beds")
                  ? "page"
                  : undefined
              }
            >
              <BedBayIcon size={18} />
              <span>Resources</span>
            </Link>
            <Link
              href="/departments"
              className="rail-desktop-only"
              aria-current={path === "/departments" ? "page" : undefined}
            >
              <DepartmentUnitIcon size={18} />
              <span>Departments</span>
            </Link>
            <Link
              href="/referrals"
              className="rail-desktop-only"
              aria-current={path === "/referrals" ? "page" : undefined}
            >
              <ReferralTransferIcon size={18} />
              <span>Referrals</span>
            </Link>
          </div>

          <div className="rail-group">
            <span className="rail-group-label">Management</span>
            <Link
              href="/analytics"
              className="rail-desktop-only"
              aria-current={path === "/analytics" ? "page" : undefined}
            >
              <AnalyticsTrendIcon size={18} />
              <span>Analytics</span>
            </Link>
            <Link
              href="/audit"
              className="rail-desktop-only"
              aria-current={path === "/audit" ? "page" : undefined}
            >
              <AuditSealIcon size={18} />
              <span>Audit trail</span>
            </Link>
            <Link
              href="/settings"
              className="rail-desktop-only"
              aria-current={path.startsWith("/settings") ? "page" : undefined}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>

          <button
            type="button"
            className="rail-more dock-mobile-only"
            onClick={() => setOpen(true)}
            aria-label="More workspaces"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <Menu size={18} />
            <span>More</span>
          </button>

          <div className="rail-safety">
            <strong>
              <ShieldCheck size={14} /> Synthetic prototype
            </strong>
            <span>
              Unvalidated demo workflow. Emergency help never waits for
              software.
            </span>
          </div>
        </nav>

        <div className="workspace">
          {!online && (
            <div className="connection-banner" role="alert">
              <WifiOff size={17} />
              Offline. Registration drafts stay on this device. Emergency
              communication requires direct staff assistance.
            </div>
          )}
          <main id="main">
            <div className="hospital-context">
              <DepartmentUnitIcon size={15} />
              <span>{data.hospital.name}</span>
              {data.hospitals.length > 1 && (
                <select
                  aria-label="Switch hospital"
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
              )}
              <span className="hospital-location">
                {data.hospital.location}
              </span>
              <span className="clinical-lock">
                <ShieldCheck size={14} />
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
              <MediRouteLogo size={15} />
              MediRoute
            </span>
            <span>Synthetic data only. Unvalidated clinical protocol.</span>
            <span>Hospital workspace</span>
          </footer>
        </div>
      </div>

      {open && (
        <Modal title="Workspace navigation" onClose={() => setOpen(false)}>
          <div className="navigation-hospital">
            <DepartmentUnitIcon size={22} />
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
          <form
            className="navigation-search"
            action="/queues"
            onSubmit={() => setOpen(false)}
          >
            <Search size={16} aria-hidden="true" />
            <input
              name="q"
              aria-label="Search encounters from workspace menu"
              placeholder="Search patient name or encounter reference…"
            />
            <button type="submit" className="button small">
              Find
            </button>
          </form>
          <div className="navigation-grid">
            {nav.map(([group, items]) => (
              <nav key={group} aria-label={group}>
                <h3>{group}</h3>
                {items.map(([href, label, Icon]) => (
                  <Link
                    href={href}
                    key={href}
                    aria-current={path === href ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={17} />
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
          <span>{message}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
