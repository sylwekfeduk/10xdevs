import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/hooks/useTranslation";
import type { RecipeDetailsViewModel } from "@/types";

interface AIHighlightsProps {
  recipe: RecipeDetailsViewModel;
}

export function AIHighlights({ recipe }: AIHighlightsProps) {
  const { t } = useTranslation();

  // Only render if the recipe is AI-modified
  if (!recipe.isAIModified) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Changes Summary */}
      {recipe.changesSummary && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>{t("recipes.aiModifications")}</AlertTitle>
          <AlertDescription>{recipe.changesSummary}</AlertDescription>
        </Alert>
      )}

      {/* Safety Disclaimer - Always shown for AI-modified recipes */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t("recipes.aiGeneratedNotice")}</AlertTitle>
        <AlertDescription>
          {t("recipes.aiGeneratedDescription")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
