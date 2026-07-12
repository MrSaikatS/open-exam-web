"use client";

import {
  type BankQuestionFormType,
  bankQuestionFormSchema,
} from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_choice", label: "Single Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short Answer" },
];

export type BankHierarchyItem = {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
};

type BankQuestionFormProps = {
  action: (formData: FormData) => Promise<void>;
  hierarchy: BankHierarchyItem[];
  defaultValues?: Partial<BankQuestionFormType> & { subjectId?: string };
  submitLabel?: string;
  /** Role base path used to redirect after save, e.g. "/admin" or "/examiner" */
  roleBasePath?: "/admin" | "/examiner";
};

const BankQuestionForm = ({
  action,
  hierarchy,
  defaultValues,
  submitLabel = "Save",
  roleBasePath,
}: BankQuestionFormProps) => {
  const router = useRouter();

  const initialSubjectId =
    defaultValues?.subjectId ??
    hierarchy.find((s) =>
      s.topics.some((t) => t.id === defaultValues?.topicId),
    )?.id ??
    hierarchy[0]?.id ??
    "";

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(bankQuestionFormSchema),
    defaultValues: {
      text: defaultValues?.text ?? "",
      type:
        (defaultValues?.type as BankQuestionFormType["type"]) ??
        "multiple_choice",
      options: defaultValues?.options ?? "",
      answer: defaultValues?.answer ?? "",
      points: defaultValues?.points ?? 1,
      topicId: defaultValues?.topicId ?? hierarchy[0]?.topics[0]?.id ?? "",
    },
    mode: "all",
  });

  const topicId = useWatch({ control, name: "topicId" });

  const selectedSubjectId = useMemo(() => {
    const fromTopic = hierarchy.find((s) =>
      s.topics.some((t) => t.id === topicId),
    )?.id;
    return fromTopic ?? initialSubjectId;
  }, [hierarchy, topicId, initialSubjectId]);

  const topicsForSubject =
    hierarchy.find((s) => s.id === selectedSubjectId)?.topics ?? [];

  const onSubjectChange = (subjectId: string) => {
    const firstTopic = hierarchy.find((s) => s.id === subjectId)?.topics[0];
    setValue("topicId", firstTopic?.id ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: BankQuestionFormType) => {
    const fd = new FormData();
    fd.set("text", data.text);
    fd.set("type", data.type);
    fd.set("options", data.options ?? "");
    fd.set("answer", data.answer ?? "");
    fd.set("points", String(data.points));
    fd.set("topicId", data.topicId);
    try {
      await action(fd);
      toast.success(
        submitLabel.toLowerCase().includes("update") ?
          "Question updated"
        : "Question created",
      );
      if (roleBasePath) {
        router.push(
          `${roleBasePath}/questions/topics/${data.topicId}` as never,
        );
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save question");
    }
  };

  if (hierarchy.length === 0 || hierarchy.every((s) => s.topics.length === 0)) {
    return (
      <p className="text-muted-foreground text-sm">
        Create a subject and topic before adding questions.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid max-w-2xl gap-6"
      noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="subjectId">Subject</FieldLabel>
          <select
            id="subjectId"
            value={selectedSubjectId}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 h-9 w-full min-w-0 rounded-3xl border border-transparent px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3">
            {hierarchy.map((s) => (
              <option
                key={s.id}
                value={s.id}
                disabled={s.topics.length === 0}>
                {s.name}
                {s.topics.length === 0 ? " (no topics)" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Controller
          name="topicId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
              <select
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-3xl border border-transparent px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 aria-invalid:ring-3">
                {topicsForSubject.length === 0 ?
                  <option value="">No topics</option>
                : topicsForSubject.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}>
                      {t.name}
                    </option>
                  ))
                }
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

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
