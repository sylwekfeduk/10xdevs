import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/components/hooks/useTranslation";

interface DeleteRecipeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function DeleteRecipeModal({ isOpen, onOpenChange, onConfirmDelete, isDeleting }: DeleteRecipeModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>{t("recipes.deleteRecipe")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("recipes.deleteConfirm")} {t("recipes.deleteConfirmDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete} disabled={isDeleting}>
            {isDeleting ? t("recipes.deleting") : t("recipes.deleteRecipe")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
