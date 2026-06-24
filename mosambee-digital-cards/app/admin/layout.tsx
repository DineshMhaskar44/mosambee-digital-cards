// Server component — force-dynamic prevents static prerendering for all admin pages
export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
