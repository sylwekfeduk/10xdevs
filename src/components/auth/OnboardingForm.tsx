import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { TagInput } from "@/components/ui/tag-input";
import { ALLERGY_OPTIONS, DIET_OPTIONS } from "@/lib/constants";

/**
 * Onboarding form component for setting user preferences.
 * Collects allergens, diets, and disliked ingredients on first login.
 */
export function OnboardingForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);

  // Validation: at least one preference must be selected
  const isValid = allergies.length > 0 || diets.length > 0 || dislikedIngredients.length > 0;

  // Onboarding submit handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    if (!isValid) {
      setGlobalError("Please select at least one preference to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allergens: allergies,
          diets: diets,
          disliked_ingredients: dislikedIngredients.join(", "),
        }),
      });

      // Handle 401 Unauthorized - session expired
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle 400 Bad Request - validation errors
      if (response.status === 400) {
        const errorData = await response.json();
        setGlobalError(errorData.message || "An error occurred.");
        setIsSubmitting(false);
        return;
      }

      // Handle 500+ Server Error
      if (response.status >= 500) {
        setGlobalError("An internal server error occurred. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      // Handle success (200 OK)
      if (response.ok) {
        window.location.href = "/dashboard";
        return;
      }

      // Handle any other non-ok response
      setGlobalError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    } catch {
      setGlobalError("A network error occurred. Please check your connection.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-white shadow-2xl border-0">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome to HealthyMeal</CardTitle>
        <CardDescription className="text-gray-600">
          Tell us about your dietary preferences to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <MultiSelectCombobox
              options={ALLERGY_OPTIONS}
              value={allergies}
              onChange={setAllergies}
              placeholder="Select your allergies"
            />
            <p className="text-sm text-gray-600">Select any food allergies you have</p>
          </div>

          {/* Diets */}
          <div className="space-y-2">
            <Label htmlFor="diets">Dietary Preferences</Label>
            <MultiSelectCombobox
              options={DIET_OPTIONS}
              value={diets}
              onChange={setDiets}
              placeholder="Select your dietary preferences"
            />
            <p className="text-sm text-gray-600">Select any dietary preferences you follow</p>
          </div>

          {/* Disliked Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="disliked_ingredients">Disliked Ingredients</Label>
            <TagInput
              value={dislikedIngredients}
              onChange={setDislikedIngredients}
              placeholder="Type an ingredient and press Enter"
            />
            <p className="text-sm text-gray-600">Enter ingredients you don't like</p>
          </div>

          {/* Validation message */}
          {!isValid && (
            <p className="text-sm text-gray-600">
              Please select at least one preference (allergy, diet, or disliked ingredient) to continue.
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving preferences...
              </>
            ) : (
              "Complete setup"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
