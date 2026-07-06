"use client";

import { questionFormSchema, QuestionFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_choice", label: "Single Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short Answer" },
];

type BankQuestionFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<QuestionFormType>;
  submitLabel?: string;
};

const BankQuestionForm = ({
  action,
  defaultValues,
  submitLabel = "Save",
}: BankQuestionFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: defaultValues?.text ?? "",
      type:
        (defaultValues?.type as QuestionFormType["type"]) ?? "multiple_choice",
      options: defaultValues?.options ?? "",
      answer: defaultValues?.answer ?? "",
      points: defaultValues?.points ?? 1,
    },
    mode: "all",
  });

  const onSubmit = async (data: QuestionFormType) => {
    const fd = new FormData();
    fd.set("text", data.text);
    fd.set("type", data.type);
    fd.set("options", data.options ?? "");
    fd.set("answer", data.answer ?? "");
    fd.set("points", String(data.points));
    await action(fd);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid max-w-2xl gap-6"
      noValidate>
      <Controller
        name="text"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Question</FieldLabel>
            <textarea
              {...field}
              id={field.name}
              rows={3}
              placeholder="Enter question text"
              aria-invalid={fieldState.invalid}
              className="bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-24 w-full min-w-0 resize-y rounded-3xl border border-transparent px-3 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Type</FieldLabel>
              <select
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-3xl border border-transparent px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 aria-invalid:ring-3">
                {questionTypes.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="points"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Points</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                max={999}
                value={String(field.value ?? "")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="options"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Options (one per line, for choice questions)
            </FieldLabel>
            <textarea
              {...field}
              id={field.name}
              rows={4}
              placeholder="Option A&#10;Option B&#10;Option C"
              aria-invalid={fieldState.invalid}
              className="bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-24 w-full min-w-0 resize-y rounded-3xl border border-transparent px-3 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="answer"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Correct Answer</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Enter the correct answer"
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
            <Loader2Icon className="size-4 animate-spin" /> Saving...
          </>
        : submitLabel}
      </Button>
    </form>
  );
};

export default BankQuestionForm;
