import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseClient } from "@/db/supabase.client";

// Zod schema for client-side validation
export const PasswordUpdateFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ViewModel type inferred from schema
export type PasswordUpdateFormViewModel = z.infer<typeof PasswordUpdateFormSchema>;

/**
 * Password update form component.
 * Allows users to set a new password after clicking the reset link.
 */
export function PasswordUpdateForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<PasswordUpdateFormViewModel>({
    resolver: zodResolver(PasswordUpdateFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check for valid session on mount
  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error || !data.session) {
        setIsValidToken(false);
        setGlobalError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }

      setIsValidToken(true);
    }

    checkSession();
  }, []);

  // Password update handler
  async function onSubmit(data: PasswordUpdateFormViewModel) {
    setGlobalError(null);

    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setGlobalError(error.message);
        return;
      }

      // Redirect to login on success
      window.location.href = "/login";
    } catch {
      setGlobalError("A network error occurred. Please check your connection.");
    }
  }

  if (isValidToken === null) {
    return (
      <Card className="bg-white shadow-2xl border-0">
        <CardContent className="pt-12 pb-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3F8C4F]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isValidToken === false) {
    return (
      <Card className="bg-white shadow-2xl border-0">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="text-2xl font-bold text-gray-900">Invalid Reset Link</CardTitle>
          <CardDescription className="text-gray-600">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <a href="/password-recovery">
              <Button className="bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium">
                Request New Reset Link
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-2xl border-0">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Set new password</CardTitle>
        <CardDescription className="text-gray-600">Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-8 pb-8">
        {globalError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your new password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm your new password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
