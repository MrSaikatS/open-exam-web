import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { BookOpenIcon, ChevronRightIcon, LayersIcon } from "lucide-react";
import CreateSubjectDialog from "@/components/Bank/CreateSubjectDialog";
import { Button } from "@/components/shadcnui/button";
import { getSubjects } from "@/server/bankActions";

export const metadata: Metadata = {
  title: "Question Bank",
  description: "Browse subjects in the question bank",
};

const ExaminerQuestionBankPage = async () => {
  const subjects = await getSubjects();

  return (
    <section className="grid gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Question Bank</h1>
          <p className="text-muted-foreground text-sm">
            Organize questions by subject and topic
          </p>
        </div>
        <CreateSubjectDialog />
      </div>

      {subjects.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookOpenIcon className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">No subjects yet</p>
          <p className="text-muted-foreground text-sm">
            Create a subject to start organizing your question bank.
          </p>
        </div>
      : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const questionCount = subject.topics.reduce(
              (sum, t) => sum + t._count.questions,
              0,
            );
            return (
              <div
                key={subject.id}
                className="border-border bg-card flex flex-col gap-3 rounded-3xl border p-5">
                <div className="grid min-w-0 gap-1">
                  <div className="flex items-center gap-2">
                    <LayersIcon className="text-muted-foreground size-4 shrink-0" />
                    <h2 className="truncate font-medium">{subject.name}</h2>
                  </div>
                  {subject.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {subject.description}
                    </p>
                  )}
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                  <span className="bg-muted rounded-full px-2.5 py-0.5">
                    {subject._count.topics} topic
                    {subject._count.topics !== 1 ? "s" : ""}
                  </span>
                  <span className="bg-muted rounded-full px-2.5 py-0.5">
                    {questionCount} question
                    {questionCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <Link
                  href={
                    `/examiner/questions/subjects/${subject.id}` as Route
                  }>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full">
                    View Topics
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      }
    </section>
  );
};

export default ExaminerQuestionBankPage;
