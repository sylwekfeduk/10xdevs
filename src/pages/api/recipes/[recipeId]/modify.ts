import type { APIRoute } from "astro";

import { RecipeIdSchema } from "../../../../lib/schemas/recipe.schema";
import { AIServiceUnavailableError, modifyRecipe } from "../../../../lib/services/ai-modification.service";
import { NotFoundError } from "../../../../lib/services/recipe.service";

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/recipes/{recipeId}/modify
 * Modifies a recipe using AI based on the user's dietary preferences.
 *
 * @returns 200 with ModifiedRecipeDto (unsaved recipe) on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 404 if recipe or profile not found
 * @returns 503 if AI service is unavailable
 * @returns 500 on server errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to modify recipes",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate recipeId from URL params
    const recipeId = context.params.recipeId;
    const validationResult = RecipeIdSchema.safeParse(recipeId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid recipe ID format",
          details: validationResult.error.flatten().formErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call AI modification service
    const modifiedRecipe = await modifyRecipe(context.locals.user.id, validationResult.data, context.locals.supabase);

    // Return success response with 200 OK
    return new Response(JSON.stringify(modifiedRecipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle NotFoundError (404)
    if (error instanceof NotFoundError) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle AIServiceUnavailableError (503)
    if (error instanceof AIServiceUnavailableError) {
      return new Response(
        JSON.stringify({
          error: "Service Unavailable",
          message: "The AI service is temporarily unavailable. Please try again later.",
          details: error.message,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors (500)
    // eslint-disable-next-line no-console
    console.error("Error modifying recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while modifying the recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
