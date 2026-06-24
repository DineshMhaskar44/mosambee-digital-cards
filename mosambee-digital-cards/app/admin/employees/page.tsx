// Server component — reading searchParams automatically opts this route out of
// static prerendering, which fixes useSearchParams errors in child client components.
import { EmployeesClient } from "@/components/admin/EmployeesClient";

type Props = {
  searchParams: Promise<Record<string, string>>;
};

export default async function EmployeesPage({ searchParams }: Props) {
  await searchParams; // makes route dynamic
  return <EmployeesClient />;
}
