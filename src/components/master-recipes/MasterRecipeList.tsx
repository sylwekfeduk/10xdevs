import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MasterRecipeCard } from "./MasterRecipeCard";
import type { MasterRecipeViewModel } from "@/types";

interface MasterRecipeListProps {
  recipes: MasterRecipeViewModel[];
  isLoading: boolean;
}

export function MasterRecipeList({ recipes, isLoading }: MasterRecipeListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (recipes.length === 0) {
    return (
      <Alert>
        <AlertTitle>No Master Recipes Found</AlertTitle>
        <AlertDescription>There are no master recipes available at this time. Check back later!</AlertDescription>
      </Alert>
    );
  }

  // Recipe Grid
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <MasterRecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
