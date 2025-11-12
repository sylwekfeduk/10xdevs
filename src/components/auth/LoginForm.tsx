import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AuthFormLayout } from "@/components/auth/shared/AuthFormLayout";
import { EmailPasswordFields } from "@/components/auth/shared/EmailPasswordFields";
import { useAuth } from "@/components/hooks/useAuth";
import { useTranslation } from "@/components/hooks/useTranslation";
import { localizedUrl } from "@/lib/i18n";
import { loginFormSchema, type LoginFormData } from "@/lib/validation/auth.schemas";

/**
 * Login form component with email/password authentication.
 * Calls server-side API endpoint and redirects based on onboarding status.
 */
export function LoginForm() {
  const { t, locale } = useTranslation();
  const { isLoading, error, login } = useAuth();

  // Create locale-aware URLs
  const passwordRecoveryUrl = React.useMemo(() => localizedUrl("/password-recovery", locale), [locale]);
  const registerUrl = React.useMemo(() => localizedUrl("/register", locale), [locale]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    await login(data);
  }

  return (
    <AuthFormLayout
      title={t("auth.login")}
      description="Enter your email and password to sign in to your account"
      footer={
        <div className="flex flex-col space-y-2 text-center">
          <a href={passwordRecoveryUrl} className="text-sm text-gray-600 hover:text-[#3F8C4F] transition-colors">
            {t("auth.forgotPassword")}
          </a>
          <div className="text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <a href={registerUrl} className="text-[#3F8C4F] hover:text-[#234a3d] font-medium">
              {t("auth.signUpHere")}
            </a>
          </div>
        </div>
      }
    >
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EmailPasswordFields control={form.control} />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.login")}...
              </>
            ) : (
              t("auth.login")
            )}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
