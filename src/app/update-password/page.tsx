import { redirect } from "next/navigation";
import { session } from "@/lib/data";
import { ProfileSettings } from "@/features/workspace/profile";
import { PublicHeader } from "@/components/chrome";
import Link from "next/link";
export default async function UpdatePasswordPage() {
  if (!(await session())) redirect("/login?error=link");
  return (
    <>
      <PublicHeader />
      <main className="public-page">
        <h1>Update your password</h1>
        <ProfileSettings />
        <Link href="/settings/profile">Return to your account</Link>
      </main>
    </>
  );
}
