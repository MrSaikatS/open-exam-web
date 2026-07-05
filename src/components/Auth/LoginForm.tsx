"use client";

import { authClient } from "@/lib/auth-client";
import { loginFormSchema, LoginFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "../shadcnui/button";
import { Checkbox } from "../shadcnui/checkbox";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

const LoginForm = () => {
  const { replace } = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "all",
  });

  const loginFormHandler = async ({
    email,
    password,
    rememberMe,
  }: LoginFormType) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }

    const role = data?.user?.role;

    toast.success("Welcome back!");
    reset();

    if (role === "administrator") replace("/admin");
    else if (role === "examiner") replace("/examiner");
    else if (role === "proctor") replace("/proctor");
    else replace("/student");
  };

  return (
    <form
      onSubmit={handleSubmit(loginFormHandler)}
      className="grid gap-6"
      noValidate>
      {/* Email field */}
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

      {/* Password field */}
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Remember Me checkbox */}
      <Controller
        name="rememberMe"
        control={control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            orientation={"horizontal"}>
            <Checkbox
              id={field.name}
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              className="cursor-pointer"
            />
            <FieldLabel htmlFor={field.name}>Keep me signed in</FieldLabel>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Submit button */}
      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || !isValid}>
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> Logging in...
          </>
        : <>
            <LockIcon /> Login
          </>
        }
      </Button>
    </form>
  );
};

export default LoginForm;
