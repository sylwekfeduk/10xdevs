import { Page, Locator } from "@playwright/test";

export class OnboardingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly continueButton: Locator;
  readonly skipButton: Locator;
  readonly preferenceCheckboxes: Locator;
  readonly allergyCheckboxes: Locator;
  readonly dislikedIngredientsCheckboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /welcome to healthymeal/i });
    this.continueButton = page.getByRole("button", { name: /complete setup|saving preferences/i });
    this.skipButton = page.getByRole("button", { name: /skip/i });
    // The form uses MultiSelectCombobox and TagInput, not checkboxes
    this.preferenceCheckboxes = page.locator('input[type="checkbox"]');
    this.allergyCheckboxes = page.locator('button:has-text("Select your allergies")');
    this.dislikedIngredientsCheckboxes = page.locator('input[placeholder*="ingredient"]');
  }

  async goto() {
    await this.page.goto("/onboarding");
    // Wait for React component to hydrate
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);
  }

  async selectPreference(index: number = 0) {
    const checkboxes = await this.preferenceCheckboxes.all();
    if (checkboxes.length > index) {
      await checkboxes[index].check();
    } else {
      // Fallback: try to find any checkbox on the page
      const anyCheckbox = this.page.locator('input[type="checkbox"]').first();
      await anyCheckbox.check();
    }
  }

  async selectMultiplePreferences(count: number = 2) {
    // The onboarding form uses MultiSelectCombobox for diets and allergies
    // And TagInput for disliked ingredients

    // Try to add some dietary preferences via the TagInput
    const dislikedInput = this.page.locator('input[placeholder*="ingredient"]');

    if (await dislikedInput.isVisible().catch(() => false)) {
      // Add a disliked ingredient
      await dislikedInput.click();
      // Wait a moment to ensure focus
      await this.page.waitForTimeout(100);
      // Use pressSequentially with a slight delay to simulate real typing
      await dislikedInput.pressSequentially("onions", { delay: 50 });
      // Wait a moment before pressing Enter
      await this.page.waitForTimeout(100);
      // Press Enter on the focused input to add the tag
      await this.page.keyboard.press("Enter");
      // Wait for the tag badge to appear (confirms the tag was added)
      // Look for badge with aria-label or the badge component
      const tagBadge = this.page.locator('[data-slot="badge"]:has-text("onions"), .badge:has-text("onions")').first();
      await tagBadge.waitFor({ state: "visible", timeout: 3000 });
    } else {
      // Fallback: try to interact with any checkboxes or comboboxes
      const anyCheckboxes = await this.page.locator('input[type="checkbox"]').all();
      if (anyCheckboxes.length > 0) {
        const limit = Math.min(count, anyCheckboxes.length);
        for (let i = 0; i < limit; i++) {
          await anyCheckboxes[i].check();
        }
      }
    }
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async waitForRedirect() {
    await this.page.waitForURL(/\/(dashboard|recipes)/);
  }

  async isContinueButtonDisabled() {
    return await this.continueButton.isDisabled();
  }

  async isOnboardingPage() {
    return this.page.url().includes("/onboarding");
  }
}