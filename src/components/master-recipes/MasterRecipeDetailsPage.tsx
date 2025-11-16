import { useMasterRecipeDetails } from "@/components/hooks/useMasterRecipeDetails";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/hooks/useTranslation";
import { localizedUrl } from "@/lib/i18n";

interface MasterRecipeDetailsPageProps {
  recipeId: string;
}

export function MasterRecipeDetailsPage({ recipeId }: MasterRecipeDetailsPageProps) {
  const { recipe, isLoading, error, copyToMyRecipes, isCopying, copySuccess } = useMasterRecipeDetails(recipeId);
  const { t, locale } = useTranslation();

  // Create locale-aware back URL
  const backUrl = localizedUrl("/master-recipes", locale);

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
          <AlertTitle>{t("masterRecipes.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-6" variant="outline" onClick={() => (window.location.href = backUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("masterRecipes.backToCatalog")}
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
          <AlertTitle>{t("masterRecipes.recipeNotFound")}</AlertTitle>
          <AlertDescription>{t("masterRecipes.recipeNotFoundDescription")}</AlertDescription>
        </Alert>
        <Button className="mt-6" variant="outline" onClick={() => (window.location.href = backUrl)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("masterRecipes.backToCatalog")}
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
          {t("masterRecipes.backToCatalog")}
        </Button>
        <Button
          onClick={copyToMyRecipes}
          disabled={isCopying || copySuccess}
          className="bg-[#9b5de5] hover:bg-[#7b3ec7] text-white"
        >
          {copySuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("masterRecipes.copiedRedirecting")}
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              {isCopying ? t("masterRecipes.copying") : t("masterRecipes.copyToMyRecipes")}
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
          <Badge className="shrink-0 bg-[#9b5de5] hover:bg-[#7b3ec7] text-white">
            {t("masterRecipes.masterRecipeBadge")}
          </Badge>
        </div>
      </div>

      {/* Copy Info Alert */}
      <Alert className="border-[#9b5de5] bg-[#9b5de5]/5">
        <AlertTitle className="text-[#7b3ec7]">{t("masterRecipes.aboutTitle")}</AlertTitle>
        <AlertDescription>{t("masterRecipes.aboutDescription")}</AlertDescription>
      </Alert>

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("masterRecipes.ingredients")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">{recipe.ingredients}</div>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("masterRecipes.instructions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">{recipe.instructions}</div>
        </CardContent>
      </Card>
    </div>
  );
}
