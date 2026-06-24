import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { employeeSchema } from "@/lib/validations";
import { uploadQRCode } from "@/lib/qr";
import type { ApiResponse, PaginatedResponse, Employee } from "@/types";

/** GET /api/employees — List all employees (admin only) */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get("page")     ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search   = searchParams.get("search") ?? "";
  const status   = searchParams.get("status") ?? "";
  const dept     = searchParams.get("department") ?? "";

  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`
    );
  }
  if (status) query = query.eq("status", status);
  if (dept)   query = query.eq("department", dept);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message, success: false },
      { status: 500 }
    );
  }

  return NextResponse.json<PaginatedResponse<Employee>>({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

/** POST /api/employees — Create a new employee (admin only) */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Invalid JSON body", success: false },
      { status: 400 }
    );
  }

  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.errors[0].message, success: false },
      { status: 422 }
    );
  }

  const { data, error } = await adminSupabase
    .from("employees")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    const msg = error.code === "23505"
      ? "An employee with this ID or email already exists"
      : error.message;
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: msg, success: false },
      { status: 409 }
    );
  }

  // Auto-generate QR code in background
  const qrUrl = await uploadQRCode(adminSupabase, data.employee_id, data.id);
  if (qrUrl) {
    await adminSupabase
      .from("employees")
      .update({ qr_code_url: qrUrl })
      .eq("id", data.id);
    data.qr_code_url = qrUrl;
  }

  return NextResponse.json<ApiResponse<Employee>>(
    { data, error: null, success: true },
    { status: 201 }
  );
}
