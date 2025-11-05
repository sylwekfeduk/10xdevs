/**
 * Verify the test user ID and check for any recipes
 */

import { createTestSupabaseClient } from "../helpers/teardown";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

async function verifyUser() {
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;
  const expectedUserId = process.env.E2E_USERNAME_ID;

  const supabase = createTestSupabaseClient();

  console.log("=== User Verification ===");
  console.log(`Email: ${email}`);
  console.log(`Expected User ID from .env.test: ${expectedUserId}\n`);

  try {
    // Sign in to get the actual user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email!,
      password: password!,
    });

    if (authError) {
      console.error("Authentication error:", authError);
      return;
    }

    const actualUserId = authData.user?.id;
    console.log(`Actual User ID from auth: ${actualUserId}\n`);

    // Check if they match
    if (actualUserId !== expectedUserId) {
      console.log("❌ MISMATCH FOUND!");
      console.log(`   Expected: ${expectedUserId}`);
      console.log(`   Actual:   ${actualUserId}`);
      console.log("\n⚠️  Update E2E_USERNAME_ID in .env.test to:", actualUserId);
    } else {
      console.log("✅ User ID matches!");
    }

    // Now check recipes using the ACTUAL user ID
    const { data: recipes, error: recipeError, count } = await supabase
      .from("recipes")
      .select("id, title, user_id, created_at", { count: "exact" })
      .eq("user_id", actualUserId!);

    if (recipeError) {
      console.error("\nError querying recipes:", recipeError);
      return;
    }

    console.log(`\nFound ${count} recipe(s) for actual user ID (${actualUserId})`);

    if (recipes && recipes.length > 0) {
      console.log("\nRecipes found:");
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
        console.log(`   Created: ${recipe.created_at}`);
      });
    }

    // Check using the expected (wrong) user ID
    const { count: wrongCount } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", expectedUserId!);

    console.log(`\nRecipes for expected user ID (${expectedUserId}): ${wrongCount}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

verifyUser();