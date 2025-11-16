import { Page, Locator } from "@playwright/test";

export class NewRecipePage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly ingredientsInput: Locator;
  readonly instructionsInput: Locator;
  readonly kcalInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/^title$/i);
    this.ingredientsInput = page.getByLabel(/^ingredients$/i);
    this.instructionsInput = page.getByLabel(/^instructions$/i);
    this.kcalInput = page.getByLabel(/calories.*kcal/i);
    this.submitButton = page.getByRole("button", { name: /create recipe|save|submit/i });
    this.cancelButton = page.getByRole("button", { name: /cancel|anuluj|reset/i });
    // React Hook Form validation messages (can be in role="alert" or just text)
    this.validationError = page.locator("text=/required|is required|cannot be empty/i");
  }

  async goto() {
    await this.page.goto("/recipes/new");
    // Wait for React to fully hydrate the form
    await this.page.waitForSelector("[astro-island-hydrated]", { timeout: 10000 }).catch(() => {
      console.log("⚠️  No [astro-island-hydrated] attribute found");
    });
    await this.page.waitForLoadState("networkidle");
  }

  async fillRecipeForm(recipe: { title: string; ingredients?: string; instructions?: string; kcal?: string }) {
    // Wait for form to be fully loaded
    await this.titleInput.waitFor({ state: "visible", timeout: 10000 });

    // Extra wait to ensure React event handlers are attached
    await this.page.waitForTimeout(500);

    // Fill required fields and trigger change events
    await this.titleInput.fill(recipe.title);
    await this.titleInput.blur(); // Trigger validation
    await this.page.waitForTimeout(200);

    if (recipe.ingredients) {
      await this.ingredientsInput.fill(recipe.ingredients);
      await this.ingredientsInput.blur(); // Trigger validation
      await this.page.waitForTimeout(200);
    }

    if (recipe.instructions) {
      await this.instructionsInput.fill(recipe.instructions);
      await this.instructionsInput.blur(); // Trigger validation
      await this.page.waitForTimeout(200);
    }

    // Fill optional kcal field if provided
    if (recipe.kcal) {
      await this.kcalInput.fill(recipe.kcal);
      await this.kcalInput.blur();
      await this.page.waitForTimeout(200);
    }

    // Wait for React Hook Form to complete all validations
    // React Hook Form with mode:"onChange" needs time to validate all fields
    await this.page.waitForTimeout(1000);
  }

  async submitRecipe() {
    // Wait for the button to be visible and enabled
    await this.submitButton.waitFor({ state: "visible" });

    // Wait for button to be enabled using Playwright's built-in method
    // This is more reliable than waitForFunction
    await this.submitButton.waitFor({ state: "attached" });
    await this.page.waitForTimeout(500); // Give React time to enable the button

    // Try to click - Playwright will wait for the button to be enabled
    await this.submitButton.click({ timeout: 10000 });
  }

  async createRecipe(recipe: Parameters<typeof this.fillRecipeForm>[0]) {
    await this.fillRecipeForm(recipe);
    await this.submitRecipe();
  }

  async waitForRedirect() {
    await this.page.waitForURL(/\/recipes\/[^/]+$/);
    // Wait for the page to be fully loaded after navigation
    await this.page.waitForLoadState("networkidle");
  }

  async isValidationErrorVisible() {
    return await this.validationError.isVisible();
  }

  async isSubmitButtonDisabled() {
    return await this.submitButton.isDisabled();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
