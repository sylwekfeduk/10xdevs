# E2E Tests for HealthyMeal Application

This directory contains end-to-end tests for the HealthyMeal recipe management application, built with Playwright.

## Overview

The test suite covers three main areas:
1. **Authentication & Onboarding** - User registration, login, logout, password recovery, and onboarding flow
2. **Recipe CRUD Operations** - Creating, reading, updating, and deleting recipes
3. **AI Recipe Modification** - AI-powered recipe modifications with comparison, save/discard functionality

## Directory Structure

```
e2e/
├── pages/                    # Page Object Models
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── OnboardingPage.ts
│   ├── PasswordRecoveryPage.ts
│   ├── DashboardPage.ts
│   ├── RecipesPage.ts
│   ├── NewRecipePage.ts
│   ├── RecipeDetailPage.ts
│   └── RecipeModifyPage.ts
├── fixtures/                 # Custom test fixtures
│   └── base.ts              # Authentication fixtures
├── helpers/                  # Test utilities
│   └── test-data.ts         # Test data generators
├── auth-onboarding.spec.ts  # Authentication tests (TC1.1-TC1.8)
├── recipe-crud.spec.ts      # Recipe CRUD tests (TC2.1-TC2.6)
└── recipe-ai-modification.spec.ts  # AI modification tests (TC3.1-TC3.7)
```

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up `.env.test` file with test environment variables:
```env
SUPABASE_URL=your-test-supabase-url
SUPABASE_KEY=your-test-supabase-key
OPENROUTER_API_KEY=your-openrouter-key
```

3. Ensure the dev server is running or use the built-in webServer config.

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth-onboarding.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Generate test code
npm run test:e2e:codegen
```

## Page Object Model (POM) Pattern

All tests use the Page Object Model pattern for maintainability and reusability. Each page has a corresponding class in the `pages/` directory.

### Example Usage

```typescript
import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.waitForRedirect();

  expect(page.url()).toContain('/dashboard');
});
```

## Custom Fixtures

### `authenticatedPage`

Provides a page with an already authenticated user (registered + onboarding completed):

```typescript
test('authenticated user can access recipes', async ({ authenticatedPage }) => {
  const recipesPage = new RecipesPage(authenticatedPage);
  await recipesPage.goto();
  // User is already logged in
});
```

### `testUser`

Provides unique test user credentials for each test:

```typescript
test('register new user', async ({ page, testUser }) => {
  // testUser.email and testUser.password are unique
  const registerPage = new RegisterPage(page);
  await registerPage.register(testUser.email, testUser.password);
});
```

## Test Coverage

### Authentication & Onboarding (TC1.1-TC1.8)

- ✅ TC1.1: Successful registration with valid credentials
- ✅ TC1.2: Validation of invalid email and short password
- ✅ TC1.3: Login with correct credentials
- ✅ TC1.4: Login rejection with incorrect credentials
- ✅ TC1.5: Access control after logout
- ✅ TC1.6: Password recovery flow
- ✅ TC1.7: Onboarding requires preference selection
- ✅ TC1.8: Preferences saved after onboarding completion

### Recipe CRUD Operations (TC2.1-TC2.6)

- ✅ TC2.1: Create recipe with all required fields
- ✅ TC2.2: Form validation for empty fields
- ✅ TC2.3: View list of user's recipes
- ✅ TC2.4: Sorting and pagination functionality
- ✅ TC2.5: Open recipe details
- ✅ TC2.6: Delete recipe with confirmation

### AI Recipe Modification (TC3.1-TC3.7)

- ✅ TC3.1: Modify recipe with AI (happy path)
- ✅ TC3.2: AI warning always visible
- ✅ TC3.3: Save modified recipe as new entry
- ✅ TC3.4: Original recipe unchanged after modification
- ✅ TC3.5: Discard changes returns to original
- ✅ TC3.6: Error handling for unavailable AI service
- ✅ TC3.7: Error for non-existent recipe

## Best Practices

### 1. Use Locators Over Selectors

```typescript
// ✅ Good - semantic, resilient
page.getByRole('button', { name: /submit/i })
page.getByLabel(/email/i)

// ❌ Avoid - fragile
page.locator('.submit-btn')
```

### 2. Wait for Network Idle

```typescript
await page.waitForLoadState('networkidle');
```

### 3. Use Test Data Helpers

```typescript
import { TestData, createUniqueRecipe } from './helpers/test-data';

const recipe = createUniqueRecipe(TestData.recipes.simple);
```

### 4. Isolate Tests

Each test should be independent and not rely on state from other tests. Use fixtures for setup.

### 5. Use Expect Assertions

```typescript
// ✅ Use Playwright's expect
import { expect } from '@playwright/test';
expect(await page.title()).toContain('Dashboard');

// ✅ Better - use built-in matchers
await expect(page).toHaveTitle(/Dashboard/);
```

## Debugging

### View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Trace Viewer

Traces are automatically captured on first retry. View them:

```bash
npx playwright show-trace trace.zip
```

### Debug Mode

Run a specific test in debug mode:

```bash
npx playwright test --debug e2e/auth-onboarding.spec.ts
```

## CI/CD Integration

Tests are configured to run in CI with:
- 2 retries for flaky tests
- Single worker for consistency
- HTML reporter for test results
- Screenshots on failure
- Traces on first retry

## Troubleshooting

### Tests Timing Out

- Increase timeout in test or config
- Check if dev server is running
- Verify network connectivity to external services

### Element Not Found

- Check if locators match the actual UI
- Ensure page is fully loaded before interaction
- Use `page.waitForLoadState('networkidle')`

### Flaky Tests

- Add explicit waits where needed
- Use `waitFor` methods on locators
- Avoid hard-coded timeouts
- Check for race conditions

## Contributing

When adding new tests:

1. Create Page Objects for new pages in `pages/`
2. Follow the existing naming convention: `feature-name.spec.ts`
3. Use the POM pattern consistently
4. Add test data helpers in `helpers/test-data.ts`
5. Document test cases with TC numbers from test plan
6. Ensure tests are independent and can run in any order

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Plan](./../.ai/test-plan.md)
- [Playwright Testing Rules](./../.cursor/rules/playwright-e2e-testing.mdc)