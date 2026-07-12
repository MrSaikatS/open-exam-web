"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createTopic } from "@/server/bankActions";
import { type TopicFormType, topicFormSchema } from "@/lib/zodSchema";
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

const CreateTopicDialog = ({ subjectId }: { subjectId: string }) => {
  const { refresh } = useRouter();
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<TopicFormType>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: { name: "", description: "" },
    mode: "all",
  });

  const onSubmit = async (data: TopicFormType) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("description", data.description ?? "");
    try {
      await createTopic(subjectId, fd);
      toast.success("Topic created");
      reset();
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create topic");
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
            <PlusIcon className="size-4" /> New Topic
          </Button>
        }
      />
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          <DialogHeader>
            <DialogTitle>New Topic</DialogTitle>
            <DialogDescription>
              Topics group questions within a subject.
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
                    placeholder="e.g. Algebra"
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
              : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTopicDialog;
