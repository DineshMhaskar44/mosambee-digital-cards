import { createClient } from "@/lib/supabase/server";
import { Users, QrCode, TrendingUp, Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const supabase = await createClient();
  const [employees, scans, activeEmps, todayScans] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("scan_logs").select("id", { count: "exact", head: true }),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("scan_logs")
      .select("id", { count: "exact", head: true })
      .gte("scanned_at", new Date().toISOString().split("T")[0]),
  ]);
  return {
    totalEmployees: employees.count ?? 0,
    totalScans:     scans.count ?? 0,
    activeEmployees: activeEmps.count ?? 0,
    todayScans:     todayScans.count ?? 0,
  };
}

async function getRecentEmployees() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, employee_id, full_name, designation, department, status, card_views")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentEmployees()]);

  const cards = [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users,      color: "bg-blue-500",   href: "/admin/employees" },
    { label: "Active Employees", value: stats.activeEmployees, icon: QrCode,   color: "bg-green-500",  href: "/admin/employees?status=active" },
    { label: "Total Card Views", value: stats.totalScans,     icon: Eye,       color: "bg-brand-500",  href: "/admin/analytics" },
    { label: "Today's Scans",    value: stats.todayScans,     icon: TrendingUp, color: "bg-purple-500", href: "/admin/analytics" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(value)}
                </p>
              </div>
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent employees */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Employees</h2>
          <Link
            href="/admin/employees/new"
            className="btn-primary text-xs px-3 py-1.5"
          >
            + Add Employee
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50">
                {["Employee ID", "Name", "Designation", "Department", "Card Views", "Status"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No employees yet.{" "}
                    <Link href="/admin/employees/new" className="text-brand-500 hover:underline">
                      Add the first one
                    </Link>
                  </td>
                </tr>
              ) : (
                recent.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">{e.employee_id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{e.full_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{e.designation}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{e.department}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{formatNumber(e.card_views ?? 0)}</td>
                    <td className="px-6 py-4">
                      <span className={e.status === "active" ? "badge-green" : "badge-red"}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {recent.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700">
            <Link href="/admin/employees" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              View all employees →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
