import type { APIRoute } from "astro";

import { CreateMasterRecipeSchema, GetMasterRecipesQuerySchema } from "../../lib/schemas/master-recipe.schema";
import {
  getMasterRecipes,
  createMasterRecipe,
  UnauthorizedError,
  type PaginatedMasterRecipesResponse,
} from "../../lib/services/master-recipe.service";
import type { MasterRecipeDetailDto } from "../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/master-recipes
 * Retrieves a paginated list of master recipes.
 * All authenticated users can access this endpoint.
 *
 * @returns 200 with paginated master recipes list on success
 * @returns 400 if query parameters are invalid
 * @returns 401 if user is not authenticated
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

    // Extract and validate query parameters
    const searchParams = context.url.searchParams;
    const queryParams = {
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      order: searchParams.get("order") ?? undefined,
    };

    const validationResult = GetMasterRecipesQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid query parameters",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call service to get master recipes
    const response: PaginatedMasterRecipesResponse = await getMasterRecipes(
      validationResult.data,
      context.locals.supabase
    );

    // Return success response with 200 OK
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error retrieving master recipes:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving master recipes",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/master-recipes
 * Creates a new master recipe.
 * Only admin users can access this endpoint.
 *
 * @returns 201 with MasterRecipeDetailDto on success
 * @returns 400 if request body is invalid
 * @returns 401 if user is not authenticated
 * @returns 403 if user is not an admin
 * @returns 500 on server errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to create a master recipe",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = CreateMasterRecipeSchema.safeParse(body);

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

    // Call service to create master recipe
    const newRecipe: MasterRecipeDetailDto = await createMasterRecipe(
      context.locals.user.id,
      validationResult.data,
      context.locals.supabase
    );

    // Return success response with 201 Created
    return new Response(JSON.stringify(newRecipe), {
      status: 201,
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

    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error creating master recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating the master recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
