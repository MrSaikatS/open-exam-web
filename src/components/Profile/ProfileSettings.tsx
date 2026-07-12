"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockIcon, SaveIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import {
  type ChangePasswordFormType,
  changePasswordSchema,
} from "@/lib/zodSchema";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { AccountInfo } from "./AccountInfo";
import { AvatarUpload } from "./AvatarUpload";

const ProfileSettings = () => {
  const { data: session } = authClient.useSession();

  const {
    handleSubmit: handleNameSubmitForm,
    control: nameControl,
    formState: { isSubmitting: nameIsSubmitting, isDirty: nameIsDirty },
  } = useForm({
    values: { name: session?.user?.name ?? "" },
    mode: "all",
  });

  const {
    handleSubmit: handlePasswordSubmitForm,
    control: passwordControl,
    formState: { isSubmitting: passwordIsSubmitting, isValid: passwordIsValid },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "all",
  });

  const handleNameSubmit = async ({ name }: { name: string }) => {
    const { error } = await authClient.updateUser({ name });

    if (error) {
      toast.error(error.message ?? "Failed to update name");
      return;
    }

    toast.success("Name updated");
  };

  const handlePasswordSubmit = async (data: ChangePasswordFormType) => {
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message ?? "Failed to change password");
      return;
    }

    toast.success("Password changed");
    resetPasswordForm();
  };

  if (!session?.user) return null;

  return (
    <div className="grid gap-8">
      <AccountInfo
        email={session.user.email}
        role={session.user.role}
        createdAt={session.user.createdAt}
      />

      <AvatarUpload />

      <Card size="sm">
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleNameSubmitForm(handleNameSubmit)}
            className="flex items-end gap-3"
            noValidate>
            {/* Name field */}
            <Controller
              name="name"
              control={nameControl}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex-1">
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Save button */}
            <Button
              type="submit"
              disabled={nameIsSubmitting || !nameIsDirty}
              size="lg">
              {nameIsSubmitting ?
                <Loader2Icon className="animate-spin" />
              : <SaveIcon />}
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmitForm(handlePasswordSubmit)}
            className="grid gap-4"
            noValidate>
            {/* Current password field */}
            <Controller
              name="currentPassword"
              control={passwordControl}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* New password field */}
            <Controller
              name="newPassword"
              control={passwordControl}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Confirm password field */}
            <Controller
              name="confirmPassword"
              control={passwordControl}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirm New Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Change password button */}
            <Button
              type="submit"
              disabled={passwordIsSubmitting || !passwordIsValid}
              className="w-fit"
              size="lg">
              {passwordIsSubmitting ?
                <Loader2Icon className="animate-spin" />
              : <LockIcon />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfileSettings };
