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
  if (!(await session())) redirect("/login");
  const initial = await snapshot();
  const { q } = await searchParams;
  let content: React.ReactNode;
  switch (route) {
    case "registration":
    case "nurse":
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
      content = (
        <>
          <BedManagement />
          <section className="panel detail-panel spaced">
            <Resources />
          </section>
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
      content = <Referrals />;
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
      content = (
        <Overview
          queue={route !== "dashboard"}
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
