import { useState, useEffect, useCallback } from "react";
import { recipeModificationService } from "@/lib/services/recipe-modification.service";
import { transformToAIModificationViewModel } from "@/lib/transformers/ai-modification.transformer";
import { navigate } from "@/lib/navigation.service";
import type { AIModificationViewModel } from "@/types";

interface UseAIModificationReturn {
  viewModel: AIModificationViewModel | null;
  isLoading: boolean;
  error: string | null;
  errorType: "not_found" | "service_unavailable" | "generic" | null;
  retry: () => Promise<void>;
}

/**
 * Custom hook to fetch and generate AI modifications for a recipe
 *
 * @param recipeId - The UUID of the recipe to modify
 * @returns Object containing the view model, loading state, errors, and retry function
 */
export function useAIModification(recipeId: string): UseAIModificationReturn {
  const [viewModel, setViewModel] = useState<AIModificationViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "service_unavailable" | "generic" | null>(null);

  const fetchAndModify = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // Step 1: Fetch the original recipe
      const originalResult = await recipeModificationService.fetchRecipe(recipeId);

      if (!originalResult.success) {
        if (originalResult.status === 404) {
          setError(originalResult.error.message);
          setErrorType("not_found");
        } else {
          setError(originalResult.error.message);
          setErrorType("generic");
        }
        setIsLoading(false);
        return;
      }

      // Step 2: Generate AI modifications
      const modifyResult = await recipeModificationService.generateModifications(recipeId);

      if (!modifyResult.success) {
        if (modifyResult.status === 503) {
          setError(modifyResult.error.message);
          setErrorType("service_unavailable");
        } else if (modifyResult.status === 404) {
          setError(modifyResult.error.message);
          setErrorType("not_found");
        } else {
          setError(modifyResult.error.message);
          setErrorType("generic");
        }
        setIsLoading(false);
        return;
      }

      // Step 3: Transform to view model
      const vm = transformToAIModificationViewModel(originalResult.data, modifyResult.data, recipeId);
      setViewModel(vm);
    } catch {
      setError("An unexpected error occurred.");
      setErrorType("generic");
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  // Automatically fetch and modify on mount
  useEffect(() => {
    fetchAndModify();
  }, [fetchAndModify]);

  return {
    viewModel,
    isLoading,
    error,
    errorType,
    retry: fetchAndModify,
  };
}

interface UseModificationSaveReturn {
  isSaving: boolean;
  error: string | null;
  saveModifiedRecipe: (viewModel: AIModificationViewModel) => Promise<void>;
}

/**
 * Custom hook to handle saving modified recipes
 *
 * @returns Object containing save state, error, and save function
 */
export function useModificationSave(): UseModificationSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveModifiedRecipe = useCallback(async (viewModel: AIModificationViewModel) => {
    if (!viewModel || !viewModel.isReadyToSave) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await recipeModificationService.saveModifiedRecipe(viewModel.savePayload);

      if (!result.success) {
        if (result.status === 404) {
          setError("The original recipe no longer exists. Cannot save modifications.");
        } else {
          setError(result.error.message);
        }
        setIsSaving(false);
        return;
      }

      // Redirect to the new recipe's detail page on success
      navigate.toRecipe(result.data.id);
    } catch {
      setError("An unexpected error occurred.");
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    error,
    saveModifiedRecipe,
  };
}
