import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/db/supabase.client";
import { navigate } from "@/lib/navigation.service";

interface UsePasswordResetReturn {
  isValidToken: boolean | null;
  isUpdating: boolean;
  error: string | null;
  validateToken: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

/**
 * Custom hook for managing password reset flow
 * Handles token validation and password update logic
 */
export function usePasswordReset(): UsePasswordResetReturn {
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates the password reset token from the URL
   */
  const validateToken = useCallback(async () => {
    try {
      const { data, error: sessionError } = await supabaseClient.auth.getSession();

      if (sessionError || !data.session) {
        setIsValidToken(false);
        setError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }

      setIsValidToken(true);
    } catch {
      setIsValidToken(false);
      setError("An error occurred while validating your reset link.");
    }
  }, []);

  /**
   * Updates the user's password
   */
  const updatePassword = useCallback(async (password: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsUpdating(false);
        return;
      }

      // Redirect to login on success
      navigate.toLogin();
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsUpdating(false);
    }
  }, []);

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  return {
    isValidToken,
    isUpdating,
    error,
    validateToken,
    updatePassword,
  };
}
