import type {
  RecipeDetailDto,
  ModifiedRecipeDto,
  AIModificationViewModel,
  AIChangeSummary,
  CreateRecipeCommand,
} from "@/types";

/**
 * Parses the changes_summary string from the ModifiedRecipeDto into structured AIChangeSummary objects.
 *
 * @param changesSummary - The raw changes_summary string from the API
 * @returns Array of structured change summaries
 */
export function parseChangesSummary(changesSummary: string | null): AIChangeSummary[] {
  if (!changesSummary) {
    return [];
  }

  try {
    // Attempt to parse as JSON array first
    const parsed = JSON.parse(changesSummary);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If JSON parsing fails, treat as a single text change
    return [
      {
        type: "modification",
        from: "Original recipe",
        to: changesSummary,
      },
    ];
  }

  return [];
}

/**
 * Transforms the original recipe and modified recipe into a complete AIModificationViewModel.
 *
 * @param originalRecipe - The original recipe DTO
 * @param modifiedRecipe - The AI-modified recipe DTO
 * @param originalRecipeId - The ID of the original recipe
 * @returns The complete view model for the AI modification flow
 */
export function transformToAIModificationViewModel(
  originalRecipe: RecipeDetailDto,
  modifiedRecipe: ModifiedRecipeDto,
  originalRecipeId: string
): AIModificationViewModel {
  const changesSummary = parseChangesSummary(modifiedRecipe.changes_summary);

  const savePayload: CreateRecipeCommand = {
    title: modifiedRecipe.title,
    ingredients: modifiedRecipe.ingredients,
    instructions: modifiedRecipe.instructions,
    original_recipe_id: originalRecipeId,
  };

  return {
    originalRecipe,
    modifiedRecipe,
    originalRecipeId,
    changesSummary,
    isReadyToSave: true,
    savePayload,
  };
}
