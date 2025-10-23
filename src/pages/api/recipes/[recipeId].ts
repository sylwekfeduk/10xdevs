import type { APIRoute } from "astro";

import { RecipeIdSchema } from "../../../lib/schemas/recipe.schema";
import { getRecipeById, deleteRecipe, NotFoundError } from "../../../lib/services/recipe.service";
import type { RecipeDetailDto } from "../../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/recipes/{recipeId}
 * Retrieves a single recipe by ID for the authenticated user.
 *
 * @returns 200 with RecipeDetailDto on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 404 if recipe not found or not owned by user
 * @returns 500 on server errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to view recipes",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract and validate recipeId from URL parameters
    const recipeId = context.params.recipeId;
    const validationResult = RecipeIdSchema.safeParse(recipeId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: validationResult.error.errors[0]?.message || "Invalid recipe ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to get recipe
    const recipe: RecipeDetailDto | null = await getRecipeById(
      context.locals.user.id,
      validationResult.data,
      context.locals.supabase
    );

    // Handle not found case
    if (!recipe) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Recipe not found or you do not have permission to view it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response with 200 OK
    return new Response(JSON.stringify(recipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error retrieving recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/recipes/{recipeId}
 * Deletes a recipe by ID for the authenticated user.
 *
 * @returns 204 No Content on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 404 if recipe not found or not owned by user
 * @returns 500 on server errors
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to delete recipes",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract and validate recipeId from URL parameters
    const recipeId = context.params.recipeId;
    const validationResult = RecipeIdSchema.safeParse(recipeId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: validationResult.error.errors[0]?.message || "Invalid recipe ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to delete recipe
    await deleteRecipe(context.locals.user.id, validationResult.data, context.locals.supabase);

    // Return success response with 204 No Content
    return new Response(null, {
      status: 204,
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
    console.error("Error deleting recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
