/**
 * Manual cleanup script for test data
 * Usage: npx tsx e2e/scripts/cleanup-test-data.ts
 */

import { deleteAllRecipesForUser, getRecipeCountForUser } from "../helpers/teardown";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test file
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

async function cleanupTestData() {
  const userId = process.env.E2E_USERNAME_ID;

  if (!userId) {
    console.error("Error: E2E_USERNAME_ID not found in .env.test");
    process.exit(1);
  }

  console.log(`Cleaning up test data for user: ${userId}`);

  try {
    // Get current count
    const beforeCount = await getRecipeCountForUser(userId);
    console.log(`Current recipe count: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log("No recipes to delete.");
      return;
    }

    // Confirm deletion
    console.log("\nThis will delete ALL recipes for the test user.");
    console.log("Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Delete all recipes
    const deletedCount = await deleteAllRecipesForUser(userId);
    console.log(`Successfully deleted ${deletedCount} recipe(s)`);

    // Verify
    const afterCount = await getRecipeCountForUser(userId);
    console.log(`Remaining recipe count: ${afterCount}`);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

cleanupTestData();
