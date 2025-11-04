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
import { supabaseClient } from "@/db/supabase.client";

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
      const { error } = await supabaseClient.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setGlobalError(error.message);
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
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>We've sent you a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100">Email sent</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Please check your email inbox and click the link to reset your password. The link will expire in 1 hour.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Return to sign in
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>Enter your email address and we'll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {globalError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
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
      <CardFooter className="flex justify-center">
        <a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Return to sign in
        </a>
      </CardFooter>
    </Card>
  );
}
