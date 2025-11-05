import { Page, Locator } from "@playwright/test";

export class PasswordRecoveryPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/^email$/i);
    this.submitButton = page.getByRole("button", { name: /send reset link/i });
    this.backToLoginLink = page.getByRole("link", { name: /return to sign in/i });
  }

  async goto() {
    await this.page.goto("/password-recovery");
    // Wait for React component to hydrate
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);
  }

  async requestPasswordReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
    // Wait for either success or error response to appear
    await this.page.waitForTimeout(1000);
  }

  async waitForSuccess() {
    // Wait for the success card to appear
    await this.page.waitForSelector('h2:has-text("Check your email")', { timeout: 10000 });
  }

  async isSuccessVisible() {
    const successHeading = this.page.getByRole("heading", { name: /check your email/i });
    return await successHeading.isVisible();
  }

  async getSuccessAlertText() {
    // Look for the green alert with "Email sent" title
    const alert = this.page.locator('[role="alert"]').filter({ hasText: /email sent/i });
    return await alert.textContent();
  }

  async waitForError() {
    // Wait for error alert to appear
    await this.page.waitForSelector('[role="alert"]:has-text("Error")', { timeout: 10000 });
  }

  async isErrorVisible() {
    const errorAlert = this.page.locator('[role="alert"]').filter({ hasText: /error/i });
    return await errorAlert.isVisible();
  }

  async getErrorText() {
    const errorAlert = this.page.locator('[role="alert"]').filter({ hasText: /error/i });
    return await errorAlert.textContent();
  }

  async clickBackToLogin() {
    await this.backToLoginLink.click();
  }
}