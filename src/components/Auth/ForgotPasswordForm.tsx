"use client";

import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, ForgotPasswordFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MailIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

const ForgotPasswordForm = () => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "all",
  });

  const forgotPasswordHandler = async ({ email }: ForgotPasswordFormType) => {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }

    toast.success("Check your email for a reset link");
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(forgotPasswordHandler)}
      className="grid gap-6"
      noValidate>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              aria-invalid={fieldState.invalid}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || !isValid}>
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> Sending...
          </>
        : <>
            <MailIcon /> Send reset link
          </>
        }
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
