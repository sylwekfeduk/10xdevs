import { z } from "zod";

/**
 * Shared validation schema for email field
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Shared validation schema for password field
 */
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/**
 * Schema for login form
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema for registration form with password confirmation
 */
export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Schema for password recovery form
 */
export const passwordRecoveryFormSchema = z.object({
  email: emailSchema,
});

/**
 * Schema for password update form
 */
export const passwordUpdateFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export type definitions
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type PasswordRecoveryFormData = z.infer<typeof passwordRecoveryFormSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateFormSchema>;
