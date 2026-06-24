"use client";

import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}
