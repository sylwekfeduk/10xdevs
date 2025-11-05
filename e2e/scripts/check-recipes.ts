/**
 * Debug script to check what recipes exist in the database
 */

import { createTestSupabaseClient } from "../helpers/teardown";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

async function checkRecipes() {
  const userId = process.env.E2E_USERNAME_ID;
  const supabase = createTestSupabaseClient();

  console.log("=== Database Check ===");
  console.log(`Looking for recipes for user: ${userId}\n`);

  try {
    // Get all recipes for this user WITHOUT RLS
    const { data: recipes, error, count } = await supabase
      .from("recipes")
      .select("id, title, user_id, created_at", { count: "exact" })
      .eq("user_id", userId);

    if (error) {
      console.error("Error querying recipes:", error);
      return;
    }

    console.log(`Found ${count} recipe(s) for user ${userId}`);

    if (recipes && recipes.length > 0) {
      console.log("\nRecipes:");
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
        console.log(`   Created: ${recipe.created_at}`);
      });
    }

    // Also check total recipes in database (all users)
    const { count: totalCount } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });

    console.log(`\nTotal recipes in database (all users): ${totalCount}`);

    // Check if there are recipes with different user_id
    const { data: otherRecipes } = await supabase
      .from("recipes")
      .select("user_id, count")
      .neq("user_id", userId || "")
      .limit(5);

    if (otherRecipes && otherRecipes.length > 0) {
      console.log(`\nFound recipes belonging to other users`);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

checkRecipes();