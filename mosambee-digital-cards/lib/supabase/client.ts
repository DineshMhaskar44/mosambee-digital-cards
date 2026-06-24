import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components.
 * Creates a new instance per call (safe — SSR handles sessions via cookies).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
