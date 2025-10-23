import { z } from "zod";

/**
 * Zod schema for validating CreateRecipeCommand request body.
 * Used in POST /api/recipes endpoint.
 */
export const CreateRecipeSchema = z.object({
  title: z.string().min(1, "Title is required and cannot be empty").trim(),
  ingredients: z.string().min(1, "Ingredients are required and cannot be empty").trim(),
  instructions: z.string().min(1, "Instructions are required and cannot be empty").trim(),
  original_recipe_id: z.string().uuid("Invalid UUID format for original_recipe_id").optional().nullable(),
});

export type CreateRecipeSchemaType = z.infer<typeof CreateRecipeSchema>;

/**
 * Zod schema for validating UUID parameters.
 * Used for validating recipeId in URL parameters.
 */
export const RecipeIdSchema = z.string().uuid("Invalid recipe ID format");

/**
 * Zod schema for validating query parameters for GET /api/recipes.
 * Supports pagination and sorting with sensible defaults.
 */
export const GetRecipesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive())
    .catch(1),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100))
    .catch(10),
  sortBy: z
    .enum(["created_at", "updated_at", "title"])
    .optional()
    .transform((val) => val || "created_at"),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .transform((val) => val || "desc"),
});

export type GetRecipesQuerySchemaType = z.infer<typeof GetRecipesQuerySchema>;
