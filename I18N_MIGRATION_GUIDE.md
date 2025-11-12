# Internationalization (i18n) Migration Guide

This guide explains how to complete the translation of all remaining components in the HealthyMeal application.

## ✅ What's Already Done

The following has been implemented:

1. **Astro i18n Configuration** - Configured in `astro.config.mjs` with English (default) and Polish locales
2. **Translation Files** - Complete translation files at:
   - `src/i18n/en.json` (English)
   - `src/i18n/pl.json` (Polish)
3. **Translation Utilities** - Helper functions in `src/lib/i18n.ts`
4. **React Hook** - `useTranslation()` hook in `src/components/hooks/useTranslation.ts`
5. **Language Switcher** - Component at `src/components/layout/LanguageSwitcher.tsx`
6. **Updated Layouts**:
   - AppLayout.astro (with language switcher)
   - AuthLayout.astro (with language switcher)
7. **Example Components** (already translated):
   - UserNav.tsx
   - RecipeLibraryPage.tsx
   - LoginForm.tsx

## 🔧 How to Translate Components

### For React Components (.tsx)

1. Import the `useTranslation` hook:
   ```typescript
   import { useTranslation } from "@/components/hooks/useTranslation";
   ```

2. Use the hook in your component:
   ```typescript
   export function YourComponent() {
     const { t } = useTranslation();

     // Use t() to translate strings
     return <h1>{t("common.title")}</h1>;
   }
   ```

3. Replace hardcoded strings with translation keys:
   ```typescript
   // Before:
   <button>Save</button>

   // After:
   <button>{t("common.save")}</button>
   ```

4. For strings with placeholders:
   ```typescript
   // Translation file:
   "showingResults": "Showing {start}-{end} of {total} recipes"

   // Component:
   {t("recipes.showingResults", { start: 1, end: 10, total: 50 })}
   ```

### For Astro Components (.astro)

1. Import translation utilities in the frontmatter:
   ```astro
   ---
   import { t, getLocaleFromUrl } from "@/lib/i18n";

   const locale = getLocaleFromUrl(Astro.url);
   ---
   ```

2. Use the `t()` function in your template:
   ```astro
   <h1>{t(locale, "common.title")}</h1>
   ```

3. Update page titles:
   ```astro
   ---
   const locale = getLocaleFromUrl(Astro.url);
   const title = t(locale, "recipes.pageTitle");
   ---
   <Layout title={title}>
     <!-- content -->
   </Layout>
   ```

## 📋 Components That Need Translation

### Auth Components
- [ ] `src/components/auth/RegisterForm.tsx`
- [ ] `src/components/auth/PasswordRecoveryForm.tsx`
- [ ] `src/components/auth/PasswordUpdateForm.tsx`
- [ ] `src/components/auth/OnboardingForm.tsx`
- [ ] `src/components/auth/shared/AuthFormLayout.tsx`
- [ ] `src/components/auth/shared/EmailPasswordFields.tsx`

### Recipe Components
- [ ] `src/components/recipes/RecipeCard.tsx`
- [ ] `src/components/recipes/RecipeList.tsx`
- [ ] `src/components/recipes/FilterAndSortBar.tsx`
- [ ] `src/components/recipes/PaginationControls.tsx`
- [ ] `src/components/forms/NewRecipeForm.tsx`

### Recipe Details Components
- [ ] `src/components/recipe-details/RecipeDetailsPage.tsx`
- [ ] `src/components/recipe-details/RecipeContentDisplay.tsx`
- [ ] `src/components/recipe-details/RecipeActionsBar.tsx`
- [ ] `src/components/recipe-details/DeleteRecipeModal.tsx`
- [ ] `src/components/recipe-details/AIHighlights.tsx`

### AI Modification Components
- [ ] `src/components/ai-modification/AIModificationPage.tsx`
- [ ] `src/components/ai-modification/ActionButtonsBar.tsx`
- [ ] `src/components/ai-modification/AIDisclaimerAlert.tsx`
- [ ] `src/components/ai-modification/AIReviewDiff.tsx`
- [ ] `src/components/ai-modification/ChangeSummaryList.tsx`
- [ ] `src/components/ai-modification/SaveConfirmationModal.tsx`

