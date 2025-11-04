import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

/**
 * AIDisclaimerAlert Component
 *
 * @description Displays a mandatory, visually prominent disclaimer regarding
 * AI-generated content. Emphasizes the need for users to verify the modifications,
 * especially concerning allergens and dietary restrictions.
 *
 * This component uses Shadcn/ui Alert with a destructive/warning style to
 * ensure high visibility and meet safety requirements from the PRD.
 */
export function AIDisclaimerAlert() {
  return (
    <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">Important: AI-Generated Content</AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-relaxed">
        <p className="mb-2">
          This recipe has been modified using artificial intelligence based on your dietary preferences and
          restrictions. <strong>Please carefully review all changes before using this recipe.</strong>
        </p>
        <p className="mb-2">
          <strong className="text-red-700 dark:text-red-400">Allergy Warning:</strong> AI modifications may not always
          accurately identify or substitute allergens. Always verify ingredient lists against your specific allergies
          and dietary needs.
        </p>
        <p>
          If you have severe allergies or medical dietary restrictions, consult with a healthcare professional or
          nutritionist before following this modified recipe.
        </p>
      </AlertDescription>
    </Alert>
  );
}
