import type { APIRoute } from "astro";

import { MasterRecipeIdSchema, UpdateMasterRecipeSchema } from "../../../lib/schemas/master-recipe.schema";
import {
  getMasterRecipeById,
  updateMasterRecipe,
  deleteMasterRecipe,
  UnauthorizedError,
  NotFoundError,
} from "../../../lib/services/master-recipe.service";
import type { MasterRecipeDetailDto } from "../../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/master-recipes/{recipeId}
 * Retrieves a single master recipe by ID.
 * All authenticated users can access this endpoint.
 *
 * @returns 200 with MasterRecipeDetailDto on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 404 if master recipe not found
 * @returns 500 on server errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to view master recipes",
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

    // Call service to get master recipe
    const recipe: MasterRecipeDetailDto | null = await getMasterRecipeById(
      validationResult.data,
      context.locals.supabase
    );

    // Handle not found case
    if (!recipe) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Master recipe not found",
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
    console.error("Error retrieving master recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the master recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PATCH /api/master-recipes/{recipeId}
 * Updates an existing master recipe.
 * Only admin users can access this endpoint.
 *
 * @returns 200 with updated MasterRecipeDetailDto on success
 * @returns 400 if recipeId is invalid or request body is invalid
 * @returns 401 if user is not authenticated
 * @returns 403 if user is not an admin
 * @returns 404 if master recipe not found
 * @returns 500 on server errors
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to update master recipes",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract and validate recipeId from URL parameters
    const recipeId = context.params.recipeId;
    const recipeIdValidation = MasterRecipeIdSchema.safeParse(recipeId);

    if (!recipeIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: recipeIdValidation.error.errors[0]?.message || "Invalid master recipe ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = UpdateMasterRecipeSchema.safeParse(body);

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

    // Call service to update master recipe
    const updatedRecipe: MasterRecipeDetailDto = await updateMasterRecipe(
      context.locals.user.id,
      recipeIdValidation.data,
      validationResult.data,
      context.locals.supabase
    );

    // Return success response with 200 OK
    return new Response(JSON.stringify(updatedRecipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle UnauthorizedError (not admin)
    if (error instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: error.message,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    console.error("Error updating master recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating the master recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/master-recipes/{recipeId}
 * Deletes a master recipe by ID.
 * Only admin users can access this endpoint.
 *
 * @returns 204 No Content on success
 * @returns 400 if recipeId is not a valid UUID
 * @returns 401 if user is not authenticated
 * @returns 403 if user is not an admin
 * @returns 404 if master recipe not found
 * @returns 500 on server errors
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to delete master recipes",
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

    // Call service to delete master recipe
    await deleteMasterRecipe(context.locals.user.id, validationResult.data, context.locals.supabase);

    // Return success response with 204 No Content
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Handle UnauthorizedError (not admin)
    if (error instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: error.message,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    console.error("Error deleting master recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the master recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
