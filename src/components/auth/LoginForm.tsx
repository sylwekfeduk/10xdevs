import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AuthFormLayout } from "@/components/auth/shared/AuthFormLayout";
import { EmailPasswordFields } from "@/components/auth/shared/EmailPasswordFields";
import { useAuth } from "@/components/hooks/useAuth";
import { loginFormSchema, type LoginFormData } from "@/lib/validation/auth.schemas";

/**
 * Login form component with email/password authentication.
 * Calls server-side API endpoint and redirects based on onboarding status.
 */
export function LoginForm() {
  const { isLoading, error, login } = useAuth();

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
      title="Sign in"
      description="Enter your email and password to sign in to your account"
      footer={
        <div className="flex flex-col space-y-2 text-center">
          <a
            href="/password-recovery"
            className="text-sm text-gray-600 hover:text-[#2d5f4f] transition-colors"
          >
            Forgot your password?
          </a>
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-[#2d5f4f] hover:text-[#234a3d] font-medium">
              Sign up
            </a>
          </div>
        </div>
      }
    >
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EmailPasswordFields control={form.control} />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5f4f] hover:bg-[#234a3d] text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
