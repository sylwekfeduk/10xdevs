import type { SupabaseClient } from "../../db/supabase.client";
import type { ModifiedRecipeDto } from "../../types";
import { getProfile } from "./profile.service";
import { getRecipeById, NotFoundError } from "./recipe.service";

/**
 * Custom error thrown when the AI service is unavailable or fails.
 * Maps to 503 Service Unavailable HTTP status.
 */
export class AIServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIServiceUnavailableError";
  }
}

/**
 * Custom error thrown when AI service returns invalid or unparseable data.
 * Maps to 500 Internal Server Error HTTP status.
 */
export class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIServiceError";
  }
}

/**
 * Interface for the AI response structure from OpenRouter.
 */
interface AIModificationResponse {
  title: string;
  ingredients: string;
  instructions: string;
  changes_summary: {
    type: string;
    from: string;
    to: string;
  }[];
}

/**
 * Modifies a recipe using AI based on the user's dietary preferences.
 *
 * @param userId - The ID of the authenticated user
 * @param recipeId - The ID of the recipe to modify
 * @param supabase - The Supabase client instance
 * @returns A new, unsaved recipe with AI-generated modifications
 * @throws NotFoundError if recipe or profile not found
 * @throws AIServiceUnavailableError if AI service call fails
 * @throws AIServiceError if AI response is invalid
 */
