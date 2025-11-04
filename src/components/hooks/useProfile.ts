import { useState, useEffect, useCallback } from "react";
import type { ProfileDto, UpdateProfileCommand } from "@/types";

interface UseProfileReturn {
  profile: ProfileDto | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  updateProfile: (data: UpdateProfileCommand) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing user profile data and API interactions.
 *
 * Fetches the user's profile on mount and provides methods to update it.
 * Manages loading, error, and success states for both GET and PATCH operations.
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/me/profile");

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Profile not found");
        }
        throw new Error("Failed to load profile");
      }

      const data: ProfileDto = await response.json();
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileCommand) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Invalid profile data");
        }
        throw new Error("Failed to update profile");
      }

      const updatedProfile: ProfileDto = await response.json();
      setProfile(updatedProfile);
      setIsSuccess(true);

      // Reset success state after a brief moment
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    isSuccess,
    updateProfile,
    refetch: fetchProfile,
  };
}
