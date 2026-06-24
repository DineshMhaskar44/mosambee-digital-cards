import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, OverallAnalytics } from "@/types";

/** GET /api/analytics/overview — Full analytics summary (admin only) */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  // Run queries in parallel
  const [
    totalScansRes,
    uniqueVisitorsRes,
    employeeCountRes,
    activeCountRes,
    todayScansRes,
    monthScansRes,
    dailyRes,
    monthlyRes,
    topEmployeesRes,
    deviceRes,
    browserRes,
    referrerRes,
  ] = await Promise.all([
    supabase.from("scan_logs").select("id", { count: "exact", head: true }),
    supabase.from("scan_logs").select("ip_address"),
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("scan_logs")
      .select("id", { count: "exact", head: true })
      .gte("scanned_at", new Date().toISOString().split("T")[0]),
    supabase
      .from("scan_logs")
      .select("id", { count: "exact", head: true })
      .gte("scanned_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("daily_scan_summary").select("*").limit(30),
    supabase.from("monthly_scan_summary").select("*").limit(12),
    supabase.from("employee_analytics").select("*").order("total_scans", { ascending: false }).limit(10),
    supabase.from("device_analytics").select("*"),
    supabase.from("browser_analytics").select("*"),
    supabase.from("referrer_analytics").select("*"),
  ]);

  // Count unique visitors
  const uniqueVisitors = new Set(
    (uniqueVisitorsRes.data ?? [])
      .map((r: { ip_address: string | null }) => r.ip_address)
      .filter(Boolean)
  ).size;

  const analytics: OverallAnalytics = {
    totalScans:      totalScansRes.count ?? 0,
    uniqueVisitors,
    totalEmployees:  employeeCountRes.count ?? 0,
    activeEmployees: activeCountRes.count ?? 0,
    todayScans:      todayScansRes.count ?? 0,
    monthScans:      monthScansRes.count ?? 0,
    dailyData:       dailyRes.data ?? [],
    monthlyData:     monthlyRes.data ?? [],
    topEmployees:    topEmployeesRes.data ?? [],
    deviceData:      deviceRes.data ?? [],
    browserData:     browserRes.data ?? [],
    referrerData:    referrerRes.data ?? [],
  };

  return NextResponse.json<ApiResponse<OverallAnalytics>>(
    { data: analytics, error: null, success: true }
  );
}
