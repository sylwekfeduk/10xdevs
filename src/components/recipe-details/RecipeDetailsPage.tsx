import { useState } from "react";
import { useRecipeDetails } from "@/components/hooks/useRecipeDetails";
import { RecipeActionsBar } from "./RecipeActionsBar";
import { AIHighlights } from "./AIHighlights";
import { RecipeContentDisplay } from "./RecipeContentDisplay";
import { DeleteRecipeModal } from "./DeleteRecipeModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/components/hooks/useTranslation";
import { localizedUrl } from "@/lib/i18n";

interface RecipeDetailsPageProps {
  recipeId: string;
}

export function RecipeDetailsPage({ recipeId }: RecipeDetailsPageProps) {
  const { recipe, isLoading, error, deleteRecipe, isDeleting } = useRecipeDetails(recipeId);
  const { t, locale } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Create locale-aware back URL
  const backUrl = localizedUrl("/recipes", locale);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-6" variant="outline" onClick={() => (window.location.href = backUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  // Recipe not found state
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("recipes.recipeNotFoundTitle")}</AlertTitle>
          <AlertDescription>{t("recipes.recipeNotFoundDescription")}</AlertDescription>
        </Alert>
        <Button className="mt-6" variant="outline" onClick={() => (window.location.href = backUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  // Success state - show recipe details
  return (
    <div className="space-y-8">
      {/* Back button and Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => (window.location.href = backUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        <RecipeActionsBar recipe={recipe} onDeleteClick={() => setIsDeleteModalOpen(true)} isDeleting={isDeleting} />
      </div>

      {/* AI Highlights (if applicable) */}
      {recipe.isAIModified && <AIHighlights recipe={recipe} />}

      {/* Recipe Content */}
      <RecipeContentDisplay recipe={recipe} />

      {/* Delete Confirmation Modal */}
      <DeleteRecipeModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirmDelete={async () => {
          await deleteRecipe();
          setIsDeleteModalOpen(false);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
