import type { APIRoute } from "astro";
import { z } from "zod";

import { createSupabaseServerInstance, createSupabaseAdminClient } from "@/db/supabase.client";

// Disable prerendering for this API route
export const prerender = false;

// Validation schema for password reset request
const PasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/password-reset
 * Validates email exists and sends a password reset link.
 *
 * @returns 200 with success message if email exists and reset link sent
 * @returns 400 if request body is invalid
 * @returns 404 if email doesn't exist in the database
 * @returns 500 on server errors
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = PasswordResetSchema.safeParse(body);

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

    const { email } = validationResult.data;

    // Create Supabase admin client to check if user exists
    let adminClient;
    try {
      adminClient = createSupabaseAdminClient();
    } catch (adminError) {
      console.error("Failed to create admin client:", adminError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Service configuration error. Please contact support.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user with this email exists using admin API
    // Use listUsers with email filter
    const { data: usersData, error: userCheckError } = await adminClient.auth.admin.listUsers();

    if (userCheckError) {
      console.error("Error checking user existence:", userCheckError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to process password reset request",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the email exists in the users list
    const userExists = usersData.users.some((user) => user.email === email);

    if (!userExists) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "No account found with this email address. Please check your email or sign up for a new account.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase server instance for sending reset email
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Email exists, send password reset link
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/update-password`,
    });

    if (resetError) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: resetError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset link has been sent to your email address. Please check your inbox.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during password reset:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
