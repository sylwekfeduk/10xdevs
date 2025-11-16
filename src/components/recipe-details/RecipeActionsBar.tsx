import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator } from "lucide-react";
import type { RecipeDetailsViewModel } from "@/types";

interface RecipeActionsBarProps {
  recipe: RecipeDetailsViewModel;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export function RecipeActionsBar({ recipe, onDeleteClick, isDeleting }: RecipeActionsBarProps) {
  const [isCountingCalories, setIsCountingCalories] = useState(false);

  const handleCountCalories = async () => {
    setIsCountingCalories(true);

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/modify`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to count calories"}`);
        setIsCountingCalories(false);
        return;
      }

      // Success - reload the page to show updated calories
      window.location.reload();
    } catch (error) {
      alert("A network error occurred. Please check your connection.");
      setIsCountingCalories(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleCountCalories}
        disabled={isCountingCalories}
        className="bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
      >
        <Calculator className="mr-2 h-4 w-4" />
        {isCountingCalories ? "Counting..." : "Count the kcal with AI"}
      </Button>
      <Button variant="destructive" onClick={onDeleteClick} disabled={isDeleting}>
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Recipe"}
      </Button>
    </div>
  );
}
