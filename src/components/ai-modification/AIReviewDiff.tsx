import type { AIModificationViewModel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIReviewDiffProps {
  viewModel: AIModificationViewModel;
}

/**
 * AIReviewDiff Component
 *
 * @description Presents a side-by-side comparison of the original and modified recipes.
 * Displays title, ingredients, and instructions fields in a clear, accessible format
 * that emphasizes the differences between the two versions.
 *
 * @param viewModel - The complete AI modification view model containing both recipes
 */
export function AIReviewDiff({ viewModel }: AIReviewDiffProps) {
  const { originalRecipe, modifiedRecipe } = viewModel;

  return (
    <div className="space-y-6">
      {/* Title Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recipe Title</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Original
                </Badge>
              </div>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {originalRecipe.title}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Modified
                </Badge>
              </div>
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 font-medium text-gray-900 dark:border-blue-800 dark:bg-blue-950 dark:text-gray-100">
                {modifiedRecipe.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Original
                </Badge>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                  {originalRecipe.ingredients}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Modified
                </Badge>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-gray-900 dark:text-gray-100">
                  {modifiedRecipe.ingredients}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Original
                </Badge>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                  {originalRecipe.instructions}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Modified
                </Badge>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-gray-900 dark:text-gray-100">
                  {modifiedRecipe.instructions}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
