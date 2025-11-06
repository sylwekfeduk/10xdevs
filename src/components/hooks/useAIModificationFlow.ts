import { useCallback } from "react";
import { useAIModification, useModificationSave } from "./useAIModification";
import { navigate } from "@/lib/navigation.service";
import type { AIModificationViewModel } from "@/types";

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
 * Custom hook to manage the AI recipe modification flow.
 *
 * @description Orchestrates the multi-step process of fetching the original recipe,
 * generating AI modifications, and saving the modified recipe. Manages loading
 * states, errors, and navigation between steps.
 *
 * This hook now uses smaller, focused hooks for better separation of concerns.
 *
 * @param recipeId - The UUID of the recipe to modify
 * @returns Object containing the view model, loading states, and action functions
 */
export function useAIModificationFlow(recipeId: string): UseAIModificationFlowReturn {
  // Use the refactored hooks
  const { viewModel, isLoading, error, errorType, retry } = useAIModification(recipeId);
  const { isSaving, error: saveError, saveModifiedRecipe: saveRecipe } = useModificationSave();

  /**
   * Saves the modified recipe as a new recipe in the database.
   * Redirects to the new recipe's detail view on success.
   */
  const saveModifiedRecipe = useCallback(async () => {
    if (!viewModel) {
      return;
    }
    await saveRecipe(viewModel);
  }, [viewModel, saveRecipe]);

  /**
   * Discards the AI modifications and navigates back to the original recipe.
   */
  const discardChanges = useCallback(() => {
    navigate.toRecipe(recipeId);
  }, [recipeId]);

  return {
    viewModel,
    isLoading,
    isSaving,
    error: error || saveError,
    errorType,
    fetchAndModify: retry,
    saveModifiedRecipe,
    discardChanges,
  };
}
