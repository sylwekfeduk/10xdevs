import { useState, useEffect, useMemo } from "react";
import { getTranslations, getLocaleFromUrl, type Locale } from "@/lib/i18n";

/**
 * React hook to access translations in client components
 * Reads the locale from the current URL
 */
export function useTranslation() {
  // Start with default locale for SSR, then update on client
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    // Update locale after hydration on client side
    if (typeof window !== "undefined") {
      const detectedLocale = getLocaleFromUrl(new URL(window.location.href));
      setLocale(detectedLocale);
    }
  }, []);

  const translations = useMemo(() => {
    return getTranslations(locale);
  }, [locale]);

  /**
   * Get a nested translation value by path with optional replacements
   * Example: t("auth.login") returns "Sign in" for English
   * Example: t("recipes.showingResults", { start: 1, end: 10, total: 50 })
   */
  const t = (path: string, replacements?: Record<string, string | number>): string => {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string: ${path}`);
      return path;
    }

    // Handle replacements like {start}, {end}, etc.
    if (replacements) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return key in replacements ? String(replacements[key]) : match;
      });
    }

    return value;
  };

  return {
    t,
    locale,
    translations,
  };
}
