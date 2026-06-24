import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { detectDevice, detectBrowser, detectOS, getReferrer } from "@/lib/utils";

type Params = { params: Promise<{ employeeId: string }> };

/**
 * POST /api/scan/[employeeId]
 * Called client-side when a digital card is viewed.
 * Logs the scan without blocking the page render.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { employeeId } = await params;

  const body = await request.json().catch(() => ({}));
  const referrer = (body.referrer as string) ?? "direct";

  const ua      = request.headers.get("user-agent") ?? "";
  const ip      = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;

  const adminSupabase = await createAdminClient();

  // Resolve employee UUID from employee_id string
  const { data: employee } = await adminSupabase
    .from("employees")
    .select("id")
    .eq("employee_id", employeeId)
    .single();

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const { error } = await adminSupabase.from("scan_logs").insert({
    employee_id: employee.id,
    ip_address:  ip,
    user_agent:  ua,
    device_type: detectDevice(ua),
    browser:     detectBrowser(ua),
    os:          detectOS(ua),
    referrer:    referrer,
  });

  if (error) {
    console.error("Scan log error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
