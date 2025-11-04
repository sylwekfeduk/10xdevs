import { useState } from "react";
import { useAIModificationFlow } from "@/components/hooks/useAIModificationFlow";
import { AIDisclaimerAlert } from "./AIDisclaimerAlert";
import { ChangeSummaryList } from "./ChangeSummaryList";
import { AIReviewDiff } from "./AIReviewDiff";
import { ActionButtonsBar } from "./ActionButtonsBar";
import { SaveConfirmationModal } from "./SaveConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AIModificationPageProps {
  recipeId: string;
}

/**
 * AIModificationPage Component
 *
 * @description Main container component for the AI modification flow.
 * Manages the multi-step process of generating AI modifications and
 * saving the modified recipe. Handles loading states, errors, and
 * conditional rendering based on the hook's state.
 *
 * @param recipeId - The UUID of the recipe to modify
 */
export function AIModificationPage({ recipeId }: AIModificationPageProps) {
  const { viewModel, isLoading, isSaving, error, errorType, fetchAndModify, saveModifiedRecipe, discardChanges } =
    useAIModificationFlow(recipeId);

  const [showSaveModal, setShowSaveModal] = useState(false);

  /**
   * Handles the save button click - opens confirmation modal
   */
  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  /**
   * Handles the confirmed save action
   */
  const handleConfirmSave = () => {
    saveModifiedRecipe();
    // Modal will stay open during save, user will be redirected on success
  };

  // Loading state - show skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state - show error message with retry option
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
                {errorType === "not_found" && "Recipe Not Found"}
                {errorType === "service_unavailable" && "AI Service Unavailable"}
                {errorType === "generic" && "An Error Occurred"}
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <div className="flex gap-3">
              {errorType === "service_unavailable" && (
                <Button onClick={fetchAndModify} variant="default">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
              <Button onClick={discardChanges} variant="outline">
                Back to Recipe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No view model available
  if (!viewModel) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No modification data available.</p>
            <Button onClick={discardChanges} variant="outline">
              Back to Recipe
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - show the modification review UI
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">Review AI Modifications</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Review the changes and save as a new recipe or discard them
          </p>
        </div>
      </div>

      {/* AI Disclaimer - Must be prominent */}
      <AIDisclaimerAlert />

      {/* Changes Summary */}
      {viewModel.changesSummary.length > 0 && <ChangeSummaryList changes={viewModel.changesSummary} />}

      {/* Side-by-Side Diff View */}
      <AIReviewDiff viewModel={viewModel} />

      {/* Action Buttons */}
      <div className="sticky bottom-4 rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-950">
        <ActionButtonsBar
          isSaving={isSaving}
          isLoading={isLoading}
          onSaveClick={handleSaveClick}
          onDiscardClick={discardChanges}
        />
      </div>

      {/* Save Confirmation Modal */}
      <SaveConfirmationModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
      />
    </div>
  );
}
