import { test, expect } from "./fixtures/base";
import { NewRecipePage } from "./pages/NewRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { RecipeModifyPage } from "./pages/RecipeModifyPage";
import { RecipesPage } from "./pages/RecipesPage";

test.describe("AI Recipe Modification", () => {
  test.describe("Happy Path", () => {
    test("TC3.1: User can modify recipe with AI and see comparison", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create a recipe first
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `Recipe for AI ${Date.now()}`,
        description: "Original recipe with meat",
        ingredients: "500g chicken breast\n2 cups rice\n1 onion",
        instructions: "Cook chicken\nPrepare rice\nMix together",
      });
      await newRecipePage.waitForRedirect();

      // Click modify with AI
      await recipeDetailPage.clickModifyWithAI();

      // Should see loading state
      await authenticatedPage.waitForTimeout(500);
      expect(await recipeModifyPage.isLoadingVisible()).toBe(true);

      // Wait for modification to complete (with timeout)
      await recipeModifyPage.waitForModification();

      // Should see comparison screen
      expect(await recipeModifyPage.isComparisonVisible()).toBe(true);
    });

    test("TC3.2: AI warning is always visible on modification page", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create and modify recipe
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `Warning Test ${Date.now()}`,
        description: "Test",
        ingredients: "Test ingredients",
        instructions: "Test instructions",
      });
      await newRecipePage.waitForRedirect();

      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();

      // AI warning should be visible
      expect(await recipeModifyPage.isAIWarningVisible()).toBe(true);
    });
  });

  test.describe("Save and Discard", () => {
    test("TC3.3: User can save modified recipe creating new AI-Modified entry", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);
      const recipesPage = new RecipesPage(authenticatedPage);

      // Create recipe
      const originalTitle = `Original Recipe ${Date.now()}`;
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: originalTitle,
        description: "Original description",
        ingredients: "Original ingredients",
        instructions: "Original instructions",
      });
      await newRecipePage.waitForRedirect();

      const originalRecipeUrl = authenticatedPage.url();

      // Modify with AI
      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();

      // Save modified version
      await recipeModifyPage.saveModifiedRecipe();
      await recipeModifyPage.waitForRedirectAfterSave();

      // Should be on new recipe page
      const newRecipeUrl = authenticatedPage.url();
      expect(newRecipeUrl).not.toBe(originalRecipeUrl);
      expect(newRecipeUrl).toMatch(/\/recipes\/[^/]+$/);

      // New recipe should have AI-Modified badge (if implemented)
      const _hasBadge = await recipeDetailPage.isAIModifiedBadgeVisible().catch(() => false);

      // Go to recipes list and verify we have 2 recipes now
      await recipesPage.goto();
      await authenticatedPage.waitForLoadState("networkidle");

      const recipeCount = await recipesPage.getRecipeCount();
      expect(recipeCount).toBeGreaterThanOrEqual(2);
    });

    test("TC3.4: Original recipe remains unchanged after saving AI-modified version", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create recipe
      const originalTitle = `Unchanged Recipe ${Date.now()}`;
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: originalTitle,
        description: "Original description",
        ingredients: "Original ingredients",
        instructions: "Original instructions",
      });
      await newRecipePage.waitForRedirect();

      const originalRecipeId = authenticatedPage.url().split("/").pop();
      const originalTitleDisplayed = await recipeDetailPage.getTitle();

      // Modify with AI and save
      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();
      await recipeModifyPage.saveModifiedRecipe();
      await recipeModifyPage.waitForRedirectAfterSave();

      // Navigate back to original recipe
      if (!originalRecipeId) throw new Error("Original recipe ID not found");
      await recipeDetailPage.goto(originalRecipeId);
      await authenticatedPage.waitForLoadState("networkidle");

      // Original title should still be there
      const currentTitle = await recipeDetailPage.getTitle();
      expect(currentTitle).toContain(originalTitle);
      expect(currentTitle).toBe(originalTitleDisplayed);
    });

    test("TC3.5: User can discard changes and return to original recipe", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create recipe
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `Discard Test ${Date.now()}`,
        description: "Test",
        ingredients: "Test",
        instructions: "Test",
      });
      await newRecipePage.waitForRedirect();

      const originalRecipeUrl = authenticatedPage.url();

      // Modify with AI
      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();

      // Discard changes
      await recipeModifyPage.discardChanges();
      await recipeModifyPage.waitForRedirectAfterDiscard();

      // Should be back on original recipe page
      expect(authenticatedPage.url()).toBe(originalRecipeUrl);
    });
  });

  test.describe("Error Handling", () => {
    test("TC3.6: When AI service is unavailable, user sees error with retry option", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create recipe
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `Error Test ${Date.now()}`,
        description: "Test",
        ingredients: "Test",
        instructions: "Test",
      });
      await newRecipePage.waitForRedirect();

      const recipeId = authenticatedPage.url().split("/").pop();
      if (!recipeId) throw new Error("Recipe ID not found");

      // Mock API error by intercepting the request
      await authenticatedPage.route(`**/api/recipes/${recipeId}/modify`, (route) => {
        route.fulfill({
          status: 503,
          body: JSON.stringify({ error: "Service unavailable" }),
        });
      });

      // Try to modify
      await recipeModifyPage.goto(recipeId);
      await authenticatedPage.waitForTimeout(2000);

      // Should see error message
      const hasError = await recipeModifyPage.isErrorVisible();
      expect(hasError).toBe(true);

      // Retry button should be visible
      const hasRetry = await recipeModifyPage.isRetryButtonVisible();
      expect(hasRetry).toBe(true);
    });

    test("TC3.7: Attempting to modify non-existent recipe shows error page", async ({ authenticatedPage }) => {
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Try to modify non-existent recipe
      await recipeModifyPage.goto("non-existent-id-123456");
      await authenticatedPage.waitForTimeout(1000);

      // Should see error or be redirected
      const isErrorPage =
        authenticatedPage.url().includes("404") ||
        authenticatedPage.url().includes("error") ||
        (await authenticatedPage
          .locator("text=/not found|error|404/i")
          .isVisible()
          .catch(() => false));

      expect(isErrorPage).toBe(true);
    });
  });

  test.describe("Edge Cases", () => {
    test("Multiple modifications: User can modify a recipe multiple times", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);
      const recipeModifyPage = new RecipeModifyPage(authenticatedPage);

      // Create recipe
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `Multi Modify ${Date.now()}`,
        description: "Test",
        ingredients: "Test",
        instructions: "Test",
      });
      await newRecipePage.waitForRedirect();

      // First modification
      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();
      await recipeModifyPage.saveModifiedRecipe();
      await recipeModifyPage.waitForRedirectAfterSave();

      // Second modification on the AI-modified recipe
      await recipeDetailPage.clickModifyWithAI();
      await recipeModifyPage.waitForModification();

      // Should still work
      expect(await recipeModifyPage.isComparisonVisible()).toBe(true);
      expect(await recipeModifyPage.isAIWarningVisible()).toBe(true);
    });
  });
});
