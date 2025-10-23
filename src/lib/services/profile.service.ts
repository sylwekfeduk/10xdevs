import type { SupabaseClient } from "../../db/supabase.client";
import type { ProfileDto, UpdateProfileCommand } from "../../types";

/**
 * Retrieves the profile for the authenticated user.
 *
 * @param userId - The ID of the authenticated user
 * @param supabase - The Supabase client instance
 * @returns The user's profile if found, null otherwise
 * @throws Error for database or other unexpected errors
 */
export async function getProfile(userId: string, supabase: SupabaseClient): Promise<ProfileDto | null> {
  try {
    // Query profile by user_id to ensure authorization
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

    // Handle "not found" case - PostgREST error code PGRST116
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as ProfileDto;
  } catch (error) {
    // Re-throw unexpected errors
    throw new Error(`Failed to retrieve profile: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Updates the profile for the authenticated user.
 *
 * @param userId - The ID of the authenticated user
 * @param data - The profile fields to update
 * @param supabase - The Supabase client instance
 * @returns The updated user profile
 * @throws Error for database or other unexpected errors
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileCommand,
  supabase: SupabaseClient
): Promise<ProfileDto> {
  try {
    // Prepare update data
    const updateData: UpdateProfileCommand & { has_completed_onboarding?: boolean } = { ...data };

    // Business logic: Mark onboarding as complete if preferences are provided
    if (
      (data.allergies && data.allergies.length > 0) ||
      (data.diets && data.diets.length > 0) ||
      (data.disliked_ingredients && data.disliked_ingredients.length > 0)
    ) {
      updateData.has_completed_onboarding = true;
    }

    // Execute update query with user_id filter for authorization
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedProfile) {
      throw new Error("No profile was updated");
    }

    return updatedProfile as ProfileDto;
  } catch (error) {
    // Re-throw unexpected errors
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
