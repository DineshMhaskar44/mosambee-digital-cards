"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const supabase     = createClient();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    values.email,
      password: values.password,
    });

    if (error || !data.user) {
      toast.error("Invalid email or password");
      return;
    }

    // Verify admin record exists
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    if (!admin) {
      await supabase.auth.signOut();
      toast.error("Access denied. Contact your administrator.");
      return;
    }

    toast.success("Welcome back!");
    const redirect = searchParams.get("redirect") ?? "/admin/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg">
            <QrCode className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mosambee Admin</h1>
          <p className="text-slate-400 mt-1 text-sm">Digital Business Cards Management</p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="admin@mosambee.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="form-input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} Mosambee · Digital Business Cards
        </p>
      </div>
    </div>
  );
}
