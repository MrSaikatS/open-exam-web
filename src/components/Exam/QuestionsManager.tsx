"use client";

import { questionFormSchema, QuestionFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  addQuestion,
  deleteQuestion,
  updateQuestion,
} from "@/server/actions/exam";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string | null;
  answer: string | null;
  points: number;
  order: number;
};

type QuestionsManagerProps = {
  examId: string;
  questions: Question[];
};

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_choice", label: "Single Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short Answer" },
];

const QuestionForm = ({
  examId,
  onDone,
  initial,
}: {
  examId: string;
  onDone: () => void;
  initial?: Question;
}) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: initial?.text ?? "",
      type: (initial?.type as QuestionFormType["type"]) ?? "multiple_choice",
      options: initial?.options ?? "",
      answer: initial?.answer ?? "",
      points: initial?.points ?? 1,
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

    if (initial) {
      await updateQuestion(initial.id, fd);
      toast.success("Question updated");
    } else {
      await addQuestion(examId, fd);
      toast.success("Question added");
    }

    reset();
    onDone();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-border bg-muted/30 grid gap-4 rounded-3xl border p-4"
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
              rows={2}
              placeholder="Enter question text"
              aria-invalid={fieldState.invalid}
              className="bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-16 w-full min-w-0 resize-y rounded-3xl border border-transparent px-3 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3"
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
              rows={3}
              placeholder="Option A&#10;Option B&#10;Option C"
              aria-invalid={fieldState.invalid}
              className="bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-16 w-full min-w-0 resize-y rounded-3xl border border-transparent px-3 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3"
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

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          size="lg">
          {isSubmitting ?
            <Loader2Icon className="size-4 animate-spin" />
          : initial ?
            "Update"
          : "Add"}
        </Button>
        {initial && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onDone}>
            <XIcon className="size-4" /> Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

const QuestionsManager = ({ examId, questions }: QuestionsManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    setLoadingDelete(id);
    await deleteQuestion(id);
    toast.success("Question deleted");
    setLoadingDelete(null);
  };

  const handleDone = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const editingQuestion =
    editingId ? questions.find((q) => q.id === editingId) : undefined;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
        {!showForm && !editingId && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowForm(true)}>
            <PlusIcon className="size-4" /> Add Question
          </Button>
        )}
      </div>

      {(showForm || editingId) && (
        <QuestionForm
          examId={examId}
          onDone={handleDone}
          initial={editingQuestion}
        />
      )}

      {questions.length > 0 && (
        <div className="grid gap-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="border-border bg-card flex items-start justify-between gap-4 rounded-3xl border p-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="bg-muted flex size-6 items-center justify-center rounded-full text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium">{q.text}</span>
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                  <span className="bg-muted rounded-full px-2 py-0.5">
                    {questionTypes.find((t) => t.value === q.type)?.label ??
                      q.type}
                  </span>
                  <span className="bg-muted rounded-full px-2 py-0.5">
                    {q.points} pt{q.points !== 1 ? "s" : ""}
                  </span>
                  {q.answer && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-600 dark:text-green-400">
                      Answer: {q.answer}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setEditingId(q.id)}>
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => handleDelete(q.id)}
                  disabled={loadingDelete === q.id}>
                  {loadingDelete === q.id ?
                    <Loader2Icon className="size-3 animate-spin" />
                  : <Trash2Icon className="text-destructive size-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsManager;
