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

interface RecipeDetailsPageProps {
  recipeId: string;
}

export function RecipeDetailsPage({ recipeId }: RecipeDetailsPageProps) {
  const { recipe, isLoading, error, deleteRecipe, isDeleting } = useRecipeDetails(recipeId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-6" variant="outline">
          <a href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </a>
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
          <AlertTitle>Recipe Not Found</AlertTitle>
          <AlertDescription>
            The recipe you&apos;re looking for doesn&apos;t exist or has been deleted.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-6" variant="outline">
          <a href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </a>
        </Button>
      </div>
    );
  }

  // Success state - show recipe details
  return (
    <div className="space-y-8">
      {/* Back button and Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <a href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </a>
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
