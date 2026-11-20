import { Login } from "@/features/patient/login";
import { session } from "@/lib/data";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (await session()))
    redirect("/dashboard");
  return <Login demo={process.env.DEMO_MODE === "true"} />;
}
