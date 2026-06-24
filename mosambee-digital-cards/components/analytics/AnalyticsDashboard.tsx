"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, TrendingUp, Users, Eye, QrCode } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import type { OverallAnalytics } from "@/types";

interface AnalyticsDashboardProps {
  data: OverallAnalytics;
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6"];

// ---- Stat Card ----
function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {formatNumber(value)}
          </p>
          {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Prepare daily chart data
  const dailyChartData = [...data.dailyData]
    .reverse()
    .slice(-30)
    .map((d) => ({
      date:    format(new Date(d.scan_date), "dd MMM"),
      Scans:   d.total_scans,
      Unique:  d.unique_visitors,
    }));

  // Monthly chart data
  const monthlyChartData = [...data.monthlyData]
    .reverse()
    .map((m) => ({
      month:  format(new Date(m.scan_month), "MMM yy"),
      Scans:  m.total_scans,
      Unique: m.unique_visitors,
    }));

  // Referrer pie data
  const referrerPie = data.referrerData.map((r) => ({
    name:  r.referrer ?? "direct",
    value: r.total_scans,
  }));

  async function handleExport() {
    const res = await fetch("/api/analytics/export");
    if (!res.ok) return;
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `mosambee-analytics-${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <button onClick={handleExport} className="btn-secondary">
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Card Scans"   value={data.totalScans}      icon={Eye}       color="bg-brand-500"   />
        <StatCard label="Unique Visitors"    value={data.uniqueVisitors}  icon={Users}     color="bg-blue-500"   />
        <StatCard label="Today's Scans"      value={data.todayScans}      icon={TrendingUp} color="bg-green-500"  />
        <StatCard label="This Month"         value={data.monthScans}      icon={QrCode}    color="bg-purple-500" />
      </div>

      {/* Daily trend chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Scan Trend (Last 30 days)</h2>
        {dailyChartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No scan data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyChartData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="Scans"  stroke="#f97316" fill="url(#scansGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Unique" stroke="#3b82f6" fill="none"            strokeWidth={2} strokeDasharray="4 2" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h2>
        {monthlyChartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No monthly data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Scans"  fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Unique" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Device + Referrer row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Device Types</h2>
          {data.deviceData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={data.deviceData} dataKey="total_scans" nameKey="device_type" cx="50%" cy="50%" outerRadius={60}>
                    {data.deviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.deviceData.map((d, i) => (
                  <div key={d.device_type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-gray-700 dark:text-slate-300">{d.device_type ?? "unknown"}</span>
                    </div>
                    <span className="text-gray-500 dark:text-slate-400">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Referrer breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
          {referrerPie.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={referrerPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                    {referrerPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {referrerPie.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-gray-700 dark:text-slate-300">{r.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatNumber(r.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top employees table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Top Employees by Scans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50">
                {["Rank", "Employee", "Department", "Total Scans", "Unique Visitors", "QR Scans", "Last Scan"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.topEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No scan data yet</td>
                </tr>
              ) : (
                data.topEmployees.map((emp, i) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold inline-flex
                        ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{emp.full_name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{emp.designation}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{emp.department}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatNumber(emp.total_scans)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{formatNumber(emp.unique_visitors)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{formatNumber(emp.qr_scans)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">
                      {emp.last_scanned_at
                        ? format(new Date(emp.last_scanned_at), "dd MMM yyyy")
                        : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Browser table */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Browser Breakdown</h2>
        <div className="space-y-3">
          {data.browserData.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            data.browserData.map((b, i) => (
              <div key={b.browser} className="flex items-center gap-3">
                <span className="w-20 text-sm text-gray-600 dark:text-slate-400 truncate">{b.browser}</span>
                <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${b.percentage}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-gray-500 dark:text-slate-400">{b.percentage}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
