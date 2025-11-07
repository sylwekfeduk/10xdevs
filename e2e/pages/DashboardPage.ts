import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigation: Locator;
  readonly recipesLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly newRecipeButton: Locator;

  readonly userMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /dashboard|panel/i });
    this.navigation = page.locator("nav");
    this.recipesLink = page.getByRole("link", { name: /recipes|przepisy/i });
    this.profileLink = page.getByRole("link", { name: /profile|profil/i });
    // User avatar button to open dropdown menu (UserNav component)
    // The button is a rounded-full button with ghost variant in the header
    this.userMenuButton = page.locator("button.rounded-full").first();
    // Logout button is in a dropdown menu (UserNav component)
    this.logoutButton = page.getByRole("menuitem", { name: /log out|logging out/i });
    this.newRecipeButton = page.getByRole("link", { name: /new recipe|nowy przepis|add recipe|dodaj/i });
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async clickRecipesLink() {
    await this.recipesLink.click();
  }

  async clickProfileLink() {
    await this.profileLink.click();
  }

  async logout() {
    // First, open the user dropdown menu
    await this.userMenuButton.waitFor({ state: "visible" });
    await this.userMenuButton.click();
    // Wait for menu to open and dropdown items to be visible
    await this.page.waitForTimeout(800);
    // Wait for the logout button to be visible
    await this.logoutButton.waitFor({ state: "visible", timeout: 5000 });
    // Then click logout
    await this.logoutButton.click();
  }

  async clickNewRecipe() {
    await this.newRecipeButton.click();
  }

  async isAuthenticated() {
    return await this.heading.isVisible();
  }
}
