# SSR Fix Summary

## Issue
The application was throwing a `ReferenceError: window is not defined` error when running because the `useTranslation` hook was trying to access `window.location` during server-side rendering (SSR).

## Root Cause
React components in Astro are rendered on the server first (SSR), and then hydrated on the client. The `useTranslation` hook was directly accessing `window.location.href` in `useMemo`, which doesn't exist during SSR.

## Solution
Updated `src/components/hooks/useTranslation.ts` to properly handle SSR by:

1. **Using `useState` instead of `useMemo`** for locale management
2. **Starting with a default locale** ("en") during SSR
3. **Using `useEffect`** to detect the actual locale from the URL after client-side hydration
4. **Checking for `window` availability** before accessing browser APIs

## Code Changes

### Before (Causing Error)
```typescript
export function useTranslation() {
  const locale = useMemo(() => {
    return getLocaleFromUrl(new URL(window.location.href)); // ❌ window not available during SSR
  }, []);
  // ...
}
```

### After (Fixed)
```typescript
export function useTranslation() {
  // Start with default locale for SSR
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    // Update locale after hydration on client side
    if (typeof window !== "undefined") {
      const detectedLocale = getLocaleFromUrl(new URL(window.location.href));
      setLocale(detectedLocale);
    }
  }, []);
  // ...
}
```

## How It Works

### 1. Server-Side Rendering (SSR)
- Component renders on the server with default locale: "en"
- No attempt to access `window` object
- No errors during SSR

### 2. Client-Side Hydration
- Component hydrates on the client
- `useEffect` runs after hydration
- Locale is detected from URL (`/pl/login` → "pl", `/login` → "en")
- State updates with correct locale
- Component re-renders with proper translations

## Testing

Build and run the application:
```bash
npm run build  # ✅ Builds successfully
npm run dev    # ✅ Runs without errors
```

Visit the application:
- **English**: http://localhost:3000/login
- **Polish**: http://localhost:3000/pl/login

Both work correctly without SSR errors!

## Impact

✅ **Fixed** - No more `window is not defined` errors
✅ **Compatible** - Works with Astro SSR
✅ **Functional** - Language detection works correctly
✅ **Build** - Successful production builds
✅ **User Experience** - Seamless language switching

## Technical Notes

This is the recommended pattern for handling browser APIs in React components that are server-side rendered:

1. **Check environment** - Use `typeof window !== "undefined"` before accessing browser APIs
2. **Use `useEffect`** - Browser APIs should only be accessed in `useEffect` (runs only on client)
3. **Provide defaults** - Always have a fallback value for SSR
4. **State management** - Use `useState` for values that need to be updated after hydration

This pattern ensures components work correctly in both SSR and CSR environments.