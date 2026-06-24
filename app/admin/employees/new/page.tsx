"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { EmployeeFormValues } from "@/lib/validations";
import toast from "react-hot-toast";
import { useState } from "react";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: EmployeeFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to create employee");
        return;
      }

      toast.success(`${data.full_name} created successfully! QR code is being generated.`);
      router.push("/admin/employees");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/employees" className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Employee</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">A QR code will be auto-generated</p>
        </div>
      </div>

      <div className="card p-6">
        <EmployeeForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
