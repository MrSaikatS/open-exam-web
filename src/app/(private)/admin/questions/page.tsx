import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { getBankQuestions } from "@/server/actions/bank";
import DeleteBankQuestionButton from "@/components/Exam/DeleteBankQuestionButton";

export const metadata: Metadata = {
  title: "Question Bank",
  description: "Manage reusable questions",
};

const questionTypes: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
};

const AdminQuestionBankPage = async () => {
  const questions = await getBankQuestions();

  return (
    <section className="grid gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Question Bank</h1>
        <Link href="/admin/questions/new">
          <Button
            variant="outline"
            size="lg">
            <PlusIcon className="size-4" /> New Question
          </Button>
        </Link>
      </div>

      {questions.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookOpenIcon className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">No questions yet</p>
          <Link href={"/admin/questions/new" as Route}>
            <Button variant="default">Create your first question</Button>
          </Link>
        </div>
      : <div className="border-border overflow-x-auto rounded-3xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="px-4 py-3 text-left font-medium">Question</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Points</th>
                <th className="px-4 py-3 text-left font-medium">Created by</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr
                  key={q.id}
                  className="border-border hover:bg-muted/30 border-b last:border-0">
                  <td className="max-w-xs truncate px-4 py-3 font-medium">
                    {q.text}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-muted rounded-full px-2.5 py-0.5 text-xs">
                      {questionTypes[q.type] ?? q.type}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {q.points} pt{q.points !== 1 ? "s" : ""}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {q.createdBy.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/questions/${q.id}` as Route}>
                        <Button
                          variant="outline"
                          size="icon-lg">
                          Edit
                        </Button>
                      </Link>
                      <DeleteBankQuestionButton id={q.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </section>
  );
};

export default AdminQuestionBankPage;
