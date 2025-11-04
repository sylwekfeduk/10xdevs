import { RecipeCard } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecipeViewModel } from "@/types";

interface RecipeListProps {
  recipes: RecipeViewModel[];
  isLoading: boolean;
}

export function RecipeList({ recipes, isLoading }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">No recipes found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You haven&apos;t added any recipes yet! Start by creating your first recipe.
        </p>
        <a
          href="/recipes/new"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Create Recipe
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
