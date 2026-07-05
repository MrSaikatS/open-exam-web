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

export const examFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required" })
    .max(200, { error: "Title must not exceed 200 characters" }),
  description: z
    .string()
    .trim()
    .max(2000, { error: "Description must not exceed 2000 characters" })
    .optional()
    .or(z.literal("")),
  duration: z.coerce
    .number({ error: "Duration must be a number" })
    .int({ error: "Duration must be a whole number" })
    .min(1, { error: "Duration must be at least 1 minute" })
    .max(1440, { error: "Duration must not exceed 1440 minutes" }),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
});

export type ExamFormType = z.infer<typeof examFormSchema>;

export const questionFormSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { error: "Question text is required" })
    .max(1000, { error: "Question text must not exceed 1000 characters" }),
  type: z.enum(
    ["multiple_choice", "single_choice", "true_false", "short_answer"],
    {
      error: "Please select a question type",
    },
  ),
  options: z.string().optional().or(z.literal("")),
  answer: z.string().optional().or(z.literal("")),
  points: z.coerce
    .number({ error: "Points must be a number" })
    .int({ error: "Points must be a whole number" })
    .min(0, { error: "Points must be at least 0" })
    .max(999, { error: "Points must not exceed 999" }),
});

export type QuestionFormType = z.infer<typeof questionFormSchema>;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters long" })
    .max(64, { error: "Name must not exceed 64 characters" }),
  email: z
    .email({ error: "Invalid email address" })
    .max(64, { error: "Email must not exceed 64 characters" })
    .toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Password must be minimum 8 characters long" })
    .max(128, { error: "Password must not exceed 128 characters" }),
  role: z.enum(["admin", "examiner", "proctor", "student"], {
    error: "Please select a role",
  }),
});

export type CreateUserFormType = z.infer<typeof createUserSchema>;
