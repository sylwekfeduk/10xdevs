/**
 * Global teardown that runs once after all e2e tests complete
 * This cleans up all test data created during the test run
 */

import { deleteAllRecipesForUser, getRecipeCountForUser } from "./helpers/teardown";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalTeardown() {
  // Load .env.test file
  dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

  const userId = process.env.E2E_USERNAME_ID;

  if (!userId) {
    console.error("⚠️  Global Teardown: E2E_USERNAME_ID not found in .env.test");
    return;
  }

  console.log("\n🧹 Running global teardown...");

  try {
    // Get current count
    const beforeCount = await getRecipeCountForUser(userId);
    console.log(`📊 Current recipe count: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log("✅ No test recipes to clean up");
      return;
    }

    // Delete all recipes created during tests
    const deletedCount = await deleteAllRecipesForUser(userId);
    console.log(`🗑️  Deleted ${deletedCount} test recipe(s)`);

    // Verify cleanup
    const afterCount = await getRecipeCountForUser(userId);
    if (afterCount === 0) {
      console.log("✅ Global teardown completed successfully");
    } else {
      console.log(`⚠️  Warning: ${afterCount} recipe(s) remaining after teardown`);
    }
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw - we don't want to fail the entire test run if cleanup fails
  }
}

export default globalTeardown;