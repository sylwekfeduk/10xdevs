import type { APIRoute } from "astro";
import { z } from "zod";

// Disable prerendering for this API route
export const prerender = false;

// Validation schema for onboarding request
const OnboardingSchema = z
  .object({
    allergens: z.array(z.string()).default([]),
    diets: z.array(z.string()).default([]),
    disliked_ingredients: z.string().default(""),
  })
  .refine(
    (data) => data.allergens.length > 0 || data.diets.length > 0 || data.disliked_ingredients.trim().length > 0,
    {
      message: "At least one preference (allergens, diets, or disliked ingredients) must be provided",
    }
  );

/**
 * POST /api/onboarding/complete
 * Completes user onboarding by saving dietary preferences.
 *
 * @returns 200 with success message on successful onboarding completion
 * @returns 400 if request body is invalid or validation fails
 * @returns 401 if user is not authenticated
 * @returns 500 on server errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to complete onboarding",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = OnboardingSchema.safeParse(body);

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

    const { allergens, diets, disliked_ingredients } = validationResult.data;

    // Convert disliked_ingredients string to array (split by comma)
    const dislikedIngredientsArray = disliked_ingredients
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Update user profile with preferences and mark onboarding as complete
    const { data, error } = await context.locals.supabase
      .from("profiles")
      .update({
        allergies: allergens,
        diets: diets,
        disliked_ingredients: dislikedIngredientsArray,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", context.locals.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to update profile",
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
        message: "Onboarding completed successfully",
        profile: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during onboarding:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred during onboarding",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};