import { ResourceRequests } from "@/features/workspace/resource-requests";
import {
  StaffAccess,
  ProtocolConfiguration,
} from "@/features/workspace/configuration";
import { cookies } from "next/headers";
import {
  AdministrativeDirectory,
  AdministrativeResources,
} from "@/features/workspace/administration";
import { canVisit, isAdministrator } from "@/features/access/policy";
import { hospitalCookie, selectMembership } from "@/lib/hospital-selection";
import { DepartmentReferrals } from "@/features/workspace/clinical-brief";
import { redirect, notFound } from "next/navigation";
import { snapshot, session } from "@/lib/data";
import { WorkspaceProvider } from "@/features/workspace/context";
import { Shell } from "@/features/workspace/shell";
import { BedManagement } from "@/features/beds/bed-management";
import { Overview } from "@/features/workspace/overview";
import { NurseIntake } from "@/features/registration/nurse-intake";
import { Reception } from "@/features/registration/reception";
import { Encounter } from "@/features/workspace/encounter";
import {
  SmartFlow,
  Resources,
  Alerts,
  Departments,
  Referrals,
  Analytics,
  Audit,
  Settings,
} from "@/features/operations/views";
export const dynamic = "force-dynamic";
export default async function StaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { section } = await params;
  const [route, id] = section;
  if (
    ![
      "dashboard",
      "patients",
      "staff",
      "protocols",
      "reception",
      "registration",
      "triage",
      "nurse",
      "doctor",
      "emergency-center",
      "queues",
      "smartflow",
      "resources",
      "beds",
      "departments",
      "referrals",
      "analytics",
      "forecasting",
      "settings",
      "audit",
      "notifications",
      "encounters",
    ].includes(route)
  )
    notFound();
  const current = await session();
  if (!current) redirect("/login");
  const membership = selectMembership(
    current.memberships,
    undefined,
    (await cookies()).get(hospitalCookie)?.value,
  );
  if (!canVisit(membership.role, section.join("/"))) notFound();
  const initial = await snapshot();
  const { q } = await searchParams;
  let content: React.ReactNode;
  switch (route) {
    case "staff":
      content = <StaffAccess />;
      break;
    case "protocols":
      content = <ProtocolConfiguration />;
      break;
    case "patients":
      content = <AdministrativeDirectory />;
      break;
    case "registration":
      content = <NurseIntake />;
      break;
    case "reception":
      content = <Reception />;
      break;
    case "encounters":
      content = <Encounter id={id} />;
      break;
    case "smartflow":
      content = <SmartFlow />;
      break;
    case "beds":
      content = <BedManagement encounterId={id} />;
      break;
    case "resources":
      content = isAdministrator(initial.membership.role) ? (
        <AdministrativeResources />
      ) : (
        <>
          <BedManagement />
          <ResourceRequests />
          <details className="panel panel-copy spaced">
            <summary>Stretchers, wheelchairs & other equipment</summary>
            <Resources />
          </details>
        </>
      );
      break;
    case "emergency-center":
    case "notifications":
      content = <Alerts />;
      break;
    case "departments":
      content = <Departments />;
      break;
    case "referrals":
      content = (
        <>
          <DepartmentReferrals />
          <Referrals />
        </>
      );
      break;
    case "analytics":
    case "forecasting":
      content = <Analytics />;
      break;
    case "audit":
      content = <Audit />;
      break;
    case "settings":
      content = <Settings section={section.join("/")} />;
      break;
    default:
      content =
        route === "dashboard" &&
        !["nurse", "triage_nurse", "doctor", "emergency_coordinator"].includes(
          initial.membership.role,
        ) ? (
          <AdministrativeDirectory />
        ) : (
          <Overview
            queue={true}
            initialQuery={q}
            title={
              route === "dashboard"
                ? "Hospital overview"
                : route === "doctor"
                  ? "Clinical workspace"
                  : route === "nurse"
                    ? "Nursing workspace"
                    : "Triage & patient queues"
            }
          />
        );
  }
  return (
    <WorkspaceProvider key={initial.hospital.id} initial={initial}>
      <Shell>{content}</Shell>
    </WorkspaceProvider>
  );
}
