import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

/** POST /api/auth/login */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Verify the user is an admin
  const { data: admin } = await supabase
    .from("admins")
    .select("id, role")
    .eq("user_id", data.user.id)
    .single();

  if (!admin) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Access denied. Not an admin." }, { status: 403 });
  }

  return NextResponse.json({ success: true, role: admin.role });
}
