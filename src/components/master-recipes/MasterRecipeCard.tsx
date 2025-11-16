import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MasterRecipeViewModel } from "@/types";

interface MasterRecipeCardProps {
  recipe: MasterRecipeViewModel;
}

export function MasterRecipeCard({ recipe }: MasterRecipeCardProps) {
  return (
    <a
      href={recipe.linkPath}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5de5] focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="border-l-4 border-l-[#9b5de5] bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 text-gray-900">{recipe.title}</CardTitle>
            <Badge className="shrink-0 bg-[#9b5de5] hover:bg-[#7b3ec7] text-white">Master Recipe</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recipe.description && <p className="text-sm text-gray-700 line-clamp-2">{recipe.description}</p>}
          <p className="text-sm text-gray-600">{recipe.displayDate}</p>
        </CardContent>
      </Card>
    </a>
  );
}
