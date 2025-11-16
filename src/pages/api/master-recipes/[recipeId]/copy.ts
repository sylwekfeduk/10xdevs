import type { APIRoute } from "astro";

import { MasterRecipeIdSchema } from "../../../../lib/schemas/master-recipe.schema";
import { copyMasterRecipeToUser, NotFoundError } from "../../../../lib/services/master-recipe.service";
import type { RecipeDetailDto } from "../../../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/master-recipes/{recipeId}/copy
 * Copies a master recipe to the authenticated user's personal recipe collection.
 * All authenticated users can access this endpoint.
 *
 * @returns 201 with RecipeDetailDto of the copied recipe on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 404 if master recipe not found
 * @returns 500 on server errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to copy master recipes",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract and validate recipeId from URL parameters
    const recipeId = context.params.recipeId;
    const validationResult = MasterRecipeIdSchema.safeParse(recipeId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: validationResult.error.errors[0]?.message || "Invalid master recipe ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to copy master recipe to user's collection
    const copiedRecipe: RecipeDetailDto = await copyMasterRecipeToUser(
      context.locals.user.id,
      validationResult.data,
      context.locals.supabase
    );

    // Return success response with 201 Created
    return new Response(JSON.stringify(copiedRecipe), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle NotFoundError
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

    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error copying master recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while copying the master recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
