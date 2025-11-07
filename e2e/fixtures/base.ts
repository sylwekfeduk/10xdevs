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

  authenticatedPage: async ({ browser, testUser }, use) => {
    // Create a new browser context for better isolation between tests
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login with existing test user (don't register)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState("networkidle");

    await loginPage.login(testUser.email, testUser.password);

    // Wait for navigation after login with multiple possible destinations
    try {
      await page.waitForURL((url) => {
        return url.pathname.includes("/dashboard") ||
               url.pathname.includes("/recipes") ||
               url.pathname.includes("/onboarding");
      }, { timeout: 10000 });
    } catch {
      // If we timeout, just continue with current URL
      console.log("Login redirect timeout, continuing with current URL:", page.url());
    }

    // Wait for page to stabilize
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // If redirected to onboarding, complete it
    if (page.url().includes("/onboarding")) {
      const onboardingPage = new OnboardingPage(page);
      await onboardingPage.selectMultiplePreferences(2);
      await onboardingPage.clickContinue();
      await onboardingPage.waitForRedirect();
      await page.waitForLoadState("networkidle");
    }

    // Ensure we're not on login page
    if (page.url().includes("/login") || page.url().includes("/register")) {
      throw new Error("Authentication failed: still on login/register page");
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    // Clean up: close context after test
    await context.close();
  },
});

export { expect } from "@playwright/test";
