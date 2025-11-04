"use client";

import * as React from "react";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/components/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ProfileFormViewModel } from "@/types";

/**
 * Main container component for the profile page.
 * Handles data fetching, loading states, and orchestrates the ProfileForm.
 */
export function ProfileView() {
  const { profile, isLoading, error, isSuccess, updateProfile, refetch } = useProfile();

  // Show success toast when profile is updated
  React.useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully!");
    }
  }, [isSuccess]);

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  // Error state (only if profile couldn't be loaded initially)
  if (error && profile === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            Retry
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
        <AlertTitle>Profile Not Found</AlertTitle>
        <AlertDescription>Unable to load your profile. Please try refreshing the page.</AlertDescription>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile information and dietary preferences</p>
      </div>

      {/* Onboarding Alert */}
      {!profile.has_completed_onboarding && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Welcome!</AlertTitle>
          <AlertDescription>
            Please complete your profile to get started. Your dietary preferences help us personalize recipes for you.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Form */}
      <ProfileForm initialData={formData} onSave={updateProfile} isSaving={isLoading} />
    </div>
  );
}
