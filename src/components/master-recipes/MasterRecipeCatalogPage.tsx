import { useMasterRecipeCatalog } from "@/components/hooks/useMasterRecipeCatalog";
import { FilterAndSortBar } from "../recipes/FilterAndSortBar";
import { MasterRecipeList } from "./MasterRecipeList";
import { PaginationControls } from "../recipes/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { GetRecipesQueryParams } from "@/types";
import * as React from "react";

export function MasterRecipeCatalogPage() {
  const { recipes, paginationMeta, isLoading, error, setQueryState, queryState } = useMasterRecipeCatalog();

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recipe Catalog</h1>
            <p className="text-gray-600 mt-2">
              Browse our curated collection of recipes and copy them to your personal collection
            </p>
          </div>
        </div>
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

      {/* Master Recipe List */}
      <MasterRecipeList recipes={recipes} isLoading={isLoading} />

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
