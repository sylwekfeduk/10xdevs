import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecipeViewModel } from "@/types";

interface RecipeCardProps {
  recipe: RecipeViewModel;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <a
      href={recipe.linkPath}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className={recipe.isOriginal ? "border-l-4 border-l-primary" : "border-l-4 border-l-purple-500"}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
            <Badge variant={recipe.isOriginal ? "default" : "secondary"} className="shrink-0">
              {recipe.statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{recipe.displayDate}</p>
        </CardContent>
      </Card>
    </a>
  );
}
