import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { employeeSchema } from "@/lib/validations";
import type { ApiResponse, Employee } from "@/types";

type Params = { params: Promise<{ id: string }> };

/** GET /api/employees/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Employee not found", success: false },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<Employee>>({ data, error: null, success: true });
}

/** PATCH /api/employees/[id] — Partial update */
export async function PATCH(request: NextRequest, { params }: Params) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Invalid JSON", success: false },
      { status: 400 }
    );
  }

  const parsed = employeeSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: parsed.error.errors[0].message, success: false },
      { status: 422 }
    );
  }

  const { data, error } = await adminSupabase
    .from("employees")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error?.message ?? "Not found", success: false },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<Employee>>({ data, error: null, success: true });
}

/** DELETE /api/employees/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
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

  const { error } = await adminSupabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message, success: false },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<null>>({ data: null, error: null, success: true });
}
