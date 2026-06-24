"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Sidebar — fixed left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Mosambee Admin"
        />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
