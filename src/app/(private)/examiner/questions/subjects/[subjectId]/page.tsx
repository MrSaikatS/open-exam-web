import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeftIcon,
  BookMarkedIcon,
  ChevronRightIcon,
} from "lucide-react";
import CreateTopicDialog from "@/components/Bank/CreateTopicDialog";
import { Button } from "@/components/shadcnui/button";
import { getSubjectById } from "@/server/bankActions";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse topics in a subject",
};

const ExaminerSubjectTopicsPage = async ({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) => {
  const { subjectId } = await params;
  const subject = await getSubjectById(subjectId);

  return (
    <section className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={"/examiner/questions" as Route}>
            <Button
              variant="outline"
              size="icon-lg">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-medium">{subject.name}</h1>
            <p className="text-muted-foreground text-sm">
              {subject.description || "Topics in this subject"}
            </p>
          </div>
        </div>
        <CreateTopicDialog subjectId={subject.id} />
      </div>

      {subject.topics.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookMarkedIcon className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-lg">No topics yet</p>
          <p className="text-muted-foreground text-sm">
            Create a topic to start adding questions.
          </p>
        </div>
      : <div className="border-border overflow-x-auto rounded-3xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="px-4 py-3 text-left font-medium">Topic</th>
                <th className="px-4 py-3 text-left font-medium">Questions</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic) => (
                <tr
                  key={topic.id}
                  className="border-border hover:bg-muted/30 border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="grid gap-0.5">
                      <span className="font-medium">{topic.name}</span>
                      {topic.description && (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {topic.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {topic._count.questions}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={
                          `/examiner/questions/topics/${topic.id}` as Route
                        }>
                        <Button
                          variant="outline"
                          size="lg">
                          Open
                          <ChevronRightIcon className="size-4" />
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

export default ExaminerSubjectTopicsPage;
