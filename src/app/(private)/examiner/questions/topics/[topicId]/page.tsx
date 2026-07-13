import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeftIcon, BookOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { getTopicById } from "@/server/bankActions";

export const metadata: Metadata = {
  title: "Questions",
  description: "Bank questions in a topic",
};

const questionTypes: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
};

const ExaminerTopicQuestionsPage = async ({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) => {
  const { topicId } = await params;
  const topic = await getTopicById(topicId);

  return (
    <section className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={
              `/examiner/questions/subjects/${topic.subject.id}` as Route
            }>
            <Button
              variant="outline"
              size="icon-lg">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <p className="text-muted-foreground text-xs">
              {topic.subject.name}
            </p>
            <h1 className="text-2xl font-medium">{topic.name}</h1>
            <p className="text-muted-foreground text-sm">
              {topic.description || "Questions in this topic"}
            </p>
          </div>
        </div>
        <Link
          href={
            `/examiner/questions/topics/${topic.id}/new` as Route
          }>
          <Button
            variant="outline"
            size="lg">
            <PlusIcon className="size-4" /> New Question
          </Button>
        </Link>
      </div>

      {topic.questions.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookOpenIcon className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">No questions yet</p>
          <Link
            href={
              `/examiner/questions/topics/${topic.id}/new` as Route
            }>
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
              {topic.questions.map((q) => (
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
                      <Link href={`/examiner/questions/${q.id}` as Route}>
                        <Button
                          variant="outline"
                          size="icon-lg">
                          Edit
                        </Button>
                      </Link>
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

export default ExaminerTopicQuestionsPage;
