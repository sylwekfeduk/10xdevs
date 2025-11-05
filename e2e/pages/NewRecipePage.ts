import { Page, Locator } from "@playwright/test";

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
    this.validationError = page.locator('text=/required|is required|cannot be empty/i');
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
    // Only fill the 3 required fields that actually exist in the form
    await this.titleInput.fill(recipe.title);

    if (recipe.ingredients) {
      await this.ingredientsInput.fill(recipe.ingredients);
    }

    if (recipe.instructions) {
      await this.instructionsInput.fill(recipe.instructions);
    }

    // Skip description, prepTime, cookTime, servings - these fields don't exist in the actual form
  }

  async submitRecipe() {
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