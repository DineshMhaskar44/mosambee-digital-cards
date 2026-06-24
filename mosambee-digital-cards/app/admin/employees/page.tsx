"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, QrCode, ExternalLink,
  Edit, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Employee, PaginatedResponse } from "@/types";
import Image from "next/image";
import toast from "react-hot-toast";

const PAGE_SIZE = 15;

function EmployeesContent() {
  const [data,    setData]    = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [page,    setPage]    = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [regening,  setRegening]  = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page:     String(page),
      pageSize: String(PAGE_SIZE),
      ...(search && { search }),
      ...(status && { status }),
    });
    const res  = await fetch(`/api/employees?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${name} deleted`);
      fetchEmployees();
    } else {
      toast.error("Delete failed");
    }
    setDeleting(null);
  }

  async function handleRegenQR(id: string) {
    setRegening(id);
    const res = await fetch(`/api/employees/${id}/qr`, { method: "POST" });
    if (res.ok) {
      toast.success("QR code regenerated!");
    } else {
      toast.error("Failed to regenerate QR");
    }
    setRegening(null);
  }

  function handleDownloadQR(id: string, empId: string) {
    window.open(`/api/employees/${id}/qr`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="form-input w-36"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Link href="/admin/employees/new" className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Add Employee
        </Link>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                {["Employee", "Contact", "Department", "Card Views", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    No employees found.{" "}
                    <Link href="/admin/employees/new" className="text-brand-500 hover:underline">
                      Add the first one
                    </Link>
                  </td>
                </tr>
              ) : (
                data?.data.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden flex-shrink-0">
                          {emp.profile_photo_url ? (
                            <Image src={emp.profile_photo_url} alt={emp.full_name} width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-sm">
                              {emp.full_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{emp.full_name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{emp.employee_id} · {emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <p className="text-gray-700 dark:text-slate-300">{emp.mobile_number}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[160px]">{emp.email}</p>
                    </td>
                    {/* Dept */}
                    <td className="px-4 py-3">
                      <span className="badge-gray">{emp.department}</span>
                    </td>
                    {/* Views */}
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300 font-medium">
                      {formatNumber(emp.card_views ?? 0)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={emp.status === "active" ? "badge-green" : "badge-red"}>
                        {emp.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/card/${emp.employee_id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="View Card"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/employees/${emp.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadQR(emp.id, emp.employee_id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Download QR"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenQR(emp.id)}
                          disabled={regening === emp.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                          title="Regenerate QR"
                        >
                          <RefreshCw className={`w-4 h-4 ${regening === emp.id ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.full_name)}
                          disabled={deleting === emp.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {formatNumber(data.total)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  return <EmployeesContent />;
}
