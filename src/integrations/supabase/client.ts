// Supabase client — Next.js compatible (no import.meta.env, uses process.env)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseClient() {
  // In Next.js, client-side env vars must be prefixed NEXT_PUBLIC_
  // Fallback to SUPABASE_* for server-side usage.
  const SUPABASE_URL =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env.SUPABASE_URL) ||
    "";
  const SUPABASE_PUBLISHABLE_KEY =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== "undefined" && process.env.SUPABASE_PUBLISHABLE_KEY) ||
    "";

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Auth features will be unavailable.",
    );
    // Return a stub client that won't crash on import
    return createClient<Database>("https://placeholder.supabase.co", "placeholder_key", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
