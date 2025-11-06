import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { OnboardingPage } from "../pages/OnboardingPage";

interface AuthFixtures {
  authenticatedPage: Page;
  testUser: { email: string; password: string; userId: string };
}

// Define custom fixtures
export const test = base.extend<AuthFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testUser: async ({}, use) => {
    // Use existing test user from .env.test (or GitHub secrets in CI)
    const user = {
      email: process.env.E2E_USERNAME || "testuser@wavestone.com",
      password: process.env.E2E_PASSWORD || "Test123!",
      userId: process.env.E2E_USERNAME_ID || "cf5abe4a-c633-4a0e-ae51-2a79c480f577",
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(user);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Login with existing test user (don't register)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Wait to see where we land
    await page.waitForTimeout(2000);

    // If redirected to onboarding, complete it
    if (page.url().includes("/onboarding")) {
      const onboardingPage = new OnboardingPage(page);
      await onboardingPage.selectMultiplePreferences(2);
      await onboardingPage.clickContinue();
      await onboardingPage.waitForRedirect();
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from "@playwright/test";
