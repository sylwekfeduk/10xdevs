import type { APIRoute } from "astro";

import { CreateRecipeSchema, GetRecipesQuerySchema } from "../../lib/schemas/recipe.schema";
import {
  createRecipe,
  getUserRecipes,
  InvalidReferenceError,
  type PaginatedRecipesResponse,
} from "../../lib/services/recipe.service";
import type { RecipeDetailDto } from "../../types";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/recipes
 * Retrieves a paginated list of recipes for the authenticated user.
 *
 * @returns 200 with paginated recipes list on success
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
          message: "You must be authenticated to view recipes",
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

    const validationResult = GetRecipesQuerySchema.safeParse(queryParams);

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

    // Call service to get recipes
    const response: PaginatedRecipesResponse = await getUserRecipes(
      context.locals.user.id,
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
    console.error("Error retrieving recipes:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving recipes",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/recipes
 * Creates a new recipe for the authenticated user.
 *
 * @returns 201 with RecipeDetailDto on success
 * @returns 401 if user is not authenticated
 * @returns 400 if request body is invalid or original_recipe_id is invalid
 * @returns 500 on server errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Check for authenticated user
    if (!context.locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to create a recipe",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = CreateRecipeSchema.safeParse(body);

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

    // Call service to create recipe
    const newRecipe: RecipeDetailDto = await createRecipe(
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
    // Handle InvalidReferenceError (original_recipe_id issues)
    if (error instanceof InvalidReferenceError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error creating recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating the recipe",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
