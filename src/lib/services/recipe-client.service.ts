import { getLocaleFromUrl, localizedUrl } from "@/lib/i18n";
import type { CreateRecipeCommand, RecipeDetailDto } from "@/types";

/**
 * Get the current locale from the browser URL
 */
function getCurrentLocale() {
  if (typeof window !== "undefined") {
    return getLocaleFromUrl(new URL(window.location.href));
  }
  return "en";
}

/**
 * Field-level validation errors from the API
 */
export type FieldErrors = Record<string, string[]>;

/**
 * Result type for type-safe error handling
 */
export type RecipeResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: FieldErrors; status?: number };

/**
 * Client-side service for managing recipe CRUD operations via API endpoints
 */
export class RecipeClientService {
  /**
   * Creates a new recipe
   */
  async createRecipe(command: CreateRecipeCommand): Promise<RecipeResult<RecipeDetailDto>> {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      // Handle 401 Unauthorized - session expired
      if (response.status === 401) {
        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/login", locale);
        return {
          success: false,
          error: "Unauthorized",
          status: 401,
        };
      }

      // Handle 400 Bad Request - validation errors
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.details) {
          return {
            success: false,
            error: errorData.message || "Validation failed",
            fieldErrors: errorData.details,
            status: 400,
          };
        } else {
          return {
            success: false,
            error: errorData.message || "An error occurred.",
            status: 400,
          };
        }
      }

      // Handle 500+ Server Error
      if (response.status >= 500) {
        return {
          success: false,
          error: "An internal server error occurred. Please try again later.",
          status: response.status,
        };
      }

      // Handle success (201 Created)
      if (response.ok) {
        const data: RecipeDetailDto = await response.json();
        return { success: true, data };
      }

      // Handle any other non-ok response
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        status: response.status,
      };
    } catch {
      return {
        success: false,
        error: "A network error occurred. Please check your connection.",
      };
    }
  }

  /**
   * Fetches a recipe by ID
   */
  async getRecipe(recipeId: string): Promise<RecipeResult<RecipeDetailDto>> {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: "Recipe not found. It may have been deleted.",
          status: 404,
        };
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/login", locale);
        return {
          success: false,
          error: "Unauthorized",
          status: 401,
        };
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: "An unexpected error occurred. Please try again later.",
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: "Could not load recipe details. Please try again.",
            status: response.status,
          };
        }
      }

      const data: RecipeDetailDto = await response.json();
      return { success: true, data };
    } catch {
      return {
        success: false,
        error: "A network error occurred. Please check your connection.",
      };
    }
  }

  /**
   * Deletes a recipe by ID
   */
  async deleteRecipe(recipeId: string): Promise<RecipeResult<void>> {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/login", locale);
        return {
          success: false,
          error: "Unauthorized",
          status: 401,
        };
      }

      // Handle 404 Not Found (recipe already deleted)
      if (response.status === 404) {
        // Consider this a success since the recipe is gone
        return { success: true, data: undefined };
      }

      // Handle successful deletion (204 No Content)
      if (response.status === 204) {
        return { success: true, data: undefined };
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: "An error occurred while deleting the recipe. Please try again.",
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: "Could not delete recipe. Please try again.",
            status: response.status,
          };
        }
      }

      return { success: true, data: undefined };
    } catch {
      return {
        success: false,
        error: "A network error occurred. Please check your connection.",
      };
    }
  }
}

// Export a singleton instance
export const recipeClientService = new RecipeClientService();
