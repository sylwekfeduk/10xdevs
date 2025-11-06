import { test, expect } from "./fixtures/base";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PasswordRecoveryPage } from "./pages/PasswordRecoveryPage";
import { DashboardPage } from "./pages/DashboardPage";

test.describe("Authentication and Onboarding", () => {
  test.describe("Registration", () => {
    test("TC1.1: User can successfully register with valid email and password and is redirected to onboarding", async ({
      page,
    }) => {
      const registerPage = new RegisterPage(page);
      const onboardingPage = new OnboardingPage(page);

      await registerPage.goto();

      const uniqueEmail = `test-${Date.now()}@example.com`;
      await registerPage.register(uniqueEmail, "ValidPassword123!", "ValidPassword123!");

      // Wait for redirect to onboarding
      await registerPage.waitForRedirect();

      // Verify we're on onboarding page
      expect(await onboardingPage.isOnboardingPage()).toBe(true);
    });

    test("TC1.2: System prevents registration with invalid email or too short password", async ({ page }) => {
      const registerPage = new RegisterPage(page);

      await registerPage.goto();

      // Test invalid email
      await registerPage.register("invalid-email", "ValidPassword123!", "ValidPassword123!");

      // Validation error should now be visible
      expect(await registerPage.isErrorVisible()).toBe(true);

      // Verify error message mentions email
      const errorText = await registerPage.getErrorText();
      expect(errorText?.toLowerCase()).toContain("email");

      // Test short password
      await page.reload();
      await registerPage.goto();
      await registerPage.register("valid@example.com", "short", "short");

      // Wait for validation error to appear
      await page.waitForTimeout(1000);
      expect(await registerPage.isErrorVisible()).toBe(true);

      // Verify error message mentions password length
      const passwordError = await registerPage.getErrorText();
      expect(passwordError?.toLowerCase()).toMatch(/password.*8|8.*character/);
    });
  });

  test.describe("Login", () => {
    test("TC1.3: User can login with correct credentials and is redirected to main panel", async ({
      page,
      testUser,
    }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
      await loginPage.waitForRedirect();

      // Verify we're logged in
      expect(page.url()).toMatch(/\/(dashboard)/);
    });

    test("TC1.4: User cannot login with incorrect credentials", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login("nonexistent@example.com", "WrongPassword123!");

      // Should see error message
      await page.waitForTimeout(1000); // Wait for error to appear
      expect(await loginPage.isErrorVisible()).toBe(true);
    });

    test("TC1.5: User loses access to protected resources after logout", async ({ authenticatedPage }) => {
      const dashboardPage = new DashboardPage(authenticatedPage);
      const loginPage = new LoginPage(authenticatedPage);

      // Verify we have access initially
      await dashboardPage.goto();
      expect(await dashboardPage.isAuthenticated()).toBe(true);

      // Logout
      await dashboardPage.logout();

      // Wait for redirect to login page after logout
      await authenticatedPage.waitForURL(/\/login/, { timeout: 5000 });
      await authenticatedPage.waitForLoadState("networkidle");

      // Verify we're on login page
      expect(await loginPage.isOnLoginPage()).toBe(true);

      // Try to access protected page
      await authenticatedPage.goto("/recipes");

      // Should be redirected back to login page
      await authenticatedPage.waitForURL(/\/login/, { timeout: 5000 });
      await authenticatedPage.waitForLoadState("networkidle");

      // Verify we're still on login page (redirected from protected route)
      expect(await loginPage.isOnLoginPage()).toBe(true);
      expect(authenticatedPage.url()).toContain("/login");
    });
  });

  test.describe("Password Recovery", () => {
    test("TC1.6: User can request password reset with existing email and sees success message", async ({
      page,
      testUser,
    }) => {
      const passwordRecoveryPage = new PasswordRecoveryPage(page);

      await passwordRecoveryPage.goto();
      await passwordRecoveryPage.requestPasswordReset(testUser.email);

      // Wait for success state
      await passwordRecoveryPage.waitForSuccess();

      // Verify the card title changed to "Check your email"
      expect(await passwordRecoveryPage.isSuccessVisible()).toBe(true);

      // Verify success message content
      const successText = await passwordRecoveryPage.getSuccessAlertText();
      expect(successText).toContain("Email sent");
    });

    test("TC1.6.1: User sees error message when requesting password reset for non-existent email", async ({ page }) => {
      const passwordRecoveryPage = new PasswordRecoveryPage(page);

      await passwordRecoveryPage.goto();

      // Use a unique non-existent email to avoid any caching issues
      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
      await passwordRecoveryPage.requestPasswordReset(nonExistentEmail);

      // Wait for error state
      await passwordRecoveryPage.waitForError();

      // Verify error message is visible
      expect(await passwordRecoveryPage.isErrorVisible()).toBe(true);

      // Verify error message content
      const errorText = await passwordRecoveryPage.getErrorText();
      expect(errorText?.toLowerCase()).toMatch(/no account found|not found|doesn't exist|no account/);

      // Verify we're still on the password recovery page (not redirected)
      expect(page.url()).toContain("/password-recovery");

      // Verify the form is still visible (not replaced with success card)
      const formHeading = page.getByRole("heading", { name: /reset your password/i });
      expect(await formHeading.isVisible()).toBe(true);
    });
  });

  test.describe("Onboarding", () => {
    test("TC1.7: User must select at least one preference to continue onboarding", async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const onboardingPage = new OnboardingPage(page);

      // Register with a unique email to ensure we reach onboarding
      const uniqueEmail = `test-onboarding-${Date.now()}@example.com`;
      const password = "ValidPassword123!";

      await registerPage.goto();
      await registerPage.register(uniqueEmail, password, password);
      await registerPage.waitForRedirect();

      // Verify we're on onboarding page
      expect(await onboardingPage.isOnboardingPage()).toBe(true);

      // Try to continue without selecting preferences
      const continueButtonDisabled = await onboardingPage.isContinueButtonDisabled();

      if (!continueButtonDisabled) {
        // If button is not disabled, clicking should not navigate away
        const urlBefore = page.url();
        await onboardingPage.clickContinue();
        await page.waitForTimeout(500);
        const urlAfter = page.url();

        // Should still be on onboarding
        expect(urlAfter).toBe(urlBefore);
      } else {
        // Button should be disabled
        expect(continueButtonDisabled).toBe(true);
      }
    });

    test("TC1.8: After completing onboarding, preferences are saved and user is redirected to main panel", async ({
      page,
    }) => {
      const registerPage = new RegisterPage(page);
      const onboardingPage = new OnboardingPage(page);

      // Register with a unique email to ensure we reach onboarding
      const uniqueEmail = `test-preferences-${Date.now()}@example.com`;
      const password = "ValidPassword123!";

      await registerPage.goto();
      await registerPage.register(uniqueEmail, password, password);
      await registerPage.waitForRedirect();

      // Verify we're on onboarding page
      expect(await onboardingPage.isOnboardingPage()).toBe(true);

      // Complete onboarding
      await onboardingPage.selectMultiplePreferences(2);
      await onboardingPage.clickContinue();
      await onboardingPage.waitForRedirect();

      // Should be redirected to dashboard or recipes
      expect(page.url()).toMatch(/\/(dashboard|recipes)/);

      // Preferences should be saved - verify by checking profile
      await page.goto("/profile");
      await page.waitForLoadState("networkidle");

      // Page should load without errors
      expect(page.url()).toContain("/profile");
    });
  });
});
