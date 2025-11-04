import { useState, useEffect, useCallback } from "react";
import type {
  RecipeDetailDto,
  ModifiedRecipeDto,
  AIModificationViewModel,
  AIChangeSummary,
  CreateRecipeCommand,
} from "@/types";

interface UseAIModificationFlowReturn {
  viewModel: AIModificationViewModel | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  errorType: "not_found" | "service_unavailable" | "generic" | null;
  fetchAndModify: () => Promise<void>;
  saveModifiedRecipe: () => Promise<void>;
  discardChanges: () => void;
}

/**
 * Parses the changes_summary string from the ModifiedRecipeDto into structured AIChangeSummary objects.
 *
 * @param changesSummary - The raw changes_summary string from the API
 * @returns Array of structured change summaries
 */
function parseChangesSummary(changesSummary: string | null): AIChangeSummary[] {
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
function transformToViewModel(
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

/**
 * Custom hook to manage the AI recipe modification flow.
 *
 * @description Handles the multi-step process of fetching the original recipe,
 * generating AI modifications, and saving the modified recipe. Manages loading
 * states, errors, and navigation between steps.
 *
 * @param recipeId - The UUID of the recipe to modify
 * @returns Object containing the view model, loading states, and action functions
 */
export function useAIModificationFlow(recipeId: string): UseAIModificationFlowReturn {
  const [viewModel, setViewModel] = useState<AIModificationViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "service_unavailable" | "generic" | null>(null);

  /**
   * Fetches the original recipe and generates AI modifications.
   * Automatically called on component mount.
   */
  const fetchAndModify = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // Step 1: Fetch the original recipe
      const originalResponse = await fetch(`/api/recipes/${recipeId}`);

      // Handle 404 Not Found
      if (originalResponse.status === 404) {
        setError("Recipe not found. It may have been deleted or you don't have access.");
        setErrorType("not_found");
        setIsLoading(false);
        return;
      }

      // Handle 401 Unauthorized - redirect to login
      if (originalResponse.status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle other errors for original recipe fetch
      if (!originalResponse.ok) {
        setError("Could not load the original recipe. Please try again.");
        setErrorType("generic");
        setIsLoading(false);
        return;
      }

      const originalRecipe: RecipeDetailDto = await originalResponse.json();

      // Step 2: Generate AI modifications
      const modifyResponse = await fetch(`/api/recipes/${recipeId}/modify`, {
        method: "POST",
      });

      // Handle 503 Service Unavailable (AI service down)
      if (modifyResponse.status === 503) {
        setError("AI Service is temporarily unavailable. Please try again later.");
        setErrorType("service_unavailable");
        setIsLoading(false);
        return;
      }

      // Handle 404 Not Found
      if (modifyResponse.status === 404) {
        setError("Recipe not found. It may have been deleted or you don't have access.");
        setErrorType("not_found");
        setIsLoading(false);
        return;
      }

      // Handle 401 Unauthorized
      if (modifyResponse.status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle other error responses
      if (!modifyResponse.ok) {
        if (modifyResponse.status >= 500) {
          setError("An unexpected error occurred while generating modifications. Please try again later.");
        } else {
          setError("Could not generate AI modifications. Please try again.");
        }
        setErrorType("generic");
        setIsLoading(false);
        return;
      }

      const modifiedRecipe: ModifiedRecipeDto = await modifyResponse.json();

      // Transform to view model
      const vm = transformToViewModel(originalRecipe, modifiedRecipe, recipeId);
      setViewModel(vm);
    } catch {
      setError("A network error occurred. Please check your connection.");
      setErrorType("generic");
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  /**
   * Saves the modified recipe as a new recipe in the database.
   * Redirects to the new recipe's detail view on success.
   */
  const saveModifiedRecipe = useCallback(async () => {
    if (!viewModel || !viewModel.isReadyToSave) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(viewModel.savePayload),
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle 404 Not Found (original recipe was deleted)
      if (response.status === 404) {
        setError("The original recipe no longer exists. Cannot save modifications.");
        setIsSaving(false);
        return;
      }

      // Handle successful creation (201 Created)
      if (response.status === 201) {
        const savedRecipe: RecipeDetailDto = await response.json();
        // Redirect to the new recipe's detail page
        window.location.href = `/recipes/${savedRecipe.id}`;
        return;
      }

      // Handle other error responses
      if (!response.ok) {
        if (response.status >= 500) {
          setError("Failed to save the modified recipe. Please try again.");
        } else {
          setError("Could not save the recipe. Please check your input and try again.");
        }
        setIsSaving(false);
        return;
      }
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsSaving(false);
    }
  }, [viewModel]);

  /**
   * Discards the AI modifications and navigates back to the original recipe.
   */
  const discardChanges = useCallback(() => {
    window.location.href = `/recipes/${recipeId}`;
  }, [recipeId]);

  // Automatically fetch and modify on mount
  useEffect(() => {
    fetchAndModify();
  }, [fetchAndModify]);

  return {
    viewModel,
    isLoading,
    isSaving,
    error,
    errorType,
    fetchAndModify,
    saveModifiedRecipe,
    discardChanges,
  };
}
