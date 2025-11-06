import { Page, Locator } from "@playwright/test";

export class RecipeModifyPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly loadingSpinner: Locator;
  readonly originalRecipe: Locator;
  readonly modifiedRecipe: Locator;
  readonly changesSummary: Locator;
  readonly aiWarning: Locator;
  readonly saveButton: Locator;
  readonly discardButton: Locator;
  readonly retryButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /modify|modyfikacja|comparison|porównanie/i });
    this.loadingSpinner = page
      .locator('[data-testid="loading"], .loading, [role="status"]')
      .filter({ hasText: /loading|ładowanie/i });
    this.originalRecipe = page.locator('[data-testid="original-recipe"], .original-recipe');
    this.modifiedRecipe = page.locator('[data-testid="modified-recipe"], .modified-recipe');
    this.changesSummary = page.locator('[data-testid="changes-summary"], .changes-summary');
    this.aiWarning = page
      .locator('[data-testid="ai-warning"], .ai-warning, [role="alert"]')
      .filter({ hasText: /ai|generated|generowane/i });
    this.saveButton = page.getByRole("button", { name: /save|accept|zapisz|akceptuj/i });
    this.discardButton = page.getByRole("button", { name: /discard|reject|odrzuć|anuluj/i });
    this.retryButton = page.getByRole("button", { name: /retry|spróbuj ponownie/i });
    this.errorMessage = page.locator('[role="alert"], .error-message, [data-testid="error"]');
  }

  async goto(recipeId: string) {
    await this.page.goto(`/recipes/${recipeId}/modify`);
  }

  async waitForModification() {
    // Wait for loading to disappear
    await this.loadingSpinner.waitFor({ state: "visible" });
    await this.loadingSpinner.waitFor({ state: "hidden", timeout: 30000 });
  }

  async isLoadingVisible() {
    return await this.loadingSpinner.isVisible();
  }

  async isComparisonVisible() {
    const originalVisible = await this.originalRecipe.isVisible().catch(() => false);
    const modifiedVisible = await this.modifiedRecipe.isVisible().catch(() => false);
    return originalVisible && modifiedVisible;
  }

  async isAIWarningVisible() {
    return await this.aiWarning.isVisible();
  }

  async getChangesSummary() {
    return await this.changesSummary.textContent();
  }

  async saveModifiedRecipe() {
    await this.saveButton.click();
  }

  async discardChanges() {
    await this.discardButton.click();
  }

  async waitForRedirectAfterSave() {
    await this.page.waitForURL(/\/recipes\/[^/]+$/);
  }

  async waitForRedirectAfterDiscard() {
    await this.page.waitForURL(/\/recipes\/[^/]+$/);
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }

  async clickRetry() {
    await this.retryButton.click();
  }

  async isRetryButtonVisible() {
    return await this.retryButton.isVisible();
  }
}
