import enTranslations from "@/i18n/en.json";
import plTranslations from "@/i18n/pl.json";

export type Locale = "en" | "pl";

export type TranslationKey = keyof typeof enTranslations;

export type Translations = typeof enTranslations;

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  pl: plTranslations,
};

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

/**
 * Get a nested translation value by path
 * Example: t("auth.login") returns "Sign in" for English
 */
export function t(locale: Locale, path: string, replacements?: Record<string, string | number>): string {
  const keys = path.split(".");
  const trans = getTranslations(locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = trans;

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
}

/**
 * Get the locale from the URL path
 * Returns "en" for paths without locale prefix (default)
 * Returns "pl" for paths starting with /pl
 */
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && segments[0] === "pl") {
    return "pl";
  }

  return "en";
}

/**
 * Get a URL with the locale prefix
 * Example: localizedUrl("/recipes", "pl") returns "/pl/recipes"
 * Example: localizedUrl("/recipes", "en") returns "/recipes"
 */
export function localizedUrl(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Don't prefix default locale (en)
  if (locale === "en") {
    return `/${cleanPath}`;
  }

  return `/${locale}/${cleanPath}`;
}

/**
 * Remove locale prefix from a path
 * Example: removeLocaleFromPath("/pl/recipes") returns "/recipes"
 */
export function removeLocaleFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);

  if (segments.length > 0 && (segments[0] === "en" || segments[0] === "pl")) {
    segments.shift();
  }

  return `/${segments.join("/")}`;
}
