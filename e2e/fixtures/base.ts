import { test as base } from "@playwright/test";

// Define custom fixtures here
export const test = base.extend({
  // Example: Add custom context or page setup
});

export { expect } from "@playwright/test";
