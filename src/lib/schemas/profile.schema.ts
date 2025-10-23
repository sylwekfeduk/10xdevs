import { z } from "zod";

/**
 * Zod schema for validating UpdateProfileCommand request body.
 * Used in PATCH /api/me/profile endpoint.
 * All fields are optional as this is a partial update.
 */
export const UpdateProfileSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url("Invalid URL format for avatar_url").optional(),
  allergies: z.array(z.string()).optional(),
  diets: z.array(z.string()).optional(),
  disliked_ingredients: z.array(z.string()).optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;
