import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface ActionButtonsBarProps {
  isSaving: boolean;
  isLoading: boolean;
  onSaveClick: () => void;
  onDiscardClick: () => void;
}

/**
 * ActionButtonsBar Component
 *
 * @description Groups the primary action buttons for the AI modification flow:
 * "Save Modified Recipe" and "Discard Changes". Handles disabled states during
 * loading and saving operations.
 *
 * @param isSaving - Whether the recipe is currently being saved
 * @param isLoading - Whether the AI modifications are being generated
 * @param onSaveClick - Handler to open the save confirmation modal
 * @param onDiscardClick - Handler to discard changes and navigate back
 */
export function ActionButtonsBar({ isSaving, isLoading, onSaveClick, onDiscardClick }: ActionButtonsBarProps) {
  const isDisabled = isSaving || isLoading;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onDiscardClick} disabled={isDisabled} className="w-full sm:w-auto">
        <X className="h-4 w-4" />
        Discard Changes
      </Button>
      <Button onClick={onSaveClick} disabled={isDisabled} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Modified Recipe"}
      </Button>
    </div>
  );
}
