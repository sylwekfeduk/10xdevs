"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { TagInput } from "@/components/ui/tag-input";
import { ALLERGY_OPTIONS, DIET_OPTIONS } from "@/lib/constants";
import type { ProfileFormViewModel, UpdateProfileCommand } from "@/types";

interface ProfileFormProps {
  initialData: ProfileFormViewModel;
  onSave: (data: UpdateProfileCommand) => void;
  isSaving: boolean;
}

/**
 * Form component for editing user profile.
 * Manages local form state and tracks changes to enable/disable save button.
 */
export function ProfileForm({ initialData, onSave, isSaving }: ProfileFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
          placeholder="Enter your full name"
          disabled={isSaving}
        />
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input
          id="avatar_url"
          type="url"
          value={formData.avatar_url}
          onChange={(e) => setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))}
          placeholder="https://example.com/avatar.jpg"
          disabled={isSaving}
          pattern="https?://.+"
        />
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <MultiSelectCombobox
          options={ALLERGY_OPTIONS}
          value={formData.allergies}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, allergies: newValue }))}
          placeholder="Select your allergies"
        />
      </div>

      {/* Diets */}
      <div className="space-y-2">
        <Label htmlFor="diets">Dietary Preferences</Label>
        <MultiSelectCombobox
          options={DIET_OPTIONS}
          value={formData.diets}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, diets: newValue }))}
          placeholder="Select your dietary preferences"
        />
      </div>

      {/* Disliked Ingredients */}
      <div className="space-y-2">
        <Label htmlFor="disliked_ingredients">Disliked Ingredients</Label>
        <TagInput
          value={formData.disliked_ingredients}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, disliked_ingredients: newValue }))}
          placeholder="Type an ingredient and press Enter"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={!isDirty || isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
