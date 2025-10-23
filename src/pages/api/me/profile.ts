import type { APIRoute } from "astro";

import { UpdateProfileSchema } from "../../../lib/schemas/profile.schema";
import { getProfile, updateProfile } from "../../../lib/services/profile.service";
import type { ProfileDto } from "../../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/me/profile
 * Retrieves the profile for the authenticated user.
 *
 * @returns 200 with ProfileDto on success
 * @returns 401 if user is not authenticated
 * @returns 404 if profile not found
 * @returns 500 on server errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to view your profile",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to get profile
    const profile: ProfileDto | null = await getProfile(context.locals.user.id, context.locals.supabase);

    // Handle not found case
    if (!profile) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Profile not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response with 200 OK
    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error retrieving profile:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving your profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PATCH /api/me/profile
 * Updates the profile for the authenticated user.
 *
 * @returns 200 with updated ProfileDto on success
 * @returns 400 if request body is invalid
 * @returns 401 if user is not authenticated
 * @returns 500 on server errors
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to update your profile",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = UpdateProfileSchema.safeParse(body);

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

    // Call service to update profile
    const updatedProfile: ProfileDto = await updateProfile(
      context.locals.user.id,
      validationResult.data,
      context.locals.supabase
    );

    // Return success response with 200 OK
    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error updating profile:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating your profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
