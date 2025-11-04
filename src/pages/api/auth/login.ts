import type { APIRoute } from "astro";
import { z } from "zod";

import { createSupabaseServerInstance } from "@/db/supabase.client";

// Disable prerendering for this API route
export const prerender = false;

// Validation schema for login request
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 *
 * @returns 200 with user data and success message on successful login
 * @returns 400 if request body is invalid
 * @returns 401 if credentials are incorrect
 * @returns 500 on server errors
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email, password } = validationResult.data;

    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: error.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user has completed onboarding
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("user_id", data.user.id)
      .single();

    if (profileError) {
      // Profile should exist due to trigger, but handle edge case
      console.error("Error fetching profile:", profileError);
    }

    // Return success response with user data and onboarding status
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        needsOnboarding: !profile?.has_completed_onboarding,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during login:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred during login",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};