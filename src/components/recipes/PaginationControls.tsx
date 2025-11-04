import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { PaginatedRecipesResponse } from "@/types";

interface PaginationControlsProps {
  pagination: PaginatedRecipesResponse["pagination"];
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export function PaginationControls({ pagination, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const isPreviousDisabled = pagination.page === 1;
  const isNextDisabled = pagination.page >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1} to{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} recipes
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm font-medium">
            Per page:
          </label>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger id="page-size" className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={isPreviousDisabled}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Page {pagination.page} of {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={isNextDisabled}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
