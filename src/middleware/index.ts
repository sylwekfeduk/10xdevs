import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/password-recovery",
  "/update-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/password-reset",
];

// Auth paths that authenticated users shouldn't access
const AUTH_PAGES = ["/login", "/register", "/password-recovery", "/update-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Create Supabase server instance with cookie handling
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });

  // Store supabase client in context for use in API routes
  context.locals.supabase = supabase;

  // Get user session from cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store user in context if authenticated
  if (user) {
    context.locals.user = user;
  }

  const pathname = context.url.pathname;

  // Special handling for homepage
  if (pathname === "/") {
    if (user) {
      return context.redirect("/dashboard");
    } else {
      return context.redirect("/login");
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && AUTH_PAGES.includes(pathname)) {
    return context.redirect("/dashboard");
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return context.redirect("/login");
  }

  return next();
});
