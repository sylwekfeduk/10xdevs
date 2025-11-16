"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { TagInput } from "@/components/ui/tag-input";
import { ALLERGY_OPTIONS, DIET_OPTIONS } from "@/lib/constants";
import type { ProfileFormViewModel, UpdateProfileCommand } from "@/types";

interface ProfileFormProps {
  initialData: ProfileFormViewModel;
  onSave: (data: UpdateProfileCommand) => void;
  isSaving: boolean;
  translations?: {
    fullName: string;
    fullNamePlaceholder: string;
    avatarUrl: string;
    avatarUrlPlaceholder: string;
    avatarUrlDescription: string;
    allergies: string;
    allergiesPlaceholder: string;
    allergiesDescription: string;
    dietaryPreferences: string;
    dietaryPreferencesPlaceholder: string;
    dietaryPreferencesDescription: string;
    dislikedIngredients: string;
    dislikedIngredientsPlaceholder: string;
    dislikedIngredientsDescription: string;
    saveChanges: string;
    saving: string;
    cancel: string;
  };
}

/**
 * Form component for editing user profile.
 * Manages local form state and tracks changes to enable/disable save button.
 */
export function ProfileForm({ initialData, onSave, isSaving, translations }: ProfileFormProps) {
  const [formData, setFormData] = React.useState<ProfileFormViewModel>(initialData);

  // Track if form is dirty (has unsaved changes)
  const isDirty = React.useMemo(() => {
    return (
      formData.full_name !== initialData.full_name ||
      formData.avatar_url !== initialData.avatar_url ||
      JSON.stringify(formData.allergies) !== JSON.stringify(initialData.allergies) ||
      JSON.stringify(formData.diets) !== JSON.stringify(initialData.diets) ||
      JSON.stringify(formData.disliked_ingredients) !== JSON.stringify(initialData.disliked_ingredients)
    );
  }, [formData, initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isDirty || isSaving) {
      return;
    }

    const updateData: UpdateProfileCommand = {
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
      allergies: formData.allergies,
      diets: formData.diets,
      disliked_ingredients: formData.disliked_ingredients,
    };

    onSave(updateData);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-md border-0">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">{translations?.fullName || "Full Name"}</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
              placeholder={translations?.fullNamePlaceholder || "Enter your full name"}
              disabled={isSaving}
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar_url">{translations?.avatarUrl || "Avatar URL"}</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))}
              placeholder={translations?.avatarUrlPlaceholder || "https://example.com/avatar.jpg"}
              disabled={isSaving}
              pattern="https?://.+"
            />
            <p className="text-sm text-gray-600">
              {translations?.avatarUrlDescription || "Optional: Enter a URL to your profile picture"}
            </p>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">{translations?.allergies || "Allergies"}</Label>
            <MultiSelectCombobox
              options={ALLERGY_OPTIONS}
              value={formData.allergies}
              onChange={(newValue) => setFormData((prev) => ({ ...prev, allergies: newValue }))}
              placeholder={translations?.allergiesPlaceholder || "Select your allergies"}
            />
            <p className="text-sm text-gray-600">
              {translations?.allergiesDescription || "Select any food allergies you have"}
            </p>
          </div>

          {/* Diets */}
          <div className="space-y-2">
            <Label htmlFor="diets">{translations?.dietaryPreferences || "Dietary Preferences"}</Label>
            <MultiSelectCombobox
              options={DIET_OPTIONS}
              value={formData.diets}
              onChange={(newValue) => setFormData((prev) => ({ ...prev, diets: newValue }))}
              placeholder={translations?.dietaryPreferencesPlaceholder || "Select your dietary preferences"}
            />
            <p className="text-sm text-gray-600">
              {translations?.dietaryPreferencesDescription || "Select any dietary preferences you follow"}
            </p>
          </div>

          {/* Disliked Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="disliked_ingredients">{translations?.dislikedIngredients || "Disliked Ingredients"}</Label>
            <TagInput
              value={formData.disliked_ingredients}
              onChange={(newValue) => setFormData((prev) => ({ ...prev, disliked_ingredients: newValue }))}
              placeholder={translations?.dislikedIngredientsPlaceholder || "Type an ingredient and press Enter"}
            />
            <p className="text-sm text-gray-600">
              {translations?.dislikedIngredientsDescription || "Enter ingredients you don't like"}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              disabled={!isDirty || isSaving}
              className="bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translations?.saving || "Saving..."}
                </>
              ) : (
                translations?.saveChanges || "Save Changes"
              )}
            </Button>
            {isDirty && !isSaving && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(initialData)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {translations?.cancel || "Cancel"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
