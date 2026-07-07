import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import BankQuestionForm from "@/components/Exam/BankQuestionForm";
import { Button } from "@/components/shadcnui/button";
import { getBankQuestionById, updateBankQuestion } from "@/server/bankActions";

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
  const question = await getBankQuestionById(id);

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/questions">
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">Edit Question</h1>
      </div>
      <BankQuestionForm
        action={updateBankQuestion.bind(null, id)}
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
        }}
        submitLabel="Update Question"
      />
    </section>
  );
};

export default EditBankQuestionPage;
