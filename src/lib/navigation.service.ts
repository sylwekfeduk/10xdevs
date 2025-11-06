/**
 * Navigation service for client-side redirects
 * Centralizes navigation logic to avoid spreading window.location calls throughout components
 */
export const navigate = {
  /**
   * Navigate to a specific recipe detail page
   */
  toRecipe: (id: string) => {
    window.location.href = `/recipes/${id}`;
  },

  /**
   * Navigate to the recipes list page
   */
  toRecipes: () => {
    window.location.href = "/recipes";
  },

  /**
   * Navigate to the login page
   */
  toLogin: () => {
    window.location.href = "/login";
  },

  /**
   * Navigate to the dashboard
   */
  toDashboard: () => {
    window.location.href = "/dashboard";
  },

  /**
   * Navigate to the onboarding page
   */
  toOnboarding: () => {
    window.location.href = "/onboarding";
  },

  /**
   * Navigate to the new recipe creation page
   */
  toNewRecipe: () => {
    window.location.href = "/recipes/new";
  },

  /**
   * Navigate to the password recovery page
   */
  toPasswordRecovery: () => {
    window.location.href = "/password-recovery";
  },
};