export async function modifyRecipe(
  userId: string,
  recipeId: string,
  supabase: SupabaseClient
): Promise<ModifiedRecipeDto> {
  // Start timer for performance tracking
  const startTime = Date.now();
  let processingTimeMs = 0;

  try {
    // Step 1: Fetch recipe and profile in parallel
    const [recipe, profile] = await Promise.all([
      getRecipeById(userId, recipeId, supabase),
      getProfile(userId, supabase),
    ]);

    // Validate data existence
    if (!recipe) {
      throw new NotFoundError(`Recipe with ID ${recipeId} not found or you do not have permission to access it`);
    }

    if (!profile) {
      throw new NotFoundError("User profile not found. Please complete your profile setup first.");
    }

    // Log for debugging
    console.log("=== AI Modification Debug ===");
    console.log("Recipe:", recipe.title);
    console.log("Profile allergies:", profile.allergies);
    console.log("Profile diets:", profile.diets);
    console.log("API Key exists:", !!import.meta.env.OPENROUTER_API_KEY);
    console.log("API Key starts with:", import.meta.env.OPENROUTER_API_KEY?.substring(0, 10));

    // Step 2: Construct AI prompt
    const prompt = constructAIPrompt(recipe, profile);

    // Step 3: Call OpenRouter AI service
    const aiResponse = await callOpenRouterAPI(prompt);

    // Stop timer
    processingTimeMs = Date.now() - startTime;

    // Step 4: Parse and validate AI response
    const modifiedRecipeData = parseAIResponse(aiResponse);

    // Step 5: Log success (fire-and-forget, don't await)
    logAIModification({
      userId,
      originalRecipeId: recipeId,
      modifiedRecipeId: null,
      userPreferencesSnapshot: {
        allergies: profile.allergies,
        diets: profile.diets,
        disliked_ingredients: profile.disliked_ingredients,
      },
      aiModelUsed: "google/gemini-2.0-flash-exp:free",
      processingTimeMs,
      wasSuccessful: true,
      errorMessage: null,
      supabase,
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to log AI modification:", error);
    });

    // Step 6: Construct and return ModifiedRecipeDto
    return {
      id: null,
      user_id: userId,
      title: modifiedRecipeData.title,
      ingredients: modifiedRecipeData.ingredients,
      instructions: modifiedRecipeData.instructions,
      original_recipe_id: recipeId,
      changes_summary: modifiedRecipeData.changes_summary,
      created_at: null,
      updated_at: null,
    };
  } catch (error) {
    // Stop timer for error case
    processingTimeMs = Date.now() - startTime;

    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Re-throw AIServiceUnavailableError as-is
    if (error instanceof AIServiceUnavailableError) {
      // Log failure (fire-and-forget)
      logAIModification({
        userId,
        originalRecipeId: recipeId,
        modifiedRecipeId: null,
        userPreferencesSnapshot: {},
        aiModelUsed: "google/gemini-2.0-flash-exp:free",
        processingTimeMs,
        wasSuccessful: false,
        errorMessage: error.message,
        supabase,
      }).catch(() => {
        /* ignore logging errors */
      });

      throw error;
    }

    // Log and wrap all other errors
    // eslint-disable-next-line no-console
    console.error("Error modifying recipe with AI:", error);

    logAIModification({
      userId,
      originalRecipeId: recipeId,
      modifiedRecipeId: null,
      userPreferencesSnapshot: {},
      aiModelUsed: "google/gemini-2.0-flash-exp:free",
      processingTimeMs,
      wasSuccessful: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      supabase,
    }).catch(() => {
      /* ignore logging errors */
    });

    throw new Error(`Failed to modify recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Constructs the AI prompt based on recipe and user preferences.
 */
function constructAIPrompt(
  recipe: { title: string; ingredients: string; instructions: string },
  profile: { allergies: string[]; diets: string[]; disliked_ingredients: string[] }
): string {
  const preferencesDescription = [];

  if (profile.allergies.length > 0) {
    preferencesDescription.push(`Allergies: ${profile.allergies.join(", ")}`);
  }

  if (profile.diets.length > 0) {
    preferencesDescription.push(`Dietary preferences: ${profile.diets.join(", ")}`);
  }

  if (profile.disliked_ingredients.length > 0) {
    preferencesDescription.push(`Disliked ingredients: ${profile.disliked_ingredients.join(", ")}`);
  }

  const preferencesText =
    preferencesDescription.length > 0 ? preferencesDescription.join("\n") : "No specific preferences";

  return `You are a helpful cooking assistant. Modify the following recipe to accommodate the user's dietary preferences and restrictions.

Original Recipe:
Title: ${recipe.title}
Ingredients: ${recipe.ingredients}
Instructions: ${recipe.instructions}

User Preferences:
${preferencesText}

Please modify the recipe to accommodate these preferences and return a JSON object with the following structure:
{
  "title": "Modified recipe title (indicate what was changed)",
  "ingredients": "Modified ingredients list",
  "instructions": "Modified cooking instructions",
  "changes_summary": [
    {"type": "substitution", "from": "original ingredient", "to": "replacement ingredient"},
    {"type": "removal", "from": "removed ingredient", "to": ""},
    {"type": "addition", "from": "", "to": "added ingredient"}
  ]
}

Important:
- Keep the recipe recognizable but adapt it fully to the user's needs
- If there are allergies, ensure all allergens are completely removed
- For dietary preferences, substitute ingredients accordingly
- Document all changes in the changes_summary array
- Return ONLY valid JSON, no additional text`;
}

/**
 * Calls the OpenRouter AI API with the constructed prompt.
 */
async function callOpenRouterAPI(prompt: string): Promise<string> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new AIServiceError("OpenRouter API key is not configured");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://healthymeal.app",
        "X-Title": "HealthyMeal Recipe Modifier",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("=== OpenRouter API Error ===");
      console.log("Status:", response.status);
      console.log("Error:", errorText);
      throw new AIServiceUnavailableError(`OpenRouter API returned ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new AIServiceError("Invalid response structure from OpenRouter API");
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof AIServiceUnavailableError || error instanceof AIServiceError) {
      throw error;
    }

    // Network errors, timeouts, etc.
    throw new AIServiceUnavailableError(
      `Failed to connect to OpenRouter AI service: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parses and validates the AI response.
 */
function parseAIResponse(responseText: string): AIModificationResponse {
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;

    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!parsed.title || typeof parsed.title !== "string") {
      throw new Error("Missing or invalid 'title' field");
    }

    if (!parsed.ingredients || typeof parsed.ingredients !== "string") {
      throw new Error("Missing or invalid 'ingredients' field");
    }

    if (!parsed.instructions || typeof parsed.instructions !== "string") {
      throw new Error("Missing or invalid 'instructions' field");
    }

    if (!Array.isArray(parsed.changes_summary)) {
      throw new Error("Missing or invalid 'changes_summary' field");
    }

    return parsed as AIModificationResponse;
  } catch (error) {
    throw new AIServiceError(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Logs an AI modification attempt to the database.
 * This is called asynchronously (fire-and-forget) to avoid adding latency.
 */
async function logAIModification(params: {
  userId: string;
  originalRecipeId: string;
  modifiedRecipeId: string | null;
  userPreferencesSnapshot: Record<string, unknown>;
  aiModelUsed: string;
  processingTimeMs: number;
  wasSuccessful: boolean;
  errorMessage: string | null;
  supabase: SupabaseClient;
}): Promise<void> {
  const { error } = await params.supabase.from("ai_modifications_log").insert({
    user_id: params.userId,
    original_recipe_id: params.originalRecipeId,
    modified_recipe_id: params.modifiedRecipeId,
    user_preferences_snapshot: params.userPreferencesSnapshot,
    ai_model_used: params.aiModelUsed,
    processing_time_ms: params.processingTimeMs,
    was_successful: params.wasSuccessful,
    error_message: params.errorMessage,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to log AI modification to database:", error);
    throw error;
  }
}
