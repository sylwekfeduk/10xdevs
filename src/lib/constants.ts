import type { SelectOption } from "@/types";

/**
 * Available allergy options for user profiles.
 * These options are used in the MultiSelectCombobox component on the profile page.
 */
export const ALLERGY_OPTIONS: SelectOption[] = [
  { label: "Peanuts", value: "peanuts" },
  { label: "Tree Nuts", value: "tree_nuts" },
  { label: "Milk", value: "milk" },
  { label: "Eggs", value: "eggs" },
  { label: "Wheat", value: "wheat" },
  { label: "Soy", value: "soy" },
  { label: "Fish", value: "fish" },
  { label: "Shellfish", value: "shellfish" },
  { label: "Sesame", value: "sesame" },
  { label: "Gluten", value: "gluten" },
  { label: "Dairy", value: "dairy" },
  { label: "Corn", value: "corn" },
];

/**
 * Available diet preference options for user profiles.
 * These options are used in the MultiSelectCombobox component on the profile page.
 */
export const DIET_OPTIONS: SelectOption[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Pescatarian", value: "pescatarian" },
  { label: "Keto", value: "keto" },
  { label: "Paleo", value: "paleo" },
  { label: "Mediterranean", value: "mediterranean" },
  { label: "Low Carb", value: "low_carb" },
  { label: "Low Fat", value: "low_fat" },
  { label: "Gluten Free", value: "gluten_free" },
  { label: "Dairy Free", value: "dairy_free" },
  { label: "Halal", value: "halal" },
  { label: "Kosher", value: "kosher" },
];

// ============================================================================
// OpenRouter Configuration
// ============================================================================

/**
 * Available free OpenRouter models.
 *
 * @description These models are available at no cost on OpenRouter.
 * Updated as of January 2025. Check https://openrouter.ai/models for the latest free models.
 */
export const OPENROUTER_FREE_MODELS = {
  /**
   * Google's Gemini 2.0 Flash (Experimental, Free)
   * Fast and versatile model for a wide range of tasks.
   */
  GEMINI_2_FLASH_EXP: "google/gemini-2.0-flash-exp:free",

  /**
   * Google's Gemini 1.5 Flash (Free)
   * Balanced performance and speed for everyday tasks.
   */
  GEMINI_1_5_FLASH: "google/gemini-flash-1.5:free",

  /**
   * Meta's Llama 3.1 8B Instruct (Free)
   * Efficient open-source model for general tasks.
   */
  LLAMA_3_1_8B: "meta-llama/llama-3.1-8b-instruct:free",

  /**
   * Meta's Llama 3.2 3B Instruct (Free)
   * Lightweight model optimized for speed.
   */
  LLAMA_3_2_3B: "meta-llama/llama-3.2-3b-instruct:free",

  /**
   * Microsoft's Phi-3 Medium 128k Instruct (Free)
   * Compact model with large context window.
   */
  PHI_3_MEDIUM: "microsoft/phi-3-medium-128k-instruct:free",
} as const;

/**
 * Default recommended free model for OpenRouter.
 *
 * @description Google's Gemini 2.0 Flash Experimental provides excellent
 * performance at no cost. It's fast, versatile, and suitable for most tasks
 * including recipe modification and chat completions.
 */
export const OPENROUTER_DEFAULT_FREE_MODEL = OPENROUTER_FREE_MODELS.GEMINI_2_FLASH_EXP;
