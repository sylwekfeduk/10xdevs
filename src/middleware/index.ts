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

// Supported locales
const LOCALES = ["en", "pl"];

/**
 * Remove locale prefix from pathname
 * Example: /pl/dashboard -> /dashboard
 */
function removeLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

/**
 * Get locale from pathname
 * Example: /pl/dashboard -> "pl", /dashboard -> null
 */
function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return segments[0];
  }
  return null;
}

/**
 * Add locale prefix to URL if present in current path
 * Example: addLocalePrefix("/dashboard", "pl") -> "/pl/dashboard"
 */
function addLocalePrefix(path: string, locale: string | null): string {
  if (locale && locale !== "en") {
    return `/${locale}${path}`;
  }
  return path;
}

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

  // Skip middleware for API routes and static assets
  if (pathname.startsWith("/api/") || pathname.startsWith("/_") || pathname.includes(".")) {
    return next();
  }

  const locale = getLocaleFromPath(pathname);
  const pathnameWithoutLocale = removeLocalePrefix(pathname);

  // Store locale in context for components to use
  context.locals.locale = locale || "en";

  // Special handling for homepage (with or without locale)
  if (pathnameWithoutLocale === "/" || pathname === "/" || pathname === "/pl" || pathname === "/pl/") {
    if (user) {
      return context.redirect(addLocalePrefix("/dashboard", locale));
    } else {
      return context.redirect(addLocalePrefix("/login", locale));
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && AUTH_PAGES.includes(pathnameWithoutLocale)) {
    return context.redirect(addLocalePrefix("/dashboard", locale));
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!user && !PUBLIC_PATHS.includes(pathnameWithoutLocale)) {
    return context.redirect(addLocalePrefix("/login", locale));
  }

  return next();
});
