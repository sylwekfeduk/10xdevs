import { useState, useEffect, useCallback } from "react";
import { getLocaleFromUrl, localizedUrl } from "@/lib/i18n";
import type { GetRecipesQueryParams, PaginatedRecipesResponse, RecipeListItemDto, RecipeViewModel } from "@/types";

interface UseRecipeLibraryReturn {
  recipes: RecipeViewModel[];
  paginationMeta: PaginatedRecipesResponse["pagination"];
  isLoading: boolean;
  error: string | null;
  setQueryState: (updates: Partial<GetRecipesQueryParams>) => void;
  queryState: GetRecipesQueryParams;
}

const DEFAULT_QUERY_STATE: GetRecipesQueryParams = {
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  order: "desc",
};

/**
 * Get the current locale from the browser URL
 */
function getCurrentLocale() {
  if (typeof window !== "undefined") {
    return getLocaleFromUrl(new URL(window.location.href));
  }
  return "en"; // Default to English if window is not available
}

function transformToViewModel(dto: RecipeListItemDto): RecipeViewModel {
  const isOriginal = dto.original_recipe_id === null;
  const statusLabel = isOriginal ? "Original" : "AI-Modified";

  // Format date using Intl.DateTimeFormat for locale-aware display
  const date = new Date(dto.updated_at);
  const displayDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  // Generate locale-aware link path
  const locale = getCurrentLocale();
  const linkPath = localizedUrl(`/recipes/${dto.id}`, locale);

  return {
    id: dto.id,
    title: dto.title,
    isOriginal,
    statusLabel,
    displayDate,
    linkPath,
  };
}

export function useRecipeLibrary(initialState?: Partial<GetRecipesQueryParams>): UseRecipeLibraryReturn {
  const [queryState, setQueryStateInternal] = useState<GetRecipesQueryParams>({
    ...DEFAULT_QUERY_STATE,
    ...initialState,
  });

  const [recipes, setRecipes] = useState<RecipeViewModel[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginatedRecipesResponse["pagination"]>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setQueryState = useCallback((updates: Partial<GetRecipesQueryParams>) => {
    setQueryStateInternal((prev) => {
      const newState = { ...prev, ...updates };

      // If pageSize changes, reset to page 1
      if (updates.pageSize !== undefined && updates.pageSize !== prev.pageSize) {
        newState.page = 1;
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string
        const params = new URLSearchParams({
          page: queryState.page.toString(),
          pageSize: queryState.pageSize.toString(),
          sortBy: queryState.sortBy,
          order: queryState.order,
        });

        const response = await fetch(`/api/recipes?${params.toString()}`);

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          const locale = getCurrentLocale();
          window.location.href = localizedUrl("/login", locale);
          return;
        }

        // Handle other error responses
        if (!response.ok) {
          if (response.status >= 500) {
            setError("An internal server error occurred. Please try again later.");
          } else {
            setError("Could not load recipes. Please try again.");
          }
          setIsLoading(false);
          return;
        }

        const data: PaginatedRecipesResponse = await response.json();

        // Transform DTOs to ViewModels
        const viewModels = data.data.map(transformToViewModel);

        setRecipes(viewModels);
        setPaginationMeta(data.pagination);
      } catch {
        setError("A network error occurred. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [queryState]);

  return {
    recipes,
    paginationMeta,
    isLoading,
    error,
    setQueryState,
    queryState,
  };
}
