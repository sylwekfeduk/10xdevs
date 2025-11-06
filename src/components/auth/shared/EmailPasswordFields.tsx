import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

interface EmailPasswordFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  showConfirmPassword?: boolean;
  emailName?: FieldPath<TFieldValues>;
  passwordName?: FieldPath<TFieldValues>;
  confirmPasswordName?: FieldPath<TFieldValues>;
}

/**
 * Shared form fields for email and password inputs
 * Used across login, register, and password update forms
 */
export function EmailPasswordFields<TFieldValues extends FieldValues>({
  control,
  showConfirmPassword = false,
  emailName = "email" as FieldPath<TFieldValues>,
  passwordName = "password" as FieldPath<TFieldValues>,
  confirmPasswordName = "confirmPassword" as FieldPath<TFieldValues>,
}: EmailPasswordFieldsProps<TFieldValues>) {
  return (
    <>
      {/* Email Field - Only show if emailName is provided */}
      {emailName && (
        <FormField
          control={control}
          name={emailName}
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
      )}

      {/* Password Field */}
      <FormField
        control={control}
        name={passwordName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{showConfirmPassword ? "New Password" : "Password"}</FormLabel>
            <FormControl>
              <Input
                placeholder={`Enter your ${showConfirmPassword ? "new " : ""}password`}
                type="password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Confirm Password Field */}
      {showConfirmPassword && (
        <FormField
          control={control}
          name={confirmPasswordName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm {showConfirmPassword ? "New " : ""}Password</FormLabel>
              <FormControl>
                <Input
                  placeholder={`Confirm your ${showConfirmPassword ? "new " : ""}password`}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
