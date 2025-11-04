import { test, expect } from "./fixtures/base";
import { HomePage } from "./pages/HomePage";

test.describe("Homepage with POM", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test("should load and display heading", async () => {
    const title = await homePage.getTitle();
    expect(title).toMatch(/10xdevs/i);

    const isHeadingVisible = await homePage.isHeadingVisible();
    expect(isHeadingVisible).toBe(true);
  });

  test("should display navigation", async () => {
    const isNavVisible = await homePage.isNavigationVisible();
    expect(isNavVisible).toBe(true);
  });

  test("should take screenshot", async ({ page }) => {
    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
