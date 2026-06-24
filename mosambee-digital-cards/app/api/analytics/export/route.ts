import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

/** GET /api/analytics/export — Download analytics as Excel (.xlsx) */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [employeeAnalytics, dailySummary, monthlySummary] = await Promise.all([
    supabase.from("employee_analytics").select("*").order("total_scans", { ascending: false }),
    supabase.from("daily_scan_summary").select("*").limit(90),
    supabase.from("monthly_scan_summary").select("*").limit(24),
  ]);

  const workbook = XLSX.utils.book_new();

  // Sheet 1: Employee Analytics
  const employeeRows = (employeeAnalytics.data ?? []).map((e) => ({
    "Employee ID":      e.employee_id,
    "Full Name":        e.full_name,
    "Designation":      e.designation,
    "Department":       e.department,
    "Status":           e.status,
    "Total Scans":      e.total_scans,
    "Unique Visitors":  e.unique_visitors,
    "QR Scans":         e.qr_scans,
    "Last Scanned":     e.last_scanned_at ?? "Never",
  }));
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(employeeRows),
    "Employee Analytics"
  );

  // Sheet 2: Daily Summary
  const dailyRows = (dailySummary.data ?? []).map((d) => ({
    "Date":             d.scan_date,
    "Total Scans":      d.total_scans,
    "Unique Visitors":  d.unique_visitors,
  }));
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(dailyRows),
    "Daily Summary"
  );

  // Sheet 3: Monthly Summary
  const monthlyRows = (monthlySummary.data ?? []).map((m) => ({
    "Month":            new Date(m.scan_month).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    "Total Scans":      m.total_scans,
    "Unique Visitors":  m.unique_visitors,
  }));
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(monthlyRows),
    "Monthly Summary"
  );

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const filename = `mosambee-analytics-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
