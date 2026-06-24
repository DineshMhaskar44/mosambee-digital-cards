import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateQRCodeBuffer, uploadQRCode } from "@/lib/qr";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ id: string }> };

/** GET /api/employees/[id]/qr — Download QR as PNG */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, employee_id, full_name")
    .eq("id", id)
    .single();

  if (error || !employee) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Employee not found", success: false },
      { status: 404 }
    );
  }

  const buffer = await generateQRCodeBuffer(employee.employee_id, { size: 512 });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${employee.employee_id}-qr.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** POST /api/employees/[id]/qr — Regenerate & re-upload QR code */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  const { data: employee } = await adminSupabase
    .from("employees")
    .select("id, employee_id")
    .eq("id", id)
    .single();

  if (!employee) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Employee not found", success: false },
      { status: 404 }
    );
  }

  const qrUrl = await uploadQRCode(adminSupabase, employee.employee_id, employee.id);

  if (!qrUrl) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to generate QR code", success: false },
      { status: 500 }
    );
  }

  await adminSupabase
    .from("employees")
    .update({ qr_code_url: qrUrl })
    .eq("id", id);

  return NextResponse.json<ApiResponse<{ qr_code_url: string }>>(
    { data: { qr_code_url: qrUrl }, error: null, success: true }
  );
}
