import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navigation = page.locator("nav");
  }

  async goto() {
    await this.page.goto("/");
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async getTitle() {
    return await this.page.title();
  }

  async isNavigationVisible() {
    return await this.navigation.isVisible();
  }

  async isHeadingVisible() {
    return await this.heading.isVisible();
  }
}
