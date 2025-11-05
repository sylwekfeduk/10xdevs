import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

/**
 * Creates a Supabase client for e2e test teardown operations
 */
export function createTestSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Creates an authenticated Supabase client for teardown operations
 * This is needed because RLS policies require authentication
 */
async function createAuthenticatedClient() {
  const supabase = createTestSupabaseClient();
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing E2E_USERNAME or E2E_PASSWORD in environment variables");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  return supabase;
}

/**
 * Deletes all recipes for a specific user
 * @param userId - The user ID whose recipes should be deleted
 * @returns The number of recipes deleted
 */
export async function deleteAllRecipesForUser(userId: string): Promise<number> {
  const supabase = await createAuthenticatedClient();

  // Delete all recipes for the user
  // This will cascade delete to ai_modifications_log due to foreign key constraints
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("Error deleting recipes:", error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Deletes recipes created after a specific timestamp
 * Useful for cleaning up only recipes created during a test run
 * @param userId - The user ID whose recipes should be deleted
 * @param createdAfter - ISO timestamp, recipes created after this will be deleted
 * @returns The number of recipes deleted
 */
export async function deleteRecentRecipesForUser(
  userId: string,
  createdAfter: string
): Promise<number> {
  const supabase = await createAuthenticatedClient();

  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("user_id", userId)
    .gte("created_at", createdAfter)
    .select();

  if (error) {
    console.error("Error deleting recent recipes:", error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Gets count of recipes for a user (useful for verification)
 * @param userId - The user ID
 * @returns The number of recipes
 */
export async function getRecipeCountForUser(userId: string): Promise<number> {
  const supabase = await createAuthenticatedClient();

  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting recipes:", error);
    throw error;
  }

  return count || 0;
}