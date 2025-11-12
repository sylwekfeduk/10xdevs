import { useState, useEffect, useCallback } from "react";
import { getLocaleFromUrl, localizedUrl } from "@/lib/i18n";
import type { RecipeDetailDto, RecipeDetailsViewModel } from "@/types";

/**
 * Get the current locale from the browser URL
 */
function getCurrentLocale() {
  if (typeof window !== "undefined") {
    return getLocaleFromUrl(new URL(window.location.href));
  }
  return "en";
}

interface UseRecipeDetailsReturn {
  recipe: RecipeDetailsViewModel | null;
  isLoading: boolean;
  error: string | null;
  deleteRecipe: () => Promise<void>;
  isDeleting: boolean;
}

function transformToViewModel(dto: RecipeDetailDto): RecipeDetailsViewModel {
  const isAIModified = !!dto.original_recipe_id;
  const statusLabel = isAIModified ? "AI-Modified" : "Original";

  return {
    id: dto.id,
    title: dto.title,
    ingredients: dto.ingredients,
    instructions: dto.instructions,
    isAIModified,
    statusLabel,
    changesSummary: dto.changes_summary,
    isDisclaimerNeeded: isAIModified,
  };
}

export function useRecipeDetails(recipeId: string): UseRecipeDetailsReturn {
  const [recipe, setRecipe] = useState<RecipeDetailsViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/recipes/${recipeId}`);

        // Handle 404 Not Found
        if (response.status === 404) {
          setError("Recipe not found. It may have been deleted.");
          setIsLoading(false);
          return;
        }

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          const locale = getCurrentLocale();
          window.location.href = localizedUrl("/login", locale);
          return;
        }

        // Handle other error responses
        if (!response.ok) {
          if (response.status >= 500) {
            setError("An unexpected error occurred. Please try again later.");
          } else {
            setError("Could not load recipe details. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        const data: RecipeDetailDto = await response.json();
        const viewModel = transformToViewModel(data);
        setRecipe(viewModel);
      } catch {
        setError("A network error occurred. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const deleteRecipe = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/login", locale);
        return;
      }

      // Handle 404 Not Found - recipe already deleted
      if (response.status === 404) {
        // Recipe already deleted, redirect to list

        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/recipes", locale);
        return;
      }

      // Handle successful deletion (204 No Content)
      if (response.status === 204) {
        // Redirect to recipe list

        const locale = getCurrentLocale();
        window.location.href = localizedUrl("/recipes", locale);
        return;
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          setError("An error occurred while deleting the recipe. Please try again.");
        } else {
          setError("Could not delete recipe. Please try again.");
        }
        setIsDeleting(false);
        return;
      }
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsDeleting(false);
    }
  }, [recipeId]);

  return {
    recipe,
    isLoading,
    error,
    deleteRecipe,
    isDeleting,
  };
}
