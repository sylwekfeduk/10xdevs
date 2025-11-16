import { getLocaleFromUrl, localizedUrl } from "./i18n";

/**
 * Get the current locale from the browser URL
 */
function getCurrentLocale() {
  if (typeof window !== "undefined") {
    return getLocaleFromUrl(new URL(window.location.href));
  }
  return "en"; // Default to English if window is not available
}

/**
 * Navigation service for client-side redirects
 * Centralizes navigation logic to avoid spreading window.location calls throughout components
 * All navigation methods are locale-aware and will preserve the current locale
 */
export const navigate = {
  /**
   * Navigate to a specific recipe detail page
   */
  toRecipe: (id: string) => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl(`/recipes/${id}`, locale);
  },

  /**
   * Navigate to the recipes list page
   */
  toRecipes: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/recipes", locale);
  },

  /**
   * Navigate to the login page
   */
  toLogin: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/login", locale);
  },

  /**
   * Navigate to the dashboard
   */
  toDashboard: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/dashboard", locale);
  },

  /**
   * Navigate to the onboarding page
   */
  toOnboarding: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/onboarding", locale);
  },

  /**
   * Navigate to the new recipe creation page
   */
  toNewRecipe: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/recipes/new", locale);
  },

  /**
   * Navigate to the password recovery page
   */
  toPasswordRecovery: () => {
    const locale = getCurrentLocale();
    window.location.href = localizedUrl("/password-recovery", locale);
  },
};
