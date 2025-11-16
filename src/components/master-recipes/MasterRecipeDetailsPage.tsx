import { useMasterRecipeDetails } from "@/components/hooks/useMasterRecipeDetails";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MasterRecipeDetailsPageProps {
  recipeId: string;
}

export function MasterRecipeDetailsPage({ recipeId }: MasterRecipeDetailsPageProps) {
  const { recipe, isLoading, error, copyToMyRecipes, isCopying, copySuccess } = useMasterRecipeDetails(recipeId);

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
          <a href="/master-recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
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
            The recipe you&apos;re looking for doesn&apos;t exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-6" variant="outline">
          <a href="/master-recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
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
          <a href="/master-recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </a>
        </Button>
        <Button
          onClick={copyToMyRecipes}
          disabled={isCopying || copySuccess}
          className="bg-[#9b5de5] hover:bg-[#7b3ec7] text-white"
        >
          {copySuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Copied! Redirecting...
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              {isCopying ? "Copying..." : "Copy to My Recipes"}
            </>
          )}
        </Button>
      </div>

      {/* Recipe Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{recipe.title}</h1>
            {recipe.description && <p className="text-gray-600 mt-2">{recipe.description}</p>}
          </div>
          <Badge className="shrink-0 bg-[#9b5de5] hover:bg-[#7b3ec7] text-white">Master Recipe</Badge>
        </div>
      </div>

      {/* Copy Info Alert */}
      <Alert className="border-[#9b5de5] bg-[#9b5de5]/5">
        <AlertTitle className="text-[#7b3ec7]">About Master Recipes</AlertTitle>
        <AlertDescription>
          This is a curated recipe from our catalog. Click &quot;Copy to My Recipes&quot; to add it to your personal
          collection, where you can edit it and use AI to modify it to your preferences.
        </AlertDescription>
      </Alert>

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">{recipe.ingredients}</div>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">{recipe.instructions}</div>
        </CardContent>
      </Card>
    </div>
  );
}
