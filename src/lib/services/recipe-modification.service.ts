import type { RecipeDetailDto, ModifiedRecipeDto, CreateRecipeCommand } from "@/types";

/**
 * Result type for type-safe error handling
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E; status?: number };

/**
 * Service for managing recipe modifications and AI-generated recipe changes
 */
export class RecipeModificationService {
  /**
   * Fetches a recipe by ID
   */
  async fetchRecipe(recipeId: string): Promise<Result<RecipeDetailDto>> {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: new Error("Recipe not found. It may have been deleted or you don't have access."),
          status: 404,
        };
      }

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        window.location.href = "/login";
        return {
          success: false,
          error: new Error("Unauthorized"),
          status: 401,
        };
      }

      // Handle other errors
      if (!response.ok) {
        return {
          success: false,
          error: new Error("Could not load the recipe. Please try again."),
          status: response.status,
        };
      }

      const data: RecipeDetailDto = await response.json();
      return { success: true, data };
    } catch {
      return {
        success: false,
        error: new Error("A network error occurred. Please check your connection."),
      };
    }
  }

  /**
   * Generates AI modifications for a recipe
   */
  async generateModifications(recipeId: string): Promise<Result<ModifiedRecipeDto>> {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/modify`, {
        method: "POST",
      });

      // Handle 503 Service Unavailable (AI service down)
      if (response.status === 503) {
        return {
          success: false,
          error: new Error("AI Service is temporarily unavailable. Please try again later."),
          status: 503,
        };
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: new Error("Recipe not found. It may have been deleted or you don't have access."),
          status: 404,
        };
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        return {
          success: false,
          error: new Error("Unauthorized"),
          status: 401,
        };
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: new Error("An unexpected error occurred while generating modifications. Please try again later."),
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: new Error("Could not generate AI modifications. Please try again."),
            status: response.status,
          };
        }
      }

      const data: ModifiedRecipeDto = await response.json();
      return { success: true, data };
    } catch {
      return {
        success: false,
        error: new Error("A network error occurred. Please check your connection."),
      };
    }
  }

  /**
   * Saves a modified recipe as a new recipe
   */
  async saveModifiedRecipe(payload: CreateRecipeCommand): Promise<Result<RecipeDetailDto>> {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        return {
          success: false,
          error: new Error("Unauthorized"),
          status: 401,
        };
      }

      // Handle 404 Not Found (original recipe was deleted)
      if (response.status === 404) {
        return {
          success: false,
          error: new Error("The original recipe no longer exists. Cannot save modifications."),
          status: 404,
        };
      }

      // Handle successful creation (201 Created)
      if (response.status === 201) {
        const data: RecipeDetailDto = await response.json();
        return { success: true, data };
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: new Error("Failed to save the modified recipe. Please try again."),
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: new Error("Could not save the recipe. Please check your input and try again."),
            status: response.status,
          };
        }
      }

      return {
        success: false,
        error: new Error("Unexpected response from server"),
      };
    } catch {
      return {
        success: false,
        error: new Error("A network error occurred. Please check your connection."),
      };
    }
  }
}

// Export a singleton instance
export const recipeModificationService = new RecipeModificationService();