### Profile Components
- [ ] `src/components/profile/ProfileView.tsx`
- [ ] `src/components/profile/ProfileForm.tsx`

### Astro Pages
- [ ] `src/pages/dashboard.astro`
- [ ] `src/pages/register.astro`
- [ ] `src/pages/onboarding.astro`
- [ ] `src/pages/password-recovery.astro`
- [ ] `src/pages/update-password.astro`
- [ ] `src/pages/profile.astro`
- [ ] `src/pages/recipes/index.astro`
- [ ] `src/pages/recipes/new.astro`
- [ ] `src/pages/recipes/[id]/index.astro`
- [ ] `src/pages/recipes/[id]/modify.astro`

## 🌐 URL Structure

The i18n routing is configured as follows:

- **English (default)**: `/login`, `/recipes`, `/dashboard`
- **Polish**: `/pl/login`, `/pl/recipes`, `/pl/dashboard`

When users switch languages using the LanguageSwitcher component, they are redirected to the appropriate URL with the locale prefix.

## 🔍 Finding Translation Keys

All translation keys are defined in:
- `src/i18n/en.json` - English translations
- `src/i18n/pl.json` - Polish translations

Translation structure:
```json
{
  "common": { /* Common UI elements */ },
  "nav": { /* Navigation items */ },
  "auth": { /* Authentication pages */ },
  "recipes": { /* Recipe-related content */ },
  "profile": { /* Profile pages */ },
  // ... and more
}
```

To access nested keys, use dot notation:
```typescript
t("recipes.title")        // "My Recipes" or "Moje przepisy"
t("auth.login")           // "Sign in" or "Zaloguj się"
t("common.save")          // "Save" or "Zapisz"
```

## 📝 Adding New Translations

If you need to add new translation keys:

1. Add the key to BOTH language files:
   ```json
   // en.json
   {
     "common": {
       "newKey": "New English text"
     }
   }

   // pl.json
   {
     "common": {
       "newKey": "Nowy polski tekst"
     }
   }
   ```

2. Use the new key in your component:
   ```typescript
   {t("common.newKey")}
   ```

## ✨ Example: Complete Component Migration

Before:
```typescript
export function MyComponent() {
  return (
    <div>
      <h1>Welcome</h1>
      <button>Save Changes</button>
      <p>Loading...</p>
    </div>
  );
}
```

After:
```typescript
import { useTranslation } from "@/components/hooks/useTranslation";

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("dashboard.welcome")}</h1>
      <button>{t("profile.saveChanges")}</button>
      <p>{t("common.loading")}</p>
    </div>
  );
}
```

## 🧪 Testing Translations

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit the default (English) version:
   ```
   http://localhost:3000/login
   ```

3. Click the language switcher (globe icon) in the header

4. Select "Polski" to switch to Polish

5. You should be redirected to:
   ```
   http://localhost:3000/pl/login
   ```

6. Verify that all translated content appears in Polish

## 🎯 Quick Reference

| Task | React Component | Astro Component |
|------|----------------|-----------------|
| Import | `import { useTranslation } from "@/components/hooks/useTranslation"` | `import { t, getLocaleFromUrl } from "@/lib/i18n"` |
| Setup | `const { t } = useTranslation()` | `const locale = getLocaleFromUrl(Astro.url)` |
| Translate | `{t("key.path")}` | `{t(locale, "key.path")}` |
| With params | `{t("key", { param: value })}` | `{t(locale, "key", { param: value })}` |

## 📚 Additional Resources

- Astro i18n Documentation: https://docs.astro.build/en/guides/internationalization/
- Project translation files: `src/i18n/`
- Translation utilities: `src/lib/i18n.ts`
- React hook: `src/components/hooks/useTranslation.ts`

---

**Note**: The core i18n infrastructure is complete and working. The remaining task is to systematically go through each component and replace hardcoded strings with translation keys using the patterns shown above.