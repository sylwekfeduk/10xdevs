import type { SupabaseClient } from "../../db/supabase.client";
import { getRecipeById, NotFoundError } from "./recipe.service";
import { countCaloriesWithBedrock, BedrockServiceError } from "./aws-bedrock.service";

/**
 * Custom error thrown when the calorie counting service is unavailable.
 * Maps to 503 Service Unavailable HTTP status.
 */
export class CalorieCountingUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalorieCountingUnavailableError";
  }
}

/**
 * Interface for the calorie counting result
 */
export interface CalorieCountResult {
  kcal: number;
  breakdown: string;
  recipeId: string;
  recipeTitle: string;
}

/**
 * Counts calories for a recipe using AWS Bedrock AI and updates the recipe.
 *
 * @param userId - The ID of the authenticated user
 * @param recipeId - The ID of the recipe to count calories for
 * @param supabase - The Supabase client instance
 * @returns Calorie count result with breakdown
 * @throws NotFoundError if recipe not found
 * @throws CalorieCountingUnavailableError if AI service call fails
 */
export async function countRecipeCalories(
  userId: string,
  recipeId: string,
  supabase: SupabaseClient
): Promise<CalorieCountResult> {
  // Step 1: Fetch the recipe
  const recipe = await getRecipeById(userId, recipeId, supabase);

  if (!recipe) {
    throw new NotFoundError(`Recipe with ID ${recipeId} not found or you do not have permission to access it`);
  }

  try {
    // Step 2: Call AWS Bedrock to count calories
    const calorieData = await countCaloriesWithBedrock(recipe.title, recipe.ingredients, recipe.instructions);

    // Step 3: Update the recipe with the calorie count
    const { error: updateError } = await supabase
      .from("recipes")
      .update({ kcal: calorieData.kcal })
      .eq("id", recipeId)
      .eq("user_id", userId);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error("Error updating recipe with kcal:", updateError);
      throw new Error("Failed to save calorie count to recipe");
    }

    // Step 4: Return the result
    return {
      kcal: calorieData.kcal,
      breakdown: calorieData.breakdown,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    };
  } catch (error) {
    if (error instanceof BedrockServiceError) {
      throw new CalorieCountingUnavailableError(error.message);
    }
    throw error;
  }
}
