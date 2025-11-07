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

  async selectPreference(index = 0) {
    const checkboxes = await this.preferenceCheckboxes.all();
    if (checkboxes.length > index) {
      await checkboxes[index].check();
    } else {
      // Fallback: try to find any checkbox on the page
      const anyCheckbox = this.page.locator('input[type="checkbox"]').first();
      await anyCheckbox.check();
    }
  }

  async selectMultiplePreferences(count = 2) {
    // The onboarding form uses MultiSelectCombobox for diets and allergies
    // And TagInput for disliked ingredients

    // Try to select an allergy from the MultiSelectCombobox
    // Find the button by role combobox since it has role="combobox"
    const allergiesButton = this.page.getByRole('combobox').filter({ hasText: /Select your allergies/i }).first();

    if (await allergiesButton.isVisible().catch(() => false)) {
      // Click the allergies combobox button to open dropdown
      await allergiesButton.click();

      // Wait for popover to open and populate
      await this.page.waitForTimeout(500);

      // Wait for the popover content to be visible (command list appears)
      // The CommandList is inside a Popover, so it should be visible after the popover opens
      const commandList = this.page.locator('[data-slot="command-list"]');
      await commandList.waitFor({ state: 'visible', timeout: 5000 });

      // Wait a bit more for options to render
      await this.page.waitForTimeout(300);

      // Select "Peanuts" from the dropdown using CommandItem selector
      // CommandItem renders as div with data-slot="command-item" containing the label text
      const peanutsOption = this.page.locator('[data-slot="command-item"]').filter({ hasText: "Peanuts" }).first();
      await peanutsOption.waitFor({ state: 'visible', timeout: 3000 });
      await peanutsOption.click();

      // Wait for selection to be registered
      await this.page.waitForTimeout(300);

      // Close the dropdown by pressing Escape
      await this.page.keyboard.press("Escape");
      // Wait for dropdown to close
      await this.page.waitForTimeout(200);
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
