import { useRecipeLibrary } from "@/components/hooks/useRecipeLibrary";
import { FilterAndSortBar } from "./FilterAndSortBar";
import { RecipeList } from "./RecipeList";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { GetRecipesQueryParams } from "@/types";

export function RecipeLibraryPage() {
  const { recipes, paginationMeta, isLoading, error, setQueryState, queryState } = useRecipeLibrary();

  const handleSortChange = (sortBy: GetRecipesQueryParams["sortBy"], order: GetRecipesQueryParams["order"]) => {
    setQueryState({ sortBy, order });
  };

  const handlePageChange = (newPage: number) => {
    setQueryState({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryState({ pageSize: newSize });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Recipes</h1>
          <p className="text-muted-foreground mt-2">Browse and manage your recipe collection</p>
        </div>
        <Button asChild>
          <a href="/recipes/new">Create Recipe</a>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter and Sort Bar */}
      <FilterAndSortBar
        currentSortBy={queryState.sortBy}
        currentOrder={queryState.order}
        onSortChange={handleSortChange}
      />

      {/* Recipe List */}
      <RecipeList recipes={recipes} isLoading={isLoading} />

      {/* Pagination Controls */}
      {!isLoading && !error && paginationMeta.total > 0 && (
        <PaginationControls
          pagination={paginationMeta}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
