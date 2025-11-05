# E2E Test Teardown Guide

This guide explains how test data cleanup (teardown) works in the Playwright e2e tests.

## Overview

The teardown functionality automatically cleans up ALL recipes created by the test user after all e2e tests complete successfully. This prevents test data accumulation while keeping tests isolated.

## How It Works

### Global Teardown

Playwright runs **global setup** and **global teardown** hooks:

1. **Global Setup** (`e2e/global-setup.ts`) - Runs once before all tests
   - Checks initial recipe count
   - Warns if existing test data is found

2. **Tests Run** - All your e2e tests execute normally

3. **Global Teardown** (`e2e/global-teardown.ts`) - Runs once after all tests complete
   - Deletes ALL recipes for the test user
   - Shows count of deleted recipes
   - Verifies cleanup succeeded

### What Gets Cleaned Up

The global teardown deletes:
- **All recipes** created by the test user (regardless of when they were created)
- Related AI modification logs (automatically via CASCADE delete in the database)

### What Doesn't Get Cleaned Up

- Recipes created by other users
- User profile data
- Authentication data

## Usage

### Automatic Teardown (No Action Required)

Teardown is **completely automatic**. Just write your tests normally:

```typescript
test("TC2.1: Create a recipe", async ({ authenticatedPage }) => {
  const newRecipePage = new NewRecipePage(authenticatedPage);

  await newRecipePage.goto();
  await newRecipePage.createRecipe({
    title: "Test Recipe",
    description: "Test description",
    ingredients: "Test ingredients",
    instructions: "Test instructions",
  });

  // Test assertions...

  // Global teardown happens automatically after ALL tests complete
});
```

### When Teardown Runs

Teardown runs:
- ✅ After all tests complete (global teardown)
- ✅ Whether tests pass or fail
- ✅ Only once per test run (not after each test)

### What You'll See

When running tests, you'll see:

```bash
🚀 Running global setup...
📊 Initial recipe count: 0
✅ Global setup completed

# ... your tests run ...

🧹 Running global teardown...
📊 Current recipe count: 15
🗑️  Deleted 15 test recipe(s)
✅ Global teardown completed successfully
```

## Manual Data Cleanup

### Clean All Test Data

To manually delete **all** recipes for the test user (not just recent ones):

```bash
npm run test:e2e:cleanup
```

This script:
1. Shows the current recipe count
2. Waits 3 seconds (giving you time to cancel with Ctrl+C)
3. Deletes all recipes for the test user
4. Shows the final count

### Clean Specific Data

You can also use the helper functions directly in your test scripts:

```typescript
import { deleteAllRecipesForUser, deleteRecentRecipesForUser, getRecipeCountForUser } from "./helpers/teardown";

// Get recipe count
const count = await getRecipeCountForUser(userId);

// Delete all recipes
await deleteAllRecipesForUser(userId);

// Delete only recipes created after a specific time
await deleteRecentRecipesForUser(userId, "2024-01-01T00:00:00Z");
```

## Test User Configuration

The test user is configured in `.env.test`:

```
E2E_USERNAME_ID=cf5abe4a-c633-4a0e-ae51-2a79c480f577
E2E_USERNAME=sylwester.feduk@wavestone.com
E2E_PASSWORD=Test123!
```

All teardown operations use this user ID.

## Implementation Details

### Files

- `e2e/helpers/teardown.ts` - Core teardown functions
- `e2e/global-setup.ts` - Global setup (runs before all tests)
- `e2e/global-teardown.ts` - Global teardown (runs after all tests)
- `e2e/scripts/cleanup-test-data.ts` - Manual cleanup script
- `playwright.config.ts` - Configures global setup/teardown

### Teardown Strategy

The implementation uses **global teardown** to clean up all test data after the entire test suite completes:

1. **Global Setup** → Checks initial recipe count and warns if data exists
2. **All tests run** → Tests create recipes as needed
3. **Global Teardown** → Deletes ALL recipes for the test user

This approach:
- ✅ Runs once per test suite (efficient)
- ✅ Cleans up regardless of test pass/fail status
- ✅ Simple and predictable
- ✅ Works well with parallel test execution

### Database Cascade

The database schema includes CASCADE delete constraints:

```sql
recipes.user_id → auth.users(id) ON DELETE CASCADE
ai_modifications_log.original_recipe_id → recipes(id) ON DELETE CASCADE
```

When a recipe is deleted, related AI modification logs are automatically removed.

## Troubleshooting

### Teardown Not Running

If you don't see cleanup happening after tests complete:

1. Check console output for global teardown messages (🧹, 📊, 🗑️, ✅)
2. Verify `.env.test` has correct `E2E_USERNAME_ID`
3. Ensure `playwright.config.ts` has `globalSetup` and `globalTeardown` configured
4. Check if Playwright config is being loaded correctly

### Teardown Failing

If teardown consistently fails:

1. Check Supabase credentials in `.env.test`
2. Verify the test user exists in the database
3. Check database RLS policies allow the test user to delete their recipes
4. Review error messages in test output (look for ❌ messages)
5. Try running manual cleanup: `npm run test:e2e:cleanup`

### Test Data Accumulation

If test data keeps accumulating despite teardown:

1. Verify teardown is configured in `playwright.config.ts`
2. Check if global teardown is being skipped (look for teardown logs)
3. Run manual cleanup: `npm run test:e2e:cleanup`
4. Verify the test user ID matches between `.env.test` and database

### Global Setup/Teardown Not Running

If you don't see setup/teardown logs at all:

1. Ensure the paths in `playwright.config.ts` are correct:
   ```typescript
   globalSetup: "./e2e/global-setup.ts",
   globalTeardown: "./e2e/global-teardown.ts",
   ```
2. Check for TypeScript compilation errors in setup/teardown files
3. Verify `dotenv` is properly loading `.env.test`

## Best Practices

1. **Always use unique identifiers** - Include timestamps or UUIDs in test data (e.g., `"Recipe ${Date.now()}"`)
2. **Don't rely on specific data** - Tests should create their own data, not depend on existing recipes
3. **Keep tests isolated** - Each test should work independently
4. **Monitor teardown output** - Check logs to ensure cleanup is happening
5. **Run cleanup before CI** - Consider running `npm run test:e2e:cleanup` before CI runs

## Configuration Example

Your `playwright.config.ts` should include:

```typescript
export default defineConfig({
  // ... other config ...

  // Global setup and teardown
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  // ... rest of config ...
});
```