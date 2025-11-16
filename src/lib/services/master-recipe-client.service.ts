import { getLocaleFromUrl, localizedUrl } from "@/lib/i18n";
import type {
  CreateMasterRecipeCommand,
  MasterRecipeDetailDto,
  UpdateMasterRecipeCommand,
  RecipeDetailDto,
} from "@/types";

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
export type MasterRecipeResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: FieldErrors; status?: number };

/**
 * Client-side service for managing master recipe operations via API endpoints
 */
export class MasterRecipeClientService {
  /**
   * Fetches a master recipe by ID
   */
  async getMasterRecipe(recipeId: string): Promise<MasterRecipeResult<MasterRecipeDetailDto>> {
    try {
      const response = await fetch(`/api/master-recipes/${recipeId}`);

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: "Master recipe not found. It may have been deleted.",
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
            error: "Could not load master recipe details. Please try again.",
            status: response.status,
          };
        }
      }

      const data: MasterRecipeDetailDto = await response.json();
      return { success: true, data };
    } catch {
      return {
        success: false,
        error: "A network error occurred. Please check your connection.",
      };
    }
  }

  /**
   * Creates a new master recipe (admin only)
   */
  async createMasterRecipe(command: CreateMasterRecipeCommand): Promise<MasterRecipeResult<MasterRecipeDetailDto>> {
    try {
      const response = await fetch("/api/master-recipes", {
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

      // Handle 403 Forbidden - not admin
      if (response.status === 403) {
        return {
          success: false,
          error: "You do not have permission to create master recipes. Admin access required.",
          status: 403,
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
        const data: MasterRecipeDetailDto = await response.json();
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
   * Updates an existing master recipe (admin only)
   */
  async updateMasterRecipe(
    recipeId: string,
    command: UpdateMasterRecipeCommand
  ): Promise<MasterRecipeResult<MasterRecipeDetailDto>> {
    try {
      const response = await fetch(`/api/master-recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
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

      // Handle 403 Forbidden - not admin
      if (response.status === 403) {
        return {
          success: false,
          error: "You do not have permission to update master recipes. Admin access required.",
          status: 403,
        };
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: "Master recipe not found.",
          status: 404,
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

      // Handle success (200 OK)
      if (response.ok) {
        const data: MasterRecipeDetailDto = await response.json();
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
   * Deletes a master recipe (admin only)
   */
  async deleteMasterRecipe(recipeId: string): Promise<MasterRecipeResult<void>> {
    try {
      const response = await fetch(`/api/master-recipes/${recipeId}`, {
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

      // Handle 403 Forbidden - not admin
      if (response.status === 403) {
        return {
          success: false,
          error: "You do not have permission to delete master recipes. Admin access required.",
          status: 403,
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
            error: "An error occurred while deleting the master recipe. Please try again.",
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: "Could not delete master recipe. Please try again.",
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

  /**
   * Copies a master recipe to the user's personal collection
   */
  async copyMasterRecipeToUser(recipeId: string): Promise<MasterRecipeResult<RecipeDetailDto>> {
    try {
      const response = await fetch(`/api/master-recipes/${recipeId}/copy`, {
        method: "POST",
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

      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          success: false,
          error: "Master recipe not found. It may have been deleted.",
          status: 404,
        };
      }

      // Handle success (201 Created)
      if (response.status === 201) {
        const data: RecipeDetailDto = await response.json();
        return { success: true, data };
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: "An error occurred while copying the recipe. Please try again.",
            status: response.status,
          };
        } else {
          return {
            success: false,
            error: "Could not copy recipe. Please try again.",
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
}

// Export a singleton instance
export const masterRecipeClientService = new MasterRecipeClientService();
