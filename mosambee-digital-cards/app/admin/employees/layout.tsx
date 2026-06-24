// Force all /admin/employees pages to be dynamically rendered
// so useSearchParams and similar hooks work without Suspense boundaries.
export const dynamic = "force-dynamic";

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
