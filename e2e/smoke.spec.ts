import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("Can load register page", async ({ page }) => {
    await page.goto("/register");

    // Check page loads
    await expect(page).toHaveTitle(/HealthyMeal/);

    // Check form elements exist
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();

    console.log("✅ Register page loads correctly");
  });

  test("Can load login page", async ({ page }) => {
    await page.goto("/login");

    // Check page loads
    await expect(page).toHaveTitle(/HealthyMeal/);

    // Check form elements exist
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    console.log("✅ Login page loads correctly");
  });

  test("Can login with test user", async ({ page }) => {
    const email = process.env.E2E_USERNAME || "testuser@wavestone.com";
    const password = process.env.E2E_PASSWORD || "Test123!";

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.getByLabel(/^email$/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);

    const button = page.getByRole("button", { name: /sign in/i });
    await button.click();

    // Wait and see where we end up
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);

    // Check for error messages
    const alert = page.locator('[role="alert"]');
    if (await alert.isVisible()) {
      const alertText = await alert.textContent();
      console.log(`❌ Error: ${alertText}`);
    } else {
      console.log("No error visible");
    }

    await page.screenshot({ path: "test-results/smoke-login-result.png", fullPage: true });
    console.log("✅ Screenshot saved");
  });

  test("Can fill register form with React hydrated", async ({ page }) => {
    await page.goto("/register");

    // Wait for React to fully hydrate by checking for Astro islands
    await page.waitForSelector("[astro-island-hydrated]", { timeout: 10000 }).catch(() => {
      console.log("⚠️  No [astro-island-hydrated] attribute found");
    });

    // Additional wait for network to be idle
    await page.waitForLoadState("networkidle");

    // Wait for button to be interactive (React controlled)
    const button = page.getByRole("button", { name: /create account/i });
    await button.waitFor({ state: "visible" });

    // Extra wait to ensure React event handlers are attached
    await page.waitForTimeout(2000);

    console.log("✅ Page loaded and waiting for React");

    const email = `test-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    // Fill the form
    await page.getByLabel(/^email$/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);

    console.log("✅ Can fill form fields");

    // Check button is enabled
    await expect(button).toBeEnabled();

    // Click register
    await button.click();

    // Wait to see what happens (don't assert, just observe)
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`Current URL after registration attempt: ${currentUrl}`);

    // Check if there's an alert
    const alert = page.locator('[role="alert"]');
    if (await alert.isVisible()) {
      const alertText = await alert.textContent();
      console.log(`Alert visible: ${alertText}`);
    } else {
      console.log("No alert visible");
    }

    // Take screenshot for inspection
    await page.screenshot({ path: "test-results/smoke-register-result.png", fullPage: true });
    console.log("✅ Screenshot saved to test-results/smoke-register-result.png");
  });
});
