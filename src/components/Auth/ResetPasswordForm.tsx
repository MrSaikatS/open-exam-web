"use client";

import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, ResetPasswordFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

const ResetPasswordForm = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "all",
  });

  const resetPasswordHandler = async ({ password }: ResetPasswordFormType) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }

    toast.success("Password reset successfully");
    reset();
    replace("/");
  };

  return (
    <form
      onSubmit={handleSubmit(resetPasswordHandler)}
      className="grid gap-6"
      noValidate>
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Confirm new password"
              autoComplete="new-password"
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
            <Loader2Icon className="animate-spin" /> Resetting...
          </>
        : <>
            <LockIcon /> Reset password
          </>
        }
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
