import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AuthFormLayout } from "@/components/auth/shared/AuthFormLayout";
import { EmailPasswordFields } from "@/components/auth/shared/EmailPasswordFields";
import { useAuth } from "@/components/hooks/useAuth";
import { registerFormSchema, type RegisterFormData } from "@/lib/validation/auth.schemas";

/**
 * Registration form component with email/password authentication.
 * Calls server-side API endpoint and redirects to onboarding on success.
 */
export function RegisterForm() {
  const { isLoading, error, register } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    await register(data);
  }

  return (
    <AuthFormLayout
      title="Create an account"
      description="Enter your email below to create your account"
      footer={
        <div className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-[#2d5f4f] hover:text-[#234a3d] font-medium">
            Sign in
          </a>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <EmailPasswordFields control={form.control} showConfirmPassword={true} />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5f4f] hover:bg-[#234a3d] text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>
    </AuthFormLayout>
  );
}
