import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Sparkles } from "lucide-react";
import type { RecipeDetailsViewModel } from "@/types";

interface AIHighlightsProps {
  recipe: RecipeDetailsViewModel;
}

export function AIHighlights({ recipe }: AIHighlightsProps) {
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
          <AlertTitle>AI Modifications</AlertTitle>
          <AlertDescription>{recipe.changesSummary}</AlertDescription>
        </Alert>
      )}

      {/* Safety Disclaimer - Always shown for AI-modified recipes */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI-Generated Content Notice</AlertTitle>
        <AlertDescription>
          This recipe has been modified by artificial intelligence. Please review all ingredients, measurements, and
          instructions carefully before preparing. Always verify food safety practices and consider any dietary
          restrictions or allergies.
        </AlertDescription>
      </Alert>
    </div>
  );
}
