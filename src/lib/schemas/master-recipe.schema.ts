import { z } from "zod";

/**
 * Zod schema for validating CreateMasterRecipeCommand request body.
 * Used in POST /api/master-recipes endpoint.
 */
export const CreateMasterRecipeSchema = z.object({
  title: z.string().min(1, "Title is required and cannot be empty").trim(),
  ingredients: z.string().min(1, "Ingredients are required and cannot be empty").trim(),
  instructions: z.string().min(1, "Instructions are required and cannot be empty").trim(),
  description: z.string().optional().nullable(),
});

export type CreateMasterRecipeSchemaType = z.infer<typeof CreateMasterRecipeSchema>;

/**
 * Zod schema for validating UpdateMasterRecipeCommand request body.
 * Used in PATCH /api/master-recipes/{recipeId} endpoint.
 */
export const UpdateMasterRecipeSchema = z.object({
  title: z.string().min(1, "Title is required and cannot be empty").trim().optional(),
  ingredients: z.string().min(1, "Ingredients are required and cannot be empty").trim().optional(),
  instructions: z.string().min(1, "Instructions are required and cannot be empty").trim().optional(),
  description: z.string().optional().nullable(),
});

export type UpdateMasterRecipeSchemaType = z.infer<typeof UpdateMasterRecipeSchema>;

/**
 * Zod schema for validating UUID parameters.
 * Used for validating recipeId in URL parameters.
 */
export const MasterRecipeIdSchema = z.string().uuid("Invalid master recipe ID format");

/**
 * Zod schema for validating query parameters for GET /api/master-recipes.
 * Supports pagination and sorting with sensible defaults.
 */
export const GetMasterRecipesQuerySchema = z.object({
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

export type GetMasterRecipesQuerySchemaType = z.infer<typeof GetMasterRecipesQuerySchema>;
