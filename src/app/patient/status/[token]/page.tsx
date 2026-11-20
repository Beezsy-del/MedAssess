import { PatientPortal } from "@/features/patient/portal";
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PatientPortal token={token} statusOnly />;
}
