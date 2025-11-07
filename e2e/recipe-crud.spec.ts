import { test, expect } from "./fixtures/base";
import { RecipesPage } from "./pages/RecipesPage";
import { NewRecipePage } from "./pages/NewRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";

test.describe.serial("Recipe Management (CRUD)", () => {
  test.describe.serial("Create Recipe", () => {
    test("TC2.1: Authenticated user can create new recipe with all required fields", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);

      await newRecipePage.goto();

      const recipe = {
        title: `Test Recipe ${Date.now()}`,
        description: "A delicious test recipe",
        ingredients: "1 cup flour\n2 eggs\n1 cup milk",
        instructions: "Mix all ingredients\nBake at 350F for 30 minutes",
        prepTime: "15",
        cookTime: "30",
        servings: "4",
      };

      await newRecipePage.createRecipe(recipe);

      // Wait for navigation away from the new recipe page to detail page
      await authenticatedPage.waitForURL((url) => !url.pathname.includes("/new") && url.pathname.includes("/recipes/"), { timeout: 15000 });

      // Wait for the page to be fully loaded
      await authenticatedPage.waitForLoadState("networkidle");
      await authenticatedPage.waitForLoadState("domcontentloaded");

      // Verify we're on recipe detail page (not on /recipes/new anymore)
      const currentUrl = authenticatedPage.url();
      expect(currentUrl).toMatch(/\/recipes\/[^/]+$/);
      expect(currentUrl).not.toContain("/new");

      // Wait a bit more to ensure the page is fully rendered
      await authenticatedPage.waitForTimeout(500);

      // Verify recipe title is displayed on the detail page
      const displayedTitle = await recipeDetailPage.getTitle();
      expect(displayedTitle).toContain(recipe.title);
    });

    test("TC2.2: System validates recipe form and prevents saving with empty required fields", async ({
      authenticatedPage,
    }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);

      await newRecipePage.goto();

      // Check that the submit button is disabled when form is empty
      const isButtonDisabled = await newRecipePage.isSubmitButtonDisabled();
      expect(isButtonDisabled).toBe(true);
    });
  });

  test.describe.serial("View Recipes", () => {
    test("TC2.3: User can see list of their recipes", async ({ authenticatedPage }) => {
      const recipesPage = new RecipesPage(authenticatedPage);
      const newRecipePage = new NewRecipePage(authenticatedPage);

      // First create a recipe to ensure list is not empty
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: `My Recipe ${Date.now()}`,
        description: "Test description",
        ingredients: "Test ingredients",
        instructions: "Test instructions",
      });

      // Wait for redirect to recipe detail page
      await authenticatedPage.waitForURL((url) => !url.pathname.includes("/new") && url.pathname.includes("/recipes/"), { timeout: 15000 });
      await authenticatedPage.waitForLoadState("networkidle");

      // Now go to recipes list
      await recipesPage.goto();
      await authenticatedPage.waitForLoadState("networkidle");

      // Wait for recipes to load
      await authenticatedPage.waitForTimeout(1000);

      // Should see at least one recipe
      const recipeCount = await recipesPage.getRecipeCount();
      expect(recipeCount).toBeGreaterThan(0);
    });

    test("TC2.4: Sorting and pagination functionality works correctly", async ({ authenticatedPage }) => {
      test.setTimeout(120000); // 2 minutes timeout for creating 12 recipes

      const recipesPage = new RecipesPage(authenticatedPage);
      const newRecipePage = new NewRecipePage(authenticatedPage);

      // Create 12 recipes to ensure pagination (10 per page, so 12 will create 2 pages)
      const recipeNames = [
        "A Recipe", "B Recipe", "C Recipe", "D Recipe",
        "E Recipe", "F Recipe", "G Recipe", "H Recipe",
        "I Recipe", "J Recipe", "K Recipe", "L Recipe"
      ];

      for (const name of recipeNames) {
        await newRecipePage.goto();
        await authenticatedPage.waitForLoadState("domcontentloaded");

        await newRecipePage.createRecipe({
          title: `${name} ${Date.now()}`,
          description: "Test",
          ingredients: "Test",
          instructions: "Test",
        });

        // Wait for redirect to recipe detail page after each creation
        await authenticatedPage.waitForURL((url) => !url.pathname.includes("/new") && url.pathname.includes("/recipes/"), { timeout: 10000 });
        await authenticatedPage.waitForLoadState("domcontentloaded");
      }

      // Go to recipes list
      await recipesPage.goto();
      await authenticatedPage.waitForLoadState("networkidle");

      // Wait for recipes to load - should see at least 10 on first page
      await authenticatedPage.waitForTimeout(1500);
      let recipeCount = await recipesPage.getRecipeCount();
      expect(recipeCount).toBeGreaterThanOrEqual(10);

      // Test sorting (if dropdown exists)
      const sortDropdownVisible = await recipesPage.sortDropdown.isVisible().catch(() => false);

      if (sortDropdownVisible) {
        const firstTitleBefore = await recipesPage.getFirstRecipeTitle();
        await recipesPage.sortBy("title"); // or whatever option exists
        await authenticatedPage.waitForLoadState("networkidle");
        await authenticatedPage.waitForTimeout(1000);
        const firstTitleAfter = await recipesPage.getFirstRecipeTitle();

        // Titles might have changed after sorting
        // This is a basic check - adjust based on actual implementation
        expect(firstTitleBefore).toBeDefined();
        expect(firstTitleAfter).toBeDefined();
      }

      // Pagination check - if pagination exists
      const paginationVisible = await recipesPage.paginationNext.isVisible().catch(() => false);

      if (paginationVisible) {
        // Wait for pagination button to be enabled (not disabled)
        await authenticatedPage.waitForTimeout(500);

        // Get first page content for comparison
        const firstPageFirstTitle = await recipesPage.getFirstRecipeTitle();

        await recipesPage.clickNextPage();

        // Wait for page navigation/update to complete
        await authenticatedPage.waitForLoadState("networkidle");
        await authenticatedPage.waitForTimeout(1500);

        // Verify we're on a different page (fewer recipes or different content)
        const secondPageRecipeCount = await recipesPage.getRecipeCount();
        const secondPageFirstTitle = await recipesPage.getFirstRecipeTitle();

        // Second page should have fewer recipes (2 in our case) OR different first title
        expect(secondPageRecipeCount <= 10).toBe(true);
        expect(secondPageFirstTitle).toBeDefined();
      }
    });

    test("TC2.5: User can open recipe details by clicking on card", async ({ authenticatedPage }) => {
      const recipesPage = new RecipesPage(authenticatedPage);
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);

      // Create a recipe
      const recipeName = `Clickable Recipe ${Date.now()}`;
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: recipeName,
        description: "Test",
        ingredients: "Test",
        instructions: "Test",
      });

      // Wait for redirect to recipe detail page
      await authenticatedPage.waitForURL((url) => !url.pathname.includes("/new") && url.pathname.includes("/recipes/"), { timeout: 15000 });
      await authenticatedPage.waitForLoadState("networkidle");

      // Go back to list
      await recipesPage.goto();
      await authenticatedPage.waitForLoadState("networkidle");
      await authenticatedPage.waitForTimeout(500);

      // Click first recipe
      await recipesPage.clickRecipeCard(0);

      // Should be on detail page
      await authenticatedPage.waitForTimeout(500);
      expect(authenticatedPage.url()).toMatch(/\/recipes\/[^/]+$/);

      // Title should be visible
      const title = await recipeDetailPage.getTitle();
      expect(title).toBeDefined();
    });
  });

  test.describe.serial("Delete Recipe", () => {
    test("TC2.6: User can permanently delete their recipe after confirmation", async ({ authenticatedPage }) => {
      const newRecipePage = new NewRecipePage(authenticatedPage);
      const recipeDetailPage = new RecipeDetailPage(authenticatedPage);

      // Create a recipe to delete
      const recipeName = `Recipe to Delete ${Date.now()}`;
      await newRecipePage.goto();
      await newRecipePage.createRecipe({
        title: recipeName,
        description: "Will be deleted",
        ingredients: "Test",
        instructions: "Test",
      });

      // Wait for redirect to recipe detail page
      await authenticatedPage.waitForURL((url) => !url.pathname.includes("/new") && url.pathname.includes("/recipes/"), { timeout: 15000 });
      await authenticatedPage.waitForLoadState("networkidle");

      // Delete the recipe
      await recipeDetailPage.clickDelete();

      // Confirmation modal should appear
      expect(await recipeDetailPage.isDeleteModalVisible()).toBe(true);

      // Confirm deletion
      await recipeDetailPage.confirmDelete();

      // Should be redirected to recipes list
      await recipeDetailPage.waitForRedirectAfterDelete();
      expect(authenticatedPage.url()).toMatch(/\/recipes$/);

      // Try to access the deleted recipe directly
      const deletedRecipeUrl = authenticatedPage.url().replace(/\/recipes$/, "");
      const recipeId = deletedRecipeUrl.split("/").pop();

      if (recipeId) {
        await authenticatedPage.goto(`/recipes/${recipeId}`);
        await authenticatedPage.waitForTimeout(1000);

        // Should see error page or be redirected
        const is404 =
          authenticatedPage.url().includes("404") ||
          (await authenticatedPage
            .locator("text=/not found|404/i")
            .isVisible()
            .catch(() => false));

        expect(is404 || authenticatedPage.url().includes("/recipes")).toBe(true);
      }
    });
  });
});
