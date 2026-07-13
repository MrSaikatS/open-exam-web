import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeftIcon } from "lucide-react";
import BankQuestionForm from "@/components/Exam/BankQuestionForm";
import { Button } from "@/components/shadcnui/button";
import {
  createBankQuestion,
  getBankHierarchy,
  getTopicById,
} from "@/server/bankActions";

export const metadata: Metadata = {
  title: "New Question",
  description: "Create a new bank question",
};

const NewBankQuestionPage = async ({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) => {
  const { topicId } = await params;
  const [topic, hierarchy] = await Promise.all([
    getTopicById(topicId),
    getBankHierarchy(),
  ]);

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link
          href={
            `/examiner/questions/topics/${topic.id}` as Route
          }>
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <p className="text-muted-foreground text-xs">
            {topic.subject.name} · {topic.name}
          </p>
          <h1 className="text-2xl font-medium">New Question</h1>
        </div>
      </div>
      <BankQuestionForm
        action={createBankQuestion}
        hierarchy={hierarchy}
        defaultValues={{
          topicId: topic.id,
          subjectId: topic.subject.id,
        }}
        submitLabel="Create Question"
        roleBasePath="/examiner"
      />
    </section>
  );
};

export default NewBankQuestionPage;
