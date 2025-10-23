import type { Tables, TablesInsert } from "./db/database.types";

/**
 * Represents the public profile of a user.
 *
 * @description This DTO corresponds to the `profiles` table and is used in the
 * `GET /api/me/profile` endpoint response.
 */
export type ProfileDto = Tables<"profiles">;

/**
 * Represents the command for updating a user's profile.
 *
 * @description This command model is used as the request payload for the
 * `PATCH /api/me/profile` endpoint. It includes only the fields that
 * can be modified by the user. All fields are optional.
 */
export type UpdateProfileCommand = Partial<
  Pick<Tables<"profiles">, "full_name" | "avatar_url" | "allergies" | "diets" | "disliked_ingredients">
>;

/**
 * Represents a recipe as it appears in a list.
 *
 * @description This DTO is a lightweight representation of a recipe, excluding
 * heavier fields like `ingredients` and `instructions`. It's used in the
 * response of the `GET /api/recipes` endpoint.
 */
export type RecipeListItemDto = Omit<Tables<"recipes">, "ingredients" | "instructions" | "changes_summary">;

/**
 * Represents the full details of a single recipe.
 *
 * @description This DTO corresponds to the `recipes` table and includes all
 * fields. It is used in the response for `GET /api/recipes/{recipeId}` and
 * `POST /api/recipes`.
 */
export type RecipeDetailDto = Tables<"recipes">;

/**
 * Represents the command for creating a new recipe.
 *
 * @description This command model is used as the request payload for the
 * `POST /api/recipes` endpoint. It contains the essential fields needed
 * to create a new recipe record.
 */
export type CreateRecipeCommand = Pick<
  TablesInsert<"recipes">,
  "title" | "ingredients" | "instructions" | "original_recipe_id"
>;

/**
 * Represents an unsaved, AI-modified recipe.
 *
 * @description This DTO is the response from the `POST /api/recipes/{recipeId}/modify`
 * endpoint. It is a complete recipe structure, but since it has not been persisted
 * to the database, `id`, `created_at`, and `updated_at` are `null`.
 */
export type ModifiedRecipeDto = Omit<Tables<"recipes">, "id" | "created_at" | "updated_at"> & {
  id: null;
  created_at: null;
  updated_at: null;
};
