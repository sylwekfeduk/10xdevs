import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecipeViewModel } from "@/types";
import { useTranslation } from "@/components/hooks/useTranslation";

interface RecipeCardProps {
  recipe: RecipeViewModel;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t } = useTranslation();

  // Map status label to translation key
  const getStatusLabelTranslation = (statusLabel: RecipeViewModel["statusLabel"]): string => {
    switch (statusLabel) {
      case "Original":
        return t("status.original");
      case "AI-Modified":
        return t("status.aiModified");
      case "From Catalog":
        return t("status.fromCatalog");
      default:
        return statusLabel;
    }
  };
  // Determine card styling based on recipe source
  const getBorderColor = () => {
    if (recipe.isCopiedFromMaster) return "border-l-[#9b5de5]"; // Purple for catalog recipes
    if (recipe.isOriginal) return "border-l-[#3F8C4F]"; // Green for originals
    return "border-l-[#4a8070]"; // Teal for AI-modified
  };

  const getBadgeStyles = () => {
    if (recipe.isCopiedFromMaster) {
      return "shrink-0 bg-[#9b5de5] hover:bg-[#7b3ec7] text-white";
    }
    if (recipe.isOriginal) {
      return "shrink-0 bg-[#3F8C4F] hover:bg-[#234a3d] text-white";
    }
    return "shrink-0 bg-[#3F8C4F]/10 text-[#3F8C4F] hover:bg-[#3F8C4F]/20";
  };

  return (
    <a
      href={recipe.linkPath}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F8C4F] focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className={`border-l-4 ${getBorderColor()} bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 text-gray-900">{recipe.title}</CardTitle>
            <Badge
              variant={recipe.isOriginal || recipe.isCopiedFromMaster ? "default" : "secondary"}
              className={getBadgeStyles()}
            >
              {getStatusLabelTranslation(recipe.statusLabel)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-600">{recipe.displayDate}</p>
            {recipe.kcal !== null && recipe.kcal !== undefined && (
              <div className="px-3 py-1 bg-[#3F8C4F] rounded-md shrink-0">
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  {String(recipe.kcal)} kcal
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
