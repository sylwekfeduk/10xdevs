import { useState, useEffect } from "react";
import { getLocaleFromUrl, localizedUrl } from "@/lib/i18n";
import { masterRecipeClientService } from "@/lib/services/master-recipe-client.service";
import type { MasterRecipeDetailDto } from "@/types";

interface UseMasterRecipeDetailsReturn {
  recipe: MasterRecipeDetailDto | null;
  isLoading: boolean;
  error: string | null;
  copyToMyRecipes: () => Promise<void>;
  isCopying: boolean;
  copySuccess: boolean;
}

/**
 * Get the current locale from the browser URL
 */
function getCurrentLocale() {
  if (typeof window !== "undefined") {
    return getLocaleFromUrl(new URL(window.location.href));
  }
  return "en";
}

export function useMasterRecipeDetails(recipeId: string): UseMasterRecipeDetailsReturn {
  const [recipe, setRecipe] = useState<MasterRecipeDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await masterRecipeClientService.getMasterRecipe(recipeId);

        if (result.success) {
          setRecipe(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred while loading the recipe.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const copyToMyRecipes = async () => {
    setIsCopying(true);
    setCopySuccess(false);

    try {
      const result = await masterRecipeClientService.copyMasterRecipeToUser(recipeId);

      if (result.success) {
        setCopySuccess(true);
        // Redirect to the newly created recipe after a short delay
        setTimeout(() => {
          const locale = getCurrentLocale();
          window.location.href = localizedUrl(`/recipes/${result.data.id}`, locale);
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred while copying the recipe.");
    } finally {
      setIsCopying(false);
    }
  };

  return {
    recipe,
    isLoading,
    error,
    copyToMyRecipes,
    isCopying,
    copySuccess,
  };
}
