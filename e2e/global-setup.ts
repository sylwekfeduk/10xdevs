/**
 * Global setup that runs once before all e2e tests start
 * This records the start time for conditional cleanup
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { getRecipeCountForUser } from "./helpers/teardown";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup() {
  // Load .env.test file
  dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

  const userId = process.env.E2E_USERNAME_ID;
  const userEmail = process.env.E2E_USERNAME;
  const userPassword = process.env.E2E_PASSWORD;

  if (!userId || !userEmail || !userPassword) {
    console.error("⚠️  Global Setup: E2E credentials not found in .env.test");
    return;
  }

  console.log("\n🚀 Running global setup...");

  try {
    // Initialize Supabase admin client
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if test user exists in auth.users
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserById(userId);

    if (fetchError || !existingUser || existingUser.user.email !== userEmail) {
      if (existingUser && existingUser.user.email !== userEmail) {
        console.log(`⚠️  User exists but email mismatch: ${existingUser.user.email} != ${userEmail}`);
        // Delete the old user
        await supabase.auth.admin.deleteUser(userId);
        console.log("🗑️  Deleted old user");
      } else {
        console.log("📝 Test user doesn't exist, creating...");
      }

      // Create test user with specific UUID
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {},
      });

      if (createError) {
        console.error("❌ Failed to create test user:", createError);
        throw createError;
      }

      console.log(`✅ Test user created: ${userEmail} (${data.user?.id})`);

      // Update .env.test if the UUID changed
      if (data.user?.id !== userId) {
        console.log(`⚠️  User ID mismatch! Expected: ${userId}, Got: ${data.user?.id}`);
        console.log("💡 Update E2E_USERNAME_ID in .env.test to:", data.user?.id);
      }
    } else {
      console.log(`✅ Test user exists: ${userEmail} (${userId})`);
    }

    // Check initial recipe count
    const initialCount = await getRecipeCountForUser(userId);
    console.log(`📊 Initial recipe count: ${initialCount}`);

    if (initialCount > 0) {
      console.log(`⚠️  Warning: Starting with ${initialCount} existing recipe(s)`);
      console.log("💡 Tip: Run 'npm run test:e2e:cleanup' to clean up before running tests");
    }

    console.log("✅ Global setup completed");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error; // Fail fast if setup fails
  }
}

export default globalSetup;
