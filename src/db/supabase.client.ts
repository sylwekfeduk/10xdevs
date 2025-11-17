import type { AstroCookies } from "astro";
import { createClient, type SupabaseClient as SupabaseClientBase } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types.ts";

// Lazy initialization for Cloudflare Workers runtime compatibility
let _supabaseClient: SupabaseClientBase<Database> | null = null;

/**
 * Get or create the client-side Supabase client.
 * This uses lazy initialization to ensure environment variables are available
 * in both Node.js and Cloudflare Workers runtimes.
 */
export function getSupabaseClient(): SupabaseClientBase<Database> {
  if (!_supabaseClient) {
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_KEY environment variables are required");
    }

    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
}

// Legacy export for backward compatibility - use getSupabaseClient() instead
export const supabaseClient = new Proxy({} as SupabaseClientBase<Database>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClientBase<Database>];
  },
});

/**
 * Create an admin Supabase client with service role key.
 * WARNING: Only use this on the server side for admin operations.
 * Never expose this client to the client side.
 */
export const createSupabaseAdminClient = (runtime?: { env?: Record<string, string> }) => {
  // Try to get from Cloudflare runtime first, then fall back to import.meta.env
  const supabaseUrl = runtime?.env?.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const supabaseServiceRoleKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin client");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Export typed Supabase client for use throughout the application
export type SupabaseClient = SupabaseClientBase<Database>;

// Cookie options for server-side auth
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

/**
 * Parse cookie header string into array of cookie objects
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Create a server-side Supabase client with proper cookie handling.
 * Use this in middleware and API routes for authentication.
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  runtime?: { env?: Record<string, string> };
}) => {
  // Try to get from Cloudflare runtime first, then fall back to import.meta.env
  const supabaseUrl = context.runtime?.env?.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = context.runtime?.env?.SUPABASE_KEY ?? import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY environment variables are required");
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
