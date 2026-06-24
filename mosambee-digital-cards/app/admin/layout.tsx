import { Suspense } from "react";
import { AdminShell } from "../../components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
