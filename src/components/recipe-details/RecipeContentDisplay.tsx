import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecipeDetailsViewModel } from "@/types";

interface RecipeContentDisplayProps {
  recipe: RecipeDetailsViewModel;
}

export function RecipeContentDisplay({ recipe }: RecipeContentDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Title and Status */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight">{recipe.title}</h1>
        <Badge variant={recipe.isAIModified ? "secondary" : "default"} className="shrink-0">
          {recipe.statusLabel}
        </Badge>
      </div>

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{recipe.ingredients}</div>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{recipe.instructions}</div>
        </CardContent>
      </Card>
    </div>
  );
}
