import { useState, useCallback } from "react";
import { navigate } from "@/lib/navigation.service";
import type { LoginFormData, RegisterFormData } from "@/lib/validation/auth.schemas";

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterFormData) => Promise<void>;
  login: (data: LoginFormData) => Promise<void>;
}

/**
 * Custom hook for authentication operations
 * Handles registration and login with consistent error handling
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registers a new user
   */
  const register = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "An error occurred during registration");
        setIsLoading(false);
        return;
      }

      // Redirect to onboarding on success
      navigate.toOnboarding();
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs in an existing user
   */
  const login = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "An error occurred during login");
        setIsLoading(false);
        return;
      }

      // Redirect based on onboarding status
      if (result.needsOnboarding) {
        navigate.toOnboarding();
      } else {
        navigate.toDashboard();
      }
    } catch {
      setError("A network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    register,
    login,
  };
}
