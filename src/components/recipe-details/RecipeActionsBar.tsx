import { Button } from "@/components/ui/button";
import { Trash2, Sparkles } from "lucide-react";
import type { RecipeDetailsViewModel } from "@/types";

interface RecipeActionsBarProps {
  recipe: RecipeDetailsViewModel;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export function RecipeActionsBar({ recipe, onDeleteClick, isDeleting }: RecipeActionsBarProps) {
  return (
    <div className="flex items-center gap-3">
      <Button asChild className="bg-[#2d5f4f] hover:bg-[#234a3d] text-white font-medium">
        <a href={`/recipes/${recipe.id}/modify`}>
          <Sparkles className="mr-2 h-4 w-4" />
          Modify with AI
        </a>
      </Button>
      <Button variant="destructive" onClick={onDeleteClick} disabled={isDeleting}>
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Recipe"}
      </Button>
    </div>
  );
}
