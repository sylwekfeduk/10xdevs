/**
 * Script to create a test user via API
 * Run with: npx tsx e2e/scripts/create-test-user.ts
 */

const EMAIL = process.env.E2E_USERNAME || "e2e-test@example.com";
const PASSWORD = process.env.E2E_PASSWORD || "Test123!";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function createTestUser() {
  console.log("🔧 Creating test user...");
  console.log(`Email: ${EMAIL}`);
  console.log(`URL: ${BASE_URL}`);

  try {
    // Step 1: Register user
    console.log("\n1️⃣ Registering user...");
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.error(`❌ Registration failed: ${registerData.message}`);
      console.log("\nPossible reasons:");
      console.log("- Email format not accepted by Supabase");
      console.log("- User already exists");
      console.log("- Email domain not allowed");
      console.log("\n💡 Try a different email or confirm existing user in Supabase dashboard");
      process.exit(1);
    }

    console.log("✅ User registered successfully!");

    // Step 2: Complete onboarding (if needed)
    console.log("\n2️⃣ Completing onboarding...");

    // You'll need to get the session cookie from registration
    // For now, just output instructions
    console.log("\n📋 Next steps:");
    console.log("1. Go to Supabase Dashboard → Authentication → Users");
    console.log(`2. Find user: ${EMAIL}`);
    console.log("3. Click the user and check 'Email Confirmed'");
    console.log("4. (Optional) Set up onboarding preferences");
    console.log("\n✅ Then run: npm run test:e2e");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestUser();