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
    ingredients?: string;
    instructions?: string;
    kcal?: string;
  }) {
    // Wait for form to be fully loaded
    await this.titleInput.waitFor({ state: "visible", timeout: 10000 });

    // Fill required fields
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

    // Fill optional kcal field if provided
    if (recipe.kcal) {
      await this.kcalInput.fill(recipe.kcal);
      await this.page.waitForTimeout(100);
    }

    // Wait for React Hook Form to complete validation
    // React Hook Form with mode:"onChange" needs time to validate all fields
    await this.page.waitForTimeout(500);
  }

  async submitRecipe() {
    // Wait for the button to be visible
    await this.submitButton.waitFor({ state: "visible" });

    // Wait for the button to be enabled (form validation must complete)
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('button[type="submit"]');
        return button && !button.hasAttribute("disabled");
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
