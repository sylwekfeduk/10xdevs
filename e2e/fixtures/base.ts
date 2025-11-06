import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { OnboardingPage } from "../pages/OnboardingPage";

interface AuthFixtures {
  authenticatedPage: Page;
  testUser: { email: string; password: string; userId: string };
}

// Helper function to register and complete onboarding
async function registerAndOnboard(page: Page, email: string, password: string) {
  const registerPage = new RegisterPage(page);
  const onboardingPage = new OnboardingPage(page);

  await registerPage.goto();
  await registerPage.register(email, password, password);
  await registerPage.waitForRedirect();

  await onboardingPage.selectMultiplePreferences(2);
  await onboardingPage.clickContinue();
  await onboardingPage.waitForRedirect();
}

// Helper function to login
async function login(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await loginPage.waitForRedirect();
}

// Define custom fixtures
export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    // Use existing test user from .env.test
    const user = {
      email: process.env.E2E_USERNAME || "testuser@wavestone.com",
      password: process.env.E2E_PASSWORD || "Test123!",
      userId: process.env.E2E_USERNAME_ID || "cf5abe4a-c633-4a0e-ae51-2a79c480f577",
    };
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

    await use(page);
  },
});

export { expect } from "@playwright/test";
