import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GetRecipesQueryParams } from "@/types";

interface FilterAndSortBarProps {
  currentSortBy: GetRecipesQueryParams["sortBy"];
  currentOrder: GetRecipesQueryParams["order"];
  onSortChange: (sortBy: GetRecipesQueryParams["sortBy"], order: GetRecipesQueryParams["order"]) => void;
}

export function FilterAndSortBar({ currentSortBy, currentOrder, onSortChange }: FilterAndSortBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm font-medium">
          Sort by:
        </label>
        <Select
          value={currentSortBy}
          onValueChange={(value) => onSortChange(value as GetRecipesQueryParams["sortBy"], currentOrder)}
        >
          <SelectTrigger id="sort-by" className="w-[160px]">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-order" className="text-sm font-medium">
          Order:
        </label>
        <Select
          value={currentOrder}
          onValueChange={(value) => onSortChange(currentSortBy, value as GetRecipesQueryParams["order"])}
        >
          <SelectTrigger id="sort-order" className="w-[140px]">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
