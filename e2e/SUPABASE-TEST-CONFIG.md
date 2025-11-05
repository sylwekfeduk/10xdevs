# Supabase Test Environment Configuration

## Disable Email Confirmation for E2E Tests

To allow e2e tests to register and immediately login without email verification:

### Steps:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/munrrkxekjjpukakuybm

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "Providers" tab
   - Click on "Email" provider

3. **Disable Email Confirmation**
   - Find the setting "Confirm email"
   - Toggle it **OFF** (disable it)
   - Click "Save"

### Alternative: Email Confirmation Settings

If you want to keep email confirmation enabled for production but disable for test:

1. Go to **Authentication > Email Templates**
2. Update the confirmation email template to use a test-friendly approach

### Verify Configuration

After disabling, newly registered users will be automatically confirmed and can login immediately.

## Important Notes

- This configuration should **only** be used in test/development environments
- For production, always enable email confirmation
- Consider using a separate Supabase project for testing

## Test After Configuration

Run the failing tests to verify:

```bash
npx playwright test e2e/auth-onboarding.spec.ts -g "TC1.1"
npx playwright test e2e/auth-onboarding.spec.ts -g "TC1.7"
npx playwright test e2e/auth-onboarding.spec.ts -g "TC1.8"
```