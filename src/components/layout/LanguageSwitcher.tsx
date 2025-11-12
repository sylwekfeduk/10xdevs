import * as React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLocaleFromUrl, localizedUrl, removeLocaleFromPath, type Locale } from "@/lib/i18n";

const LANGUAGES = {
  en: { name: "English", flag: "🇬🇧" },
  pl: { name: "Polski", flag: "🇵🇱" },
} as const;

/**
 * Language switcher component for the application header.
 * Allows users to switch between English and Polish.
 */
export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = React.useState<Locale>("en");

  React.useEffect(() => {
    const locale = getLocaleFromUrl(new URL(window.location.href));
    setCurrentLocale(locale);
  }, []);

  const handleLanguageChange = React.useCallback((newLocale: Locale) => {
    const currentUrl = new URL(window.location.href);
    const pathWithoutLocale = removeLocaleFromPath(currentUrl.pathname);
    const newPath = localizedUrl(pathWithoutLocale, newLocale);

    // Preserve search params and hash
    const newUrl = `${newPath}${currentUrl.search}${currentUrl.hash}`;
    window.location.href = newUrl;
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white hover:bg-white/10">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LANGUAGES[currentLocale].name}</span>
          <span className="sm:hidden">{LANGUAGES[currentLocale].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(LANGUAGES) as Locale[]).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className="cursor-pointer"
            disabled={locale === currentLocale}
          >
            <span className="mr-2">{LANGUAGES[locale].flag}</span>
            <span>{LANGUAGES[locale].name}</span>
            {locale === currentLocale && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
