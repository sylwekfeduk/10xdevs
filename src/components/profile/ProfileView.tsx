"use client";

import * as React from "react";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/components/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ProfileFormViewModel } from "@/types";

interface ProfileViewProps {
  translations?: {
    settingsTitle: string;
    settingsDescription: string;
    loading: string;
    error: string;
    retry: string;
    profileNotFound: string;
    profileNotFoundDescription: string;
    profileUpdatedSuccess: string;
    welcomeTitle: string;
    welcomeDescription: string;
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
 * Main container component for the profile page.
 * Handles data fetching, loading states, and orchestrates the ProfileForm.
 */
export function ProfileView({ translations }: ProfileViewProps) {
  const { profile, isLoading, error, isSuccess, updateProfile, refetch } = useProfile();

  // Show success toast when profile is updated
  React.useEffect(() => {
    if (isSuccess && translations?.profileUpdatedSuccess) {
      toast.success(translations.profileUpdatedSuccess);
    }
  }, [isSuccess, translations]);

  // Show error toast when there's an error during update
  React.useEffect(() => {
    if (error && !isLoading && profile !== null) {
      toast.error(error);
    }
  }, [error, isLoading, profile]);

  // Loading state
  if (isLoading && profile === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3F8C4F]" />
        <p className="mt-4 text-sm text-gray-600">{translations?.loading || "Loading your profile..."}</p>
      </div>
    );
  }

  // Error state (only if profile couldn't be loaded initially)
  if (error && profile === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{translations?.error || "Error"}</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            {translations?.retry || "Retry"}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Profile not found (shouldn't happen if auth is working)
  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{translations?.profileNotFound || "Profile Not Found"}</AlertTitle>
        <AlertDescription>
          {translations?.profileNotFoundDescription || "Unable to load your profile. Please try refreshing the page."}
        </AlertDescription>
      </Alert>
    );
  }

  // Transform ProfileDto to ProfileFormViewModel
  const formData: ProfileFormViewModel = {
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url || "",
    allergies: profile.allergies || [],
    diets: profile.diets || [],
    disliked_ingredients: profile.disliked_ingredients || [],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {translations?.settingsTitle || "Profile Settings"}
        </h1>
        <p className="text-gray-600 mt-2">
          {translations?.settingsDescription || "Manage your profile information and dietary preferences"}
        </p>
      </div>

      {/* Onboarding Alert */}
      {!profile.has_completed_onboarding && (
        <Alert className="border-[#3F8C4F] bg-[#3F8C4F]/10 backdrop-blur-sm">
          <Info className="h-4 w-4 text-[#3F8C4F]" />
          <AlertTitle className="text-[#234a3d]">{translations?.welcomeTitle || "Welcome!"}</AlertTitle>
          <AlertDescription className="text-[#3F8C4F]">
            {translations?.welcomeDescription ||
              "Please complete your profile to get started. Your dietary preferences help us personalize recipes for you."}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Form */}
      <ProfileForm initialData={formData} onSave={updateProfile} isSaving={isLoading} translations={translations} />
    </div>
  );
}
