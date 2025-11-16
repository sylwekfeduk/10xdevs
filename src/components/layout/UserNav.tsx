import * as React from "react";
import { User, LogOut, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/components/hooks/useTranslation";
import { localizedUrl } from "@/lib/i18n";

/**
 * User navigation dropdown component for the application header.
 * Displays user avatar and provides access to profile and logout.
 */
export function UserNav() {
  const { t, locale } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Create locale-aware profile URL
  const profileUrl = React.useMemo(() => {
    return localizedUrl("/profile", locale);
  }, [locale]);

  // Fetch user profile to check admin status
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/me/profile");
        if (response.ok) {
          const profile = await response.json();
          setIsAdmin(profile.is_admin === true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    checkAdminStatus();
  }, []);

  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Logout failed");
        setIsLoggingOut(false);
        return;
      }

      // Redirect to home with locale awareness
      window.location.href = localizedUrl("/", locale);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  }, [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild>
          <a href={profileUrl} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t("nav.profile")}</span>
          </a>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <a href="/admin/master-recipes" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
