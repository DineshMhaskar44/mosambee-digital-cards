import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateVCard, vcardFilename } from "@/lib/vcard";
import { detectDevice, detectBrowser } from "@/lib/utils";
import type { Employee } from "@/types";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/vcard/[id]
 * Returns a downloadable .vcf file for the employee.
 * The [id] here is the employee_id (e.g. MOS-001), not the UUID.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  // Look up by employee_id string
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("employee_id", id)
    .eq("status", "active")
    .single();

  if (error || !employee) {
    return new NextResponse("Employee not found", { status: 404 });
  }

  const vcf = generateVCard(employee as Employee);

  // Track vCard download asynchronously (don't await)
  const adminSupabase = await createAdminClient();
  const ua = request.headers.get("user-agent") ?? "";
  adminSupabase
    .from("vcard_downloads")
    .insert({
      employee_id: employee.id,
      ip_address:  request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
      user_agent:  ua,
    })
    .then(() => {}) // fire-and-forget
    .catch(console.error);

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcardFilename(employee as Employee)}"`,
      "Cache-Control": "no-store",
    },
  });
}
