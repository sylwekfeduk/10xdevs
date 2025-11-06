import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Zod schema for client-side validation
export const PasswordRecoveryFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ViewModel type inferred from schema
export type PasswordRecoveryFormViewModel = z.infer<typeof PasswordRecoveryFormSchema>;

/**
 * Password recovery form component.
 * Sends a password reset email to the user.
 */
export function PasswordRecoveryForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<PasswordRecoveryFormViewModel>({
    resolver: zodResolver(PasswordRecoveryFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Password recovery handler
  async function onSubmit(data: PasswordRecoveryFormViewModel) {
    setGlobalError(null);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 404) {
          setGlobalError(
            "No account found with this email address. Please check your email or sign up for a new account."
          );
        } else {
          setGlobalError(result.message || "An error occurred while processing your request.");
        }
        return;
      }

      // Show success message
      setIsSuccess(true);
    } catch {
      setGlobalError("A network error occurred. Please check your connection.");
    }
  }

  if (isSuccess) {
    return (
      <Card className="bg-white shadow-2xl border-0">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="text-2xl font-bold text-gray-900">Check your email</CardTitle>
          <CardDescription className="text-gray-600">We've sent you a password reset link</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          <Alert className="border-[#2d5f4f] bg-[#2d5f4f]/10">
            <CheckCircle2 className="h-4 w-4 text-[#2d5f4f]" />
            <AlertTitle className="text-[#234a3d]">Email sent</AlertTitle>
            <AlertDescription className="text-[#2d5f4f]">
              Please check your email inbox and click the link to reset your password. The link will expire in 1 hour.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 px-8">
          <a href="/login" className="text-sm text-gray-600 hover:text-[#2d5f4f] transition-colors">
            Return to sign in
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-2xl border-0">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Reset your password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-8 pb-6">
        {globalError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-[#2d5f4f] hover:bg-[#234a3d] text-white font-medium"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8 px-8">
        <a href="/login" className="text-sm text-gray-600 hover:text-[#2d5f4f] transition-colors">
          Return to sign in
        </a>
      </CardFooter>
    </Card>
  );
}
