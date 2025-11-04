import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

import { supabaseClient } from "../db/supabase.client.ts";
import type { Database } from "../db/database.types.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  // TODO: TEMPORARY MOCK USER FOR TESTING - REMOVE BEFORE PRODUCTION!
  // This bypasses authentication for UI testing purposes
  // Using actual user ID from database to avoid foreign key constraint issues
  const MOCK_USER_FOR_TESTING = {
    id: "1f51e706-5484-49b6-9d4c-2ab1bd46988c",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  // Use mock user for testing
  context.locals.user = MOCK_USER_FOR_TESTING as any;

  // Use service role key to bypass RLS for testing (if available)
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    context.locals.supabase = createClient<Database>(import.meta.env.SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } else {
    context.locals.supabase = supabaseClient;
  }

  return next();

  // ORIGINAL AUTH CODE - Uncomment to re-enable real authentication:
  /*
  // Extract JWT token if present
  const authHeader = context.request.headers.get("authorization");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    // Create an authenticated Supabase client with the user's JWT
    const authenticatedClient = createClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify the token and get user
    const {
      data: { user },
      error,
    } = await authenticatedClient.auth.getUser(token);

    if (!error && user) {
      context.locals.user = user;
      context.locals.supabase = authenticatedClient; // Use authenticated client
    } else {
      context.locals.supabase = supabaseClient; // Fallback to anon client
    }
  } else {
    context.locals.supabase = supabaseClient; // Use anon client for unauthenticated requests
  }

  return next();
  */
});
