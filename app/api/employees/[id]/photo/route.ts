import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ id: string }> };

/** POST /api/employees/[id]/photo — Upload profile photo */
export async function POST(request: NextRequest, { params }: Params) {
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

  const formData = await request.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "No file provided", success: false },
      { status: 400 }
    );
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Only image files are allowed", success: false },
      { status: 400 }
    );
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "File size must be under 5MB", success: false },
      { status: 400 }
    );
  }

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `profile-photos/${id}.${ext}`;

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } = await adminSupabase.storage
    .from("profile-photos")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: uploadError.message, success: false },
      { status: 500 }
    );
  }

  const { data: urlData } = adminSupabase.storage
    .from("profile-photos")
    .getPublicUrl(path);

  // Bust cache by appending timestamp
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  await adminSupabase
    .from("employees")
    .update({ profile_photo_url: publicUrl })
    .eq("id", id);

  return NextResponse.json<ApiResponse<{ profile_photo_url: string }>>(
    { data: { profile_photo_url: publicUrl }, error: null, success: true }
  );
}

/** DELETE /api/employees/[id]/photo — Remove profile photo */
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

  // Try removing common extensions
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    await adminSupabase.storage
      .from("profile-photos")
      .remove([`profile-photos/${id}.${ext}`]);
  }

  await adminSupabase
    .from("employees")
    .update({ profile_photo_url: null })
    .eq("id", id);

  return NextResponse.json<ApiResponse<null>>({ data: null, error: null, success: true });
}
