import type { AIChangeSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface ChangeSummaryListProps {
  changes: AIChangeSummary[];
}

/**
 * ChangeSummaryList Component
 *
 * @description Renders a structured list of AI-generated changes to the recipe.
 * Each change includes the type of modification (e.g., substitution, addition),
 * and the before/after values in an accessible, easy-to-scan format.
 *
 * @param changes - Array of structured change summaries from the AI
 */
export function ChangeSummaryList({ changes }: ChangeSummaryListProps) {
  // Don't render if there are no changes
  if (!changes || changes.length === 0) {
    return null;
  }

  /**
   * Maps change type to a user-friendly display variant
   */
  const getChangeVariant = (type: string): "default" | "secondary" | "outline" => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("substitution") || lowerType.includes("replace")) {
      return "default";
    }
    if (lowerType.includes("addition") || lowerType.includes("add")) {
      return "secondary";
    }
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Modifications Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Badge variant={getChangeVariant(change.type)} className="capitalize">
                  {change.type}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex-1 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Original:</span> {change.from}
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="flex-1 text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Modified:</span> {change.to}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
