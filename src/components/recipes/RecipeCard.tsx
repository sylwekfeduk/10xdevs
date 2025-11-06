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
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5f4f] focus-visible:ring-offset-2 rounded-lg"
    >
      <Card
        className={
          recipe.isOriginal
            ? "border-l-4 border-l-[#2d5f4f] bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow"
            : "border-l-4 border-l-[#4a8070] bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 text-gray-900">{recipe.title}</CardTitle>
            <Badge
              variant={recipe.isOriginal ? "default" : "secondary"}
              className={
                recipe.isOriginal
                  ? "shrink-0 bg-[#2d5f4f] hover:bg-[#234a3d] text-white"
                  : "shrink-0 bg-[#2d5f4f]/10 text-[#2d5f4f] hover:bg-[#2d5f4f]/20"
              }
            >
              {recipe.statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{recipe.displayDate}</p>
        </CardContent>
      </Card>
    </a>
  );
}
