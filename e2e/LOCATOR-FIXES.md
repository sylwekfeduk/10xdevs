# E2E Test Locator Fixes

## Summary of Findings

After inspecting the actual application code, here are the correct locators:

### ✅ Register Page (`/register`)

**Component:** `RegisterForm.tsx`

- **Button Text:** `"Create account"` (normal) or `"Creating account..."` (submitting)
  - ❌ Old: `/register|sign up|zarejestruj/i`
  - ✅ New: `/create account|creating account/i`

- **Fields:**
  - Email: Label is `"Email"`
  - Password: Label is `"Password"`
  - Confirm Password: Label is `"Confirm Password"`

- **Error Messages:**
  - Located in `Alert` component with `variant="destructive"`
  - Structure: `<Alert>` → `<AlertTitle>Error</AlertTitle>` → `<AlertDescription>`

- **Link to Login:** Text is `"Sign in"` inside `"Already have an account? Sign in"`

---

### ✅ Login Page (`/login`)

**Component:** `LoginForm.tsx`

- **Button Text:** `"Sign in"` (normal) or `"Signing in..."` (submitting)
  - ❌ Old: `/log in|sign in|zaloguj/i`
  - ✅ New: `/sign in|signing in/i`

- **Fields:**
  - Email: Label is `"Email"`
  - Password: Label is `"Password"`

- **Error Messages:**
  - Same structure as Register (Alert with variant="destructive")

- **Links:**
  - Forgot password: `"Forgot your password?"`
  - Register: `"Sign up"` inside `"Don't have an account? Sign up"`

---

### ✅ Onboarding Page (`/onboarding`)

**Component:** `OnboardingForm.tsx`

- **Button Text:** `"Complete setup"` (normal) or `"Saving preferences..."` (submitting)
  - ❌ Old: `/continue|next|dalej|zapisz/i`
  - ✅ New: `/complete setup|saving preferences/i`

- **Heading:** `"Welcome to HealthyMeal"`

- **Fields:**
  - Allergies: Label is `"Allergies"` (MultiSelectCombobox)
  - Dietary Preferences: Label is `"Dietary Preferences"` (MultiSelectCombobox)
  - Disliked Ingredients: Label is `"Disliked Ingredients"` (TagInput)

- **Validation:**
  - Button is `disabled` when no preferences selected
  - Validation message: `"Please select at least one preference..."`

- **Error Messages:**
  - Same Alert structure

---

### ✅ Password Recovery Page

Need to check this component...

---

### ✅ Dashboard and Recipe Pages

Need to check these components...

---

## Common Patterns Found

1. **All forms use shadcn/ui components:**
   - `Button` with `disabled={isSubmitting}`
   - `Form` with react-hook-form
   - `Input` with FormLabel
   - `Alert` with `variant="destructive"` for errors

2. **Error message structure:**
   ```html
   <Alert variant="destructive">
     <AlertTitle>Error</AlertTitle>
     <AlertDescription>{error message}</AlertDescription>
   </Alert>
   ```

3. **Button states:**
   - Normal state: Simple text
   - Submitting state: `<Loader2 className="animate-spin" /> + "...ing" text`

4. **Form labels:**
   - All use proper `<Label>` component with `htmlFor` attribute
   - Can be selected with `getByLabel()`

---

## Action Items

- [ ] Update `RegisterPage.ts` with correct button locator
- [ ] Update `LoginPage.ts` with correct button locator
- [ ] Update `OnboardingPage.ts` with correct button and field locators
- [ ] Update error message locators to use Alert with destructive variant
- [ ] Test with corrected locators
- [ ] Remove old homepage tests (examples only)