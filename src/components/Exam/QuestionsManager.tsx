"use client";

import {
  Loader2Icon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { deleteQuestion, updateQuestion } from "@/server/actions/exam";
import { getBankQuestions, importBankQuestions } from "@/server/actions/bank";
import { questionFormSchema, QuestionFormType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../shadcnui/button";
import { Field, FieldError, FieldLabel } from "../shadcnui/field";
import { Input } from "../shadcnui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";
import { Checkbox } from "../shadcnui/checkbox";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string | null;
  answer: string | null;
  points: number;
  order: number;
};

type BankQuestion = {
  id: string;
  text: string;
  type: string;
  options: string | null;
  answer: string | null;
  points: number;
};

type QuestionsManagerProps = {
  examId: string;
  questions: Question[];
};

const questionTypes: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
};

const EditQuestionForm = ({
  question,
  onDone,
}: {
  question: Question;
  onDone: () => void;
}) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: question.text,
      type: question.type as QuestionFormType["type"],
      options: question.options ?? "",
      answer: question.answer ?? "",
      points: question.points,
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

    try {
      await updateQuestion(question.id, fd);
      toast.success("Question updated");
      reset();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update question");
    }
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
                {Object.entries(questionTypes).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}>
                    {label}
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
          : "Update"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onDone}>
          <XIcon className="size-4" /> Cancel
        </Button>
      </div>
    </form>
  );
};

const ImportBankDialog = ({ examId }: { examId: string }) => {
  const [open, setOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadQuestions = useCallback(async () => {
    setFetching(true);
    const data = await getBankQuestions();
    setBankQuestions(data);
    setFetching(false);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadQuestions();
      setSelected(new Set());
      setSearch("");
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await importBankQuestions(examId, Array.from(selected));
      toast.success(`${selected.size} question(s) imported`);
      setOpen(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to import questions",
      );
    }
    setLoading(false);
  };

  const filtered = bankQuestions.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg">
            Import from Bank
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Select questions from the shared bank to add to this exam.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 h-9 w-full rounded-3xl border border-transparent pr-3 pl-9 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3"
          />
        </div>

        <div className="grid max-h-64 gap-1 overflow-y-auto">
          {fetching ?
            <div className="flex justify-center py-8">
              <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
            </div>
          : filtered.length === 0 ?
            <p className="text-muted-foreground py-8 text-center text-sm">
              {search ?
                "No questions match your search"
              : "No questions in the bank yet"}
            </p>
          : filtered.map((q) => (
              <label
                key={q.id}
                className="border-border hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5 text-sm">
                <Checkbox
                  checked={selected.has(q.id)}
                  onCheckedChange={() => toggle(q.id)}
                  className="mt-0.5"
                />
                <div className="grid min-w-0 gap-0.5">
                  <span className="truncate font-medium">{q.text}</span>
                  <span className="text-muted-foreground flex gap-2 text-xs">
                    <span className="bg-muted rounded-full px-2 py-0.5">
                      {questionTypes[q.type] ?? q.type}
                    </span>
                    <span className="bg-muted rounded-full px-2 py-0.5">
                      {q.points} pt{q.points !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>
              </label>
            ))
          }
        </div>

        <DialogFooter showCloseButton>
          <Button
            size="lg"
            onClick={handleImport}
            disabled={selected.size === 0 || loading}>
            {loading ?
              <>
                <Loader2Icon className="size-4 animate-spin" /> Importing...
              </>
            : `Import Selected (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const QuestionsManager = ({ examId, questions }: QuestionsManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLoadingDelete(id);
    try {
      await deleteQuestion(id);
      toast.success("Question deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete question");
    }
    setLoadingDelete(null);
  };

  const editingQuestion =
    editingId ? questions.find((q) => q.id === editingId) : undefined;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
        <ImportBankDialog examId={examId} />
      </div>

      {editingId && editingQuestion && (
        <EditQuestionForm
          question={editingQuestion}
          onDone={() => setEditingId(null)}
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
                    {questionTypes[q.type] ?? q.type}
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
