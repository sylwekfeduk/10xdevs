import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/^email$/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.loginButton = page.getByRole("button", { name: /sign in|signing in/i });
    this.errorMessage = page.locator('[role="alert"]');
    this.registerLink = page.getByRole("link", { name: /sign up/i });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot.*password/i });
  }

  async goto() {
    await this.page.goto("/login");
    // Wait for React component to hydrate
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForRedirect() {
    await this.page.waitForURL(/\/(dashboard)/);
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }

  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }

  async isOnLoginPage() {
    // Check if we're on the login page by verifying the login form is visible
    await this.loginButton.waitFor({ state: "visible", timeout: 5000 });
    return await this.loginButton.isVisible();
  }
}
