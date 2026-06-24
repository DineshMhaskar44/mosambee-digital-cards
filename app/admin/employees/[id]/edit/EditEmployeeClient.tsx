"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
import { ArrowLeft, ExternalLink, QrCode, Download } from "lucide-react";
import Link from "next/link";
import type { EmployeeFormValues } from "@/lib/validations";
import type { Employee } from "@/types";
import toast from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";

export function EditEmployeeClient({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: EmployeeFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Update failed");
        return;
      }

      toast.success("Employee updated!");
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
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit — {employee.full_name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{employee.employee_id}</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Link
            href={`/card/${employee.employee_id}`}
            target="_blank"
            className="btn-secondary text-xs px-3 py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Card
          </Link>
          <a
            href={`/api/employees/${employee.id}/qr`}
            download
            className="btn-secondary text-xs px-3 py-2"
          >
            <Download className="w-3.5 h-3.5" />
            QR
          </a>
        </div>
      </div>

      {/* QR preview */}
      {employee.qr_code_url && (
        <div className="card p-4 mb-4 flex items-center gap-4">
          <Image
            src={employee.qr_code_url}
            alt="QR Code"
            width={80}
            height={80}
            className="rounded-lg border border-gray-200 dark:border-slate-700"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">QR Code</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              Points to: /card/{employee.employee_id}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Card views: {employee.card_views}
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <EmployeeForm
          mode="edit"
          defaultValues={employee}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
