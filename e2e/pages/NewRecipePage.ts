import { Page, Locator, expect } from "@playwright/test";

export class NewRecipePage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly ingredientsInput: Locator;
  readonly instructionsInput: Locator;
  readonly prepTimeInput: Locator;
  readonly cookTimeInput: Locator;
  readonly servingsInput: Locator;
  readonly categorySelect: Locator;
  readonly difficultySelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/^title$/i);
    this.descriptionInput = page.getByLabel(/description|opis/i); // Not used in actual form
    this.ingredientsInput = page.getByLabel(/^ingredients$/i);
    this.instructionsInput = page.getByLabel(/^instructions$/i);
    this.prepTimeInput = page.getByLabel(/prep time|czas przygotowania/i); // Not used
    this.cookTimeInput = page.getByLabel(/cook time|czas gotowania/i); // Not used
    this.servingsInput = page.getByLabel(/servings|porcje|porcji/i); // Not used
    this.categorySelect = page.getByLabel(/category|kategoria/i); // Not used
    this.difficultySelect = page.getByLabel(/difficulty|trudność/i); // Not used
    this.submitButton = page.getByRole("button", { name: /create|save|submit/i });
    this.cancelButton = page.getByRole("button", { name: /cancel|anuluj|reset/i });
    // React Hook Form validation messages (can be in role="alert" or just text)
    this.validationError = page.locator("text=/required|is required|cannot be empty/i");
  }

  async goto() {
    await this.page.goto("/recipes/new");
  }

  async fillRecipeForm(recipe: {
    title: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    prepTime?: string;
    cookTime?: string;
    servings?: string;
  }) {
    // Wait for form to be fully loaded
    await this.titleInput.waitFor({ state: "visible", timeout: 10000 });

    // Only fill the 3 required fields that actually exist in the form
    await this.titleInput.fill(recipe.title);
    await this.page.waitForTimeout(100);

    if (recipe.ingredients) {
      await this.ingredientsInput.fill(recipe.ingredients);
      await this.page.waitForTimeout(100);
    }

    if (recipe.instructions) {
      await this.instructionsInput.fill(recipe.instructions);
      await this.page.waitForTimeout(100);
    }

    // Wait for React Hook Form to complete validation
    // React Hook Form with mode:"onChange" needs time to validate all fields
    await this.page.waitForTimeout(500);

    // Skip description, prepTime, cookTime, servings - these fields don't exist in the actual form
  }

  async submitRecipe() {
    // Wait for the button to be visible
    await this.submitButton.waitFor({ state: "visible" });

    // Wait for the button to be enabled (form validation must complete)
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('button[type="submit"]');
        return button && !button.hasAttribute('disabled');
      },
      { timeout: 5000 }
    );

    // Additional small wait to ensure React has finished updating
    await this.page.waitForTimeout(300);

    // Click the submit button
    await this.submitButton.click();
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
