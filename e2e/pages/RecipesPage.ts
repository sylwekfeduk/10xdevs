import { Page, Locator } from "@playwright/test";

export class RecipesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newRecipeButton: Locator;
  readonly recipeCards: Locator;
  readonly sortDropdown: Locator;
  readonly filterInput: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /recipes|przepisy/i });
    this.newRecipeButton = page.getByRole("link", { name: /new recipe|nowy przepis|add|dodaj|create recipe/i });
    this.recipeCards = page.locator('a[href^="/recipes/"]:not([href="/recipes/new"])');
    this.sortDropdown = page.locator('select[name*="sort"], [data-testid="sort"]');
    this.filterInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="szukaj"]');
    this.paginationNext = page.getByRole("button", { name: /next|następna/i });
    this.paginationPrev = page.getByRole("button", { name: /previous|poprzednia/i });
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
  }

  async goto() {
    await this.page.goto("/recipes");
  }

  async clickNewRecipe() {
    await this.newRecipeButton.click();
  }

  async getRecipeCount() {
    return await this.recipeCards.count();
  }

  async clickRecipeCard(index = 0) {
    await this.recipeCards.nth(index).click();
  }

  async clickRecipeByTitle(title: string) {
    const card = this.page.locator('a[href^="/recipes/"]:not([href="/recipes/new"])').filter({ hasText: title });
    await card.click();
  }

  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  async searchRecipe(query: string) {
    await this.filterInput.fill(query);
  }

  async clickNextPage() {
    await this.paginationNext.click();
  }

  async clickPreviousPage() {
    await this.paginationPrev.click();
  }

  async isEmptyStateVisible() {
    return await this.emptyState.isVisible();
  }

  async getFirstRecipeTitle() {
    const firstCard = this.recipeCards.first();
    return await firstCard.locator('h2, h3, [data-testid="recipe-title"]').textContent();
  }
}
