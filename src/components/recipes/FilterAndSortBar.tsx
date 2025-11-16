import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/components/hooks/useTranslation";
import type { GetRecipesQueryParams } from "@/types";

interface FilterAndSortBarProps {
  currentSortBy: GetRecipesQueryParams["sortBy"];
  currentOrder: GetRecipesQueryParams["order"];
  onSortChange: (sortBy: GetRecipesQueryParams["sortBy"], order: GetRecipesQueryParams["order"]) => void;
}

export function FilterAndSortBar({ currentSortBy, currentOrder, onSortChange }: FilterAndSortBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm font-medium">
          {t("recipes.sortByLabel")}
        </label>
        <Select
          value={currentSortBy}
          onValueChange={(value) => onSortChange(value as GetRecipesQueryParams["sortBy"], currentOrder)}
        >
          <SelectTrigger id="sort-by" className="w-[160px]">
            <SelectValue placeholder={t("recipes.selectField")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">{t("recipes.createdDate")}</SelectItem>
            <SelectItem value="updated_at">{t("recipes.updatedDate")}</SelectItem>
            <SelectItem value="title">{t("recipes.titleField")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-order" className="text-sm font-medium">
          {t("recipes.order")}
        </label>
        <Select
          value={currentOrder}
          onValueChange={(value) => onSortChange(currentSortBy, value as GetRecipesQueryParams["order"])}
        >
          <SelectTrigger id="sort-order" className="w-[140px]">
            <SelectValue placeholder={t("recipes.selectOrder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t("recipes.newestFirst")}</SelectItem>
            <SelectItem value="asc">{t("recipes.oldestFirst")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
