import z from "zod";

export const loginFormSchema = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .max(64, { error: "Email must not exceed 64 characters" })
    .toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Password must be minimum 8 characters long" })
    .max(128, { error: "Password must not exceed 128 characters" }),
  rememberMe: z.boolean(),
});

export type LoginFormType = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(5, { error: "Name must be at least 5 characters long" })
      .max(32, { error: "Name must not exceed 32 characters" }),
    email: z
      .email({ error: "Invalid email address" })
      .max(64, { error: "Email must not exceed 64 characters" })
      .toLowerCase(),
    password: z
      .string()
      .min(8, { error: "Password must be minimum 8 characters long" })
      .max(128, { error: "Password must not exceed 128 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Password didn't match",
    path: ["confirmPassword"],
  });

export type RegisterFormType = z.infer<typeof registerFormSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .max(64, { error: "Email must not exceed 64 characters" })
    .toLowerCase(),
});

export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be minimum 8 characters long" })
      .max(128, { error: "Password must not exceed 128 characters" }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Password didn't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;
