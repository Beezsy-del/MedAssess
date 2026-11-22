import { Login } from "@/features/patient/login";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <Login
      demo={process.env.DEMO_MODE === "true"}
      initialMessage={
        error === "link"
          ? "This recovery link could not be verified. Request a new link and open it in the same browser."
          : ""
      }
    />
  );
}
