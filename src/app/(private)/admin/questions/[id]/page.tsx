import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeftIcon } from "lucide-react";
import BankQuestionForm from "@/components/Exam/BankQuestionForm";
import { Button } from "@/components/shadcnui/button";
import {
  getBankHierarchy,
  getBankQuestionById,
  updateBankQuestion,
} from "@/server/bankActions";

export const metadata: Metadata = {
  title: "Edit Question",
  description: "Edit a bank question",
};

const EditBankQuestionPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [question, hierarchy] = await Promise.all([
    getBankQuestionById(id),
    getBankHierarchy(),
  ]);

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link
          href={
            `/admin/questions/topics/${question.topic.id}` as Route
          }>
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <p className="text-muted-foreground text-xs">
            {question.topic.subject.name} · {question.topic.name}
          </p>
          <h1 className="text-2xl font-medium">Edit Question</h1>
        </div>
      </div>
      <BankQuestionForm
        action={updateBankQuestion.bind(null, id)}
        hierarchy={hierarchy}
        defaultValues={{
          text: question.text,
          type: question.type as
            | "multiple_choice"
            | "single_choice"
            | "true_false"
            | "short_answer",
          options: question.options ?? "",
          answer: question.answer ?? "",
          points: question.points,
          topicId: question.topicId,
          subjectId: question.topic.subjectId,
        }}
        submitLabel="Update Question"
        roleBasePath="/admin"
      />
    </section>
  );
};

export default EditBankQuestionPage;
