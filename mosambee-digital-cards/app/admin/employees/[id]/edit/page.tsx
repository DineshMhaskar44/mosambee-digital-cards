import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditEmployeeClient } from "./EditEmployeeClient";

export const metadata = { title: "Edit Employee" };

type Props = { params: Promise<{ id: string }> };

export default async function EditEmployeePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !employee) notFound();

  return <EditEmployeeClient employee={employee} />;
}
