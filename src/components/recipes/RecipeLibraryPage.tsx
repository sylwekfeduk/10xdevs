import { useRecipeLibrary } from "@/components/hooks/useRecipeLibrary";
import { FilterAndSortBar } from "./FilterAndSortBar";
import { RecipeList } from "./RecipeList";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/hooks/useTranslation";
import { localizedUrl } from "@/lib/i18n";
import type { GetRecipesQueryParams } from "@/types";
import * as React from "react";

export function RecipeLibraryPage() {
  const { t, locale } = useTranslation();
  const { recipes, paginationMeta, isLoading, error, setQueryState, queryState } = useRecipeLibrary();

  // Create locale-aware URL for "Create Recipe" button
  const createRecipeUrl = React.useMemo(() => {
    return localizedUrl("/recipes/new", locale);
  }, [locale]);

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
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("recipes.title")}</h1>
            <p className="text-gray-600 mt-2">{t("recipes.browseCollection")}</p>
          </div>
          <Button asChild className="bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium">
            <a href={createRecipeUrl}>{t("recipes.createRecipe")}</a>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("common.error")}</AlertTitle>
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
