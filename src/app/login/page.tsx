import { Login } from "@/features/patient/login";
export default function Page() {
  return <Login demo={process.env.DEMO_MODE === "true"} />;
}
