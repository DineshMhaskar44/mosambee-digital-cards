import { cookies } from "next/headers";

// Reading cookies() forces Next.js to skip static prerendering for this entire route.
// This prevents the useSearchParams-without-Suspense error during build.
export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await cookies(); // marks route as dynamic at build time
  return <>{children}</>;
}
