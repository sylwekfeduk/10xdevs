import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

import { supabaseClient } from "../db/supabase.client.ts";
import type { Database } from "../db/database.types.ts";

export const onRequest = defineMiddleware(async (context, next) => {
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
});
