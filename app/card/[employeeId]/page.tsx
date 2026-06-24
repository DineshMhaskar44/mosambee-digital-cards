import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Employee } from "@/types";
import { BusinessCard } from "@/components/card/BusinessCard";

type Props = { params: Promise<{ employeeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { employeeId } = await params;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("full_name, designation, profile_photo_url")
    .eq("employee_id", employeeId)
    .eq("status", "active")
    .single();

  if (!employee) {
    return { title: "Card Not Found | Mosambee" };
  }

  return {
    title: `${employee.full_name} | Mosambee`,
    description: `${employee.designation} at Mosambee — Connect via digital business card`,
    openGraph: {
      title:       `${employee.full_name} — Mosambee`,
      description: `${employee.designation} at Mosambee`,
      images:      employee.profile_photo_url ? [employee.profile_photo_url] : [],
      type:        "profile",
    },
    twitter: {
      card:        "summary",
      title:       employee.full_name,
      description: `${employee.designation} at Mosambee`,
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { employeeId } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("status", "active")
    .single();

  if (error || !employee) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <BusinessCard employee={employee as Employee} />
    </Suspense>
  );
}
