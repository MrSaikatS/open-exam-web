"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createSubject } from "@/server/bankActions";
import {
  type SubjectFormType,
  subjectFormSchema,
} from "@/lib/zodSchema";
import { Button } from "../shadcnui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";
import { Textarea } from "../shadcnui/textarea";

const CreateSubjectDialog = () => {
  const { refresh } = useRouter();
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<SubjectFormType>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: "", description: "" },
    mode: "all",
  });

  const onSubmit = async (data: SubjectFormType) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("description", data.description ?? "");
    try {
      await createSubject(fd);
      toast.success("Subject created");
      reset();
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create subject");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg">
            <PlusIcon className="size-4" /> New Subject
          </Button>
        }
      />
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          <DialogHeader>
            <DialogTitle>New Subject</DialogTitle>
            <DialogDescription>
              Subjects group related topics in the question bank.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g. Mathematics"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={2}
                    placeholder="Brief description"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !isValid}>
              {isSubmitting ?
                <>
                  <Loader2Icon className="size-4 animate-spin" /> Creating...
                </>
              : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectDialog;
