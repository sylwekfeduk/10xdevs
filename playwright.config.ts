import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Run tests synchronously (sequentially)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use single worker to ensure synchronous execution
  reporter: "html",

  // Global setup and teardown
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "auth-onboarding",
      testMatch: /auth-onboarding\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "recipe-crud",
      testMatch: /recipe-crud\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["auth-onboarding"], // Wait for auth-onboarding to pass
    },
    {
      name: "smoke",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
