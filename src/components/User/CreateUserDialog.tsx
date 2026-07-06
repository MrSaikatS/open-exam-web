"use client";

import { createUserSchema, CreateUserFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createUser } from "@/server/actions/user";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../shadcnui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";

const CreateUserDialog = () => {
  const { refresh } = useRouter();
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<CreateUserFormType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
    mode: "all",
  });

  const onSubmit = async (data: CreateUserFormType) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("email", data.email);
    fd.set("password", data.password);
    fd.set("role", data.role);
    try {
      await createUser(fd);
      toast.success("User created");
      refresh();
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default">
            <UserPlusIcon /> Add User
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="John Doe"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                  placeholder="john@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                  placeholder="Min. 8 characters"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}>
                    <span>
                      {field.value.charAt(0).toUpperCase() +
                        field.value.slice(1)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="examiner">Examiner</SelectItem>
                    <SelectItem value="proctor">Proctor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting || !isValid}>
            {isSubmitting ?
              <>
                <Loader2Icon className="animate-spin" /> Creating...
              </>
            : <>
                <PlusIcon /> Create User
              </>
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
