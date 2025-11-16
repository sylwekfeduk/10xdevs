import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateMasterRecipeCommand,
  MasterRecipeDetailDto,
  MasterRecipeListItemDto,
  UpdateMasterRecipeCommand,
} from "../../types";

/**
 * Custom error thrown when a user tries to perform an admin-only action.
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Custom error thrown when a resource is not found.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Options for pagination and sorting master recipes.
 */
export interface GetMasterRecipesOptions {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "updated_at" | "title";
  order: "asc" | "desc";
}

/**
 * Paginated response structure for master recipes list.
 */
export interface PaginatedMasterRecipesResponse {
  data: MasterRecipeListItemDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/**
 * Checks if a user is an admin.
 *
 * @param userId - The ID of the user to check
 * @param supabase - The Supabase client instance
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("is_admin").eq("user_id", userId).single();

  if (error || !data) {
    return false;
  }

  return data.is_admin === true;
}

/**
 * Retrieves a paginated list of master recipes.
 * All authenticated users can view master recipes.
 *
 * @param options - Pagination and sorting options
 * @param supabase - The Supabase client instance
 * @returns Paginated response with master recipes and pagination metadata
 * @throws Error for database or other unexpected errors
 */
export async function getMasterRecipes(
  options: GetMasterRecipesOptions,
  supabase: SupabaseClient
): Promise<PaginatedMasterRecipesResponse> {
  try {
    const { page, pageSize, sortBy, order } = options;

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Execute count and data queries in parallel for performance
    const [countResult, dataResult] = await Promise.all([
      // Query 1: Get total count
      supabase.from("master_recipes").select("id", { count: "exact", head: true }),

      // Query 2: Get paginated data with only necessary fields
      supabase
        .from("master_recipes")
        .select("id, title, description, created_by, updated_by, created_at, updated_at")
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
      data: (dataResult.data as MasterRecipeListItemDto[]) || [],
      pagination: {
        page,
        pageSize,
        total: countResult.count || 0,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getMasterRecipes error:", error);
    throw new Error(
      `Failed to retrieve master recipes: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
}

/**
 * Retrieves a single master recipe by ID.
 * All authenticated users can view master recipes.
 *
 * @param recipeId - The ID of the master recipe to retrieve
 * @param supabase - The Supabase client instance
 * @returns The master recipe if found, null otherwise
 * @throws Error for database or other unexpected errors
 */
export async function getMasterRecipeById(
  recipeId: string,
  supabase: SupabaseClient
): Promise<MasterRecipeDetailDto | null> {
  try {
    const { data, error } = await supabase.from("master_recipes").select("*").eq("id", recipeId).single();

    // Handle "not found" case - PostgREST error code PGRST116
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as MasterRecipeDetailDto;
  } catch (error) {
    // Re-throw unexpected errors
    throw new Error(`Failed to retrieve master recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Creates a new master recipe.
 * Only admin users can create master recipes.
 *
 * @param userId - The ID of the authenticated user (must be admin)
 * @param data - The master recipe data from the validated request body
 * @param supabase - The Supabase client instance
 * @returns The newly created master recipe with all generated fields
 * @throws UnauthorizedError if the user is not an admin
 * @throws Error for database or other unexpected errors
 */
export async function createMasterRecipe(
  userId: string,
  data: CreateMasterRecipeCommand,
  supabase: SupabaseClient
): Promise<MasterRecipeDetailDto> {
  // Check if user is admin
  const userIsAdmin = await isAdmin(userId, supabase);
  if (!userIsAdmin) {
    throw new UnauthorizedError("Only admin users can create master recipes");
  }

  // Insert the new master recipe
  const { data: newRecipe, error: insertError } = await supabase
    .from("master_recipes")
    .insert({
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      description: data.description || null,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (insertError || !newRecipe) {
    throw new Error(`Failed to create master recipe: ${insertError?.message || "Unknown error"}`);
  }

  return newRecipe as MasterRecipeDetailDto;
}

/**
 * Updates an existing master recipe.
 * Only admin users can update master recipes.
 *
 * @param userId - The ID of the authenticated user (must be admin)
 * @param recipeId - The ID of the master recipe to update
 * @param data - The updated master recipe data
 * @param supabase - The Supabase client instance
 * @returns The updated master recipe
 * @throws UnauthorizedError if the user is not an admin
 * @throws NotFoundError if the master recipe is not found
 * @throws Error for database or other unexpected errors
 */
export async function updateMasterRecipe(
  userId: string,
  recipeId: string,
  data: UpdateMasterRecipeCommand,
  supabase: SupabaseClient
): Promise<MasterRecipeDetailDto> {
  // Check if user is admin
  const userIsAdmin = await isAdmin(userId, supabase);
  if (!userIsAdmin) {
    throw new UnauthorizedError("Only admin users can update master recipes");
  }

  // Update the master recipe
  const { data: updatedRecipe, error: updateError } = await supabase
    .from("master_recipes")
    .update({
      ...data,
      updated_by: userId,
    })
    .eq("id", recipeId)
    .select()
    .single();

  if (updateError) {
    if (updateError.code === "PGRST116") {
      throw new NotFoundError(`Master recipe with ID ${recipeId} not found`);
    }
    throw new Error(`Failed to update master recipe: ${updateError.message}`);
  }

  return updatedRecipe as MasterRecipeDetailDto;
}

/**
 * Deletes a master recipe by ID.
 * Only admin users can delete master recipes.
 *
 * @param userId - The ID of the authenticated user (must be admin)
 * @param recipeId - The ID of the master recipe to delete
 * @param supabase - The Supabase client instance
 * @throws UnauthorizedError if the user is not an admin
 * @throws NotFoundError if master recipe not found
 * @throws Error for database or other unexpected errors
 */
export async function deleteMasterRecipe(userId: string, recipeId: string, supabase: SupabaseClient): Promise<void> {
  // Check if user is admin
  const userIsAdmin = await isAdmin(userId, supabase);
  if (!userIsAdmin) {
    throw new UnauthorizedError("Only admin users can delete master recipes");
  }

  try {
    // Delete the master recipe
    const { error, count } = await supabase.from("master_recipes").delete({ count: "exact" }).eq("id", recipeId);

    if (error) {
      throw error;
    }

    // Check if any rows were deleted
    if (count === 0) {
      throw new NotFoundError(`Master recipe with ID ${recipeId} not found`);
    }
  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Re-throw unexpected errors
    throw new Error(`Failed to delete master recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Copies a master recipe to a user's personal collection.
 *
 * @param userId - The ID of the authenticated user
 * @param masterRecipeId - The ID of the master recipe to copy
 * @param supabase - The Supabase client instance
 * @returns The newly created user recipe (copy of master recipe)
 * @throws NotFoundError if master recipe not found
 * @throws Error for database or other unexpected errors
 */
export async function copyMasterRecipeToUser(
  userId: string,
  masterRecipeId: string,
  supabase: SupabaseClient
): Promise<MasterRecipeDetailDto> {
  // Fetch the master recipe
  const masterRecipe = await getMasterRecipeById(masterRecipeId, supabase);

  if (!masterRecipe) {
    throw new NotFoundError(`Master recipe with ID ${masterRecipeId} not found`);
  }

  // Create a copy in the user's recipes
  const { data: newRecipe, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title: masterRecipe.title,
      ingredients: masterRecipe.ingredients,
      instructions: masterRecipe.instructions,
      copied_from_master_id: masterRecipeId,
      user_id: userId,
    })
    .select()
    .single();

  if (insertError || !newRecipe) {
    throw new Error(`Failed to copy master recipe: ${insertError?.message || "Unknown error"}`);
  }

  return newRecipe as MasterRecipeDetailDto;
}
