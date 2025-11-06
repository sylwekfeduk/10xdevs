import { Page, Locator } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/^email$/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.registerButton = page.getByRole("button", { name: /create account|creating account/i });
    // Server error (Alert component with role="alert")
    this.errorMessage = page.locator('[role="alert"]');
    // Inline validation errors (FormMessage component)
    this.validationError = page.locator('[data-slot="form-message"]');
    this.loginLink = page.getByRole("link", { name: /sign in/i });
  }

  async goto() {
    await this.page.goto("/register");
    // Wait for React component to hydrate
    await this.page.waitForLoadState("networkidle");
    // Wait a bit for React to take over the form
    await this.page.waitForTimeout(500);
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (this.confirmPasswordInput && confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
    await this.registerButton.click();
    // Wait a moment for React Hook Form validation to process
    await this.page.waitForTimeout(500);
  }

  async waitForRedirect() {
    await this.page.waitForURL(/\/onboarding/);
  }

  async isErrorVisible() {
    const alertVisible = await this.errorMessage.isVisible().catch(() => false);
    const validationVisible = await this.validationError
      .first()
      .isVisible()
      .catch(() => false);
    return alertVisible || validationVisible;
  }

  async getErrorText() {
    const alertVisible = await this.errorMessage.isVisible().catch(() => false);
    if (alertVisible) {
      return await this.errorMessage.textContent();
    }
    // Get the first visible validation error
    const firstError = this.validationError.first();
    if (await firstError.isVisible().catch(() => false)) {
      return await firstError.textContent();
    }
    return null;
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }

  async isRegisterButtonDisabled() {
    return await this.registerButton.isDisabled();
  }
}
