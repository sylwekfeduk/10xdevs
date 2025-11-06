import { Page, Locator } from "@playwright/test";

export class RecipeDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly ingredients: Locator;
  readonly instructions: Locator;
  readonly modifyWithAIButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly backButton: Locator;
  readonly deleteConfirmModal: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly aiModifiedBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use first h1 on the page (recipe title is the main h1)
    this.title = page.locator("h1").first();
    this.description = page.locator('[data-testid="recipe-description"], .recipe-description');
    // Ingredients and instructions are in cards with specific headers
    this.ingredients = page
      .getByRole("heading", { name: /^ingredients$/i })
      .locator("..")
      .locator("..");
    this.instructions = page
      .getByRole("heading", { name: /^instructions$/i })
      .locator("..")
      .locator("..");
    // Buttons from RecipeActionsBar component
    this.modifyWithAIButton = page.getByRole("link", { name: /modify with ai/i });
    this.deleteButton = page.getByRole("button", { name: /delete recipe|deleting/i });
    this.editButton = page.getByRole("button", { name: /edit|edytuj/i });
    this.backButton = page.getByRole("link", { name: /back to recipes/i });
    // Delete modal from DeleteRecipeModal component
    this.deleteConfirmModal = page.locator('[role="dialog"], .modal, [data-testid="delete-modal"]');
    this.deleteConfirmButton = page
      .locator('[role="dialog"] button, .modal button')
      .filter({ hasText: /delete|usuń|confirm|potwierdź/i });
    this.deleteCancelButton = page
      .locator('[role="dialog"] button, .modal button')
      .filter({ hasText: /cancel|anuluj/i });
    this.aiModifiedBadge = page
      .locator('[data-testid="ai-badge"], .ai-modified-badge')
      .filter({ hasText: /ai-modified|zmodyfikowany przez ai/i });
  }

  async goto(recipeId: string) {
    await this.page.goto(`/recipes/${recipeId}`);
  }

  async getTitle() {
    // Wait for the title to be visible before getting its content
    await this.title.waitFor({ state: "visible" });
    return await this.title.textContent();
  }

  async clickModifyWithAI() {
    await this.modifyWithAIButton.click();
  }

  async clickDelete() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    await this.deleteConfirmModal.waitFor({ state: "visible" });
    await this.deleteConfirmButton.click();
  }

  async cancelDelete() {
    await this.deleteConfirmModal.waitFor({ state: "visible" });
    await this.deleteCancelButton.click();
  }

  async deleteRecipe() {
    await this.clickDelete();
    await this.confirmDelete();
  }

  async waitForRedirectAfterDelete() {
    await this.page.waitForURL(/\/recipes$/);
  }

  async isAIModifiedBadgeVisible() {
    return await this.aiModifiedBadge.isVisible();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async isDeleteModalVisible() {
    return await this.deleteConfirmModal.isVisible();
  }
}
