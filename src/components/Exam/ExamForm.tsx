"use client";

import { examFormSchema, ExamFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";
import { Textarea } from "../shadcnui/textarea";

type ExamFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<ExamFormType>;
  submitLabel?: string;
};

const ExamForm = ({
  action,
  defaultValues,
  submitLabel = "Save",
}: ExamFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      duration: defaultValues?.duration ?? 60,
      startTime: defaultValues?.startTime ?? "",
      endTime: defaultValues?.endTime ?? "",
    },
    mode: "all",
  });

  const onSubmit = async (data: ExamFormType) => {
    const fd = new FormData();
    fd.set("title", data.title);
    fd.set("description", data.description ?? "");
    fd.set("duration", String(data.duration));
    fd.set("startTime", data.startTime ?? "");
    fd.set("endTime", data.endTime ?? "");
    await action(fd);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid max-w-2xl gap-6"
      noValidate>
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Enter exam title"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Enter exam description (optional)"
              aria-invalid={fieldState.invalid}
              className="h-24"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="duration"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Duration (minutes)</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="number"
              min={1}
              max={1440}
              placeholder="60"
              value={String(field.value ?? "")}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="startTime"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Start Time (optional)</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="datetime-local"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="endTime"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>End Time (optional)</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="datetime-local"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        className="w-fit"
        type="submit"
        disabled={isSubmitting || !isValid}>
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> Saving...
          </>
        : <>
            <SaveIcon /> {submitLabel}
          </>
        }
      </Button>
    </form>
  );
};

export default ExamForm;
