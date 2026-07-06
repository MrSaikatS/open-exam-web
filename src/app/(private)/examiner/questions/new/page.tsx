import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeftIcon } from "lucide-react";
import BankQuestionForm from "@/components/Exam/BankQuestionForm";
import { Button } from "@/components/shadcnui/button";
import { createBankQuestion } from "@/server/actions/bank";

export const metadata: Metadata = {
  title: "New Question",
  description: "Create a new bank question",
};

const NewBankQuestionPage = () => {
  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href={"/examiner/questions" as Route}>
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">New Question</h1>
      </div>
      <BankQuestionForm
        action={createBankQuestion}
        submitLabel="Create Question"
      />
    </section>
  );
};

export default NewBankQuestionPage;
