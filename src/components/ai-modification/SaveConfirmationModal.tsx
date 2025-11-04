import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface SaveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSaving: boolean;
}

/**
 * SaveConfirmationModal Component
 *
 * @description Displays a confirmation dialog before saving the modified recipe.
 * Informs the user that a new recipe will be created (the original remains unchanged)
 * and confirms they want to proceed with the save action.
 *
 * @param open - Whether the modal is currently open
 * @param onOpenChange - Handler to control modal open/close state
 * @param onConfirm - Handler to execute the save operation
 * @param isSaving - Whether the save operation is in progress
 */
export function SaveConfirmationModal({ open, onOpenChange, onConfirm, isSaving }: SaveConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Save Modified Recipe
          </DialogTitle>
          <DialogDescription className="text-left">
            <p className="mb-3">
              Are you sure you want to save this AI-modified recipe? This will create a <strong>new recipe</strong> in
              your collection.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The original recipe will remain unchanged. You can find both versions in your recipe library.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Saving..." : "Confirm & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
