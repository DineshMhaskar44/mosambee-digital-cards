import { redirect } from "next/navigation";

/** Root page — redirect to admin dashboard */
export default function Home() {
  redirect("/admin/dashboard");
}
