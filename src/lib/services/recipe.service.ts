import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateRecipeCommand, RecipeDetailDto, RecipeListItemDto } from "../../types";

/**
 * Custom error thrown when a referenced resource is invalid or not accessible.
 * Used for cases like invalid original_recipe_id or ownership violations.
 */
export class InvalidReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReferenceError";
  }
}

/**
 * Custom error thrown when a resource is not found.
 * Used when attempting to access or delete a non-existent resource.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Creates a new recipe for the authenticated user.
 *
 * @param userId - The ID of the authenticated user creating the recipe
 * @param data - The recipe data from the validated request body
 * @param supabase - The Supabase client instance
 * @returns The newly created recipe with all generated fields
 * @throws InvalidReferenceError if original_recipe_id is provided but invalid or not owned by user
 * @throws Error for database or other unexpected errors
 */
export async function createRecipe(
  userId: string,
  data: CreateRecipeCommand,
  supabase: SupabaseClient
): Promise<RecipeDetailDto> {
  // Step 1: Validate original_recipe_id if provided
  if (data.original_recipe_id) {
    const { data: originalRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", data.original_recipe_id)
      .single();

    if (fetchError || !originalRecipe) {
      throw new InvalidReferenceError(`Original recipe with ID ${data.original_recipe_id} does not exist`);
    }

    if (originalRecipe.user_id !== userId) {
      throw new InvalidReferenceError(`You do not have permission to reference recipe ${data.original_recipe_id}`);
    }
  }

  // Step 2: Insert the new recipe
  const { data: newRecipe, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      original_recipe_id: data.original_recipe_id || null,
      user_id: userId,
    })
    .select()
    .single();

  if (insertError || !newRecipe) {
    throw new Error(`Failed to create recipe: ${insertError?.message || "Unknown error"}`);
  }

  return newRecipe as RecipeDetailDto;
}

/**
 * Retrieves a single recipe by ID for the authenticated user.
 *
 * @param userId - The ID of the authenticated user
 * @param recipeId - The ID of the recipe to retrieve
 * @param supabase - The Supabase client instance
 * @returns The recipe if found and owned by user, null otherwise
 * @throws Error for database or other unexpected errors
 */
export async function getRecipeById(
  userId: string,
  recipeId: string,
  supabase: SupabaseClient
): Promise<RecipeDetailDto | null> {
  try {
    // Query with both id and user_id to ensure ownership
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .eq("user_id", userId)
      .single();

    // Handle "not found" case - PostgREST error code PGRST116
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as RecipeDetailDto;
  } catch (error) {
    // Re-throw unexpected errors
    throw new Error(`Failed to retrieve recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Deletes a recipe by ID for the authenticated user.
 *
 * @param userId - The ID of the authenticated user
 * @param recipeId - The ID of the recipe to delete
 * @param supabase - The Supabase client instance
 * @throws NotFoundError if recipe not found or not owned by user
 * @throws Error for database or other unexpected errors
 */
export async function deleteRecipe(userId: string, recipeId: string, supabase: SupabaseClient): Promise<void> {
  try {
    // Delete with both id and user_id to ensure ownership
    const { error, count } = await supabase
      .from("recipes")
      .delete({ count: "exact" })
      .eq("id", recipeId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // Check if any rows were deleted
    if (count === 0) {
      throw new NotFoundError(`Recipe with ID ${recipeId} not found or you do not have permission to delete it`);
    }
  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Re-throw unexpected errors
    throw new Error(`Failed to delete recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Options for pagination and sorting recipes.
 */
export interface GetRecipesOptions {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "updated_at" | "title";
  order: "asc" | "desc";
}

/**
 * Paginated response structure for recipes list.
 */
export interface PaginatedRecipesResponse {
  data: RecipeListItemDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/**
 * Retrieves a paginated list of recipes for the authenticated user.
 *
 * @param userId - The ID of the authenticated user
 * @param options - Pagination and sorting options
 * @param supabase - The Supabase client instance
 * @returns Paginated response with recipes and pagination metadata
 * @throws Error for database or other unexpected errors
 */
export async function getUserRecipes(
  userId: string,
  options: GetRecipesOptions,
  supabase: SupabaseClient
): Promise<PaginatedRecipesResponse> {
  try {
    const { page, pageSize, sortBy, order } = options;

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Execute count and data queries in parallel for performance
    const [countResult, dataResult] = await Promise.all([
      // Query 1: Get total count
      supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", userId),

      // Query 2: Get paginated data with only necessary fields
      supabase
        .from("recipes")
        .select("id, user_id, title, original_recipe_id, created_at, updated_at")
        .eq("user_id", userId)
        .order(sortBy, { ascending: order === "asc" })
        .range(from, to),
    ]);

    // Handle errors
    if (countResult.error) {
      throw countResult.error;
    }
    if (dataResult.error) {
      throw dataResult.error;
    }

    // Construct paginated response
    return {
      data: (dataResult.data as RecipeListItemDto[]) || [],
      pagination: {
        page,
        pageSize,
        total: countResult.count || 0,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getUserRecipes error:", error);
    throw new Error(`Failed to retrieve recipes: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}
