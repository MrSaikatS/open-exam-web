import type { Metadata, Route } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeftIcon, BarChart3Icon, EyeIcon, UsersIcon } from "lucide-react";
import ExamForm from "@/components/Exam/ExamForm";
import QuestionsManager from "@/components/Exam/QuestionsManager";
import { Button } from "@/components/shadcnui/button";
import { getExamById, updateExam } from "@/server/actions/exam";

export const metadata: Metadata = {
  title: "Exam Details",
  description: "View exam details",
};

const ExaminerExamDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const exam = await getExamById(id);

  const formatDate = (d: Date | null | undefined) => {
    if (!d) return "";
    return format(d, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href="/examiner/exams">
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">{exam.title}</h1>
      </div>

      <div className="text-muted-foreground grid gap-2 text-sm">
        <p>
          Status:{" "}
          <span className="text-foreground font-medium">{exam.status}</span>
        </p>
        <p>
          Duration:{" "}
          <span className="text-foreground font-medium">
            {exam.duration} minutes
          </span>
        </p>
        {exam.description && <p>{exam.description}</p>}
      </div>

      {exam.status === "draft" && (
        <div className="grid gap-4">
          <h2 className="text-lg font-medium">Edit Exam</h2>
          <ExamForm
            action={updateExam.bind(null, id)}
            defaultValues={{
              title: exam.title,
              description: exam.description ?? "",
              duration: exam.duration,
              startTime: formatDate(exam.startTime),
              endTime: formatDate(exam.endTime),
            }}
            submitLabel="Update Exam"
          />
        </div>
      )}

      <div className="border-border flex flex-wrap gap-2 border-t pt-8">
        <Link href={`/examiner/exams/${id}/assign`}>
          <Button
            variant="outline"
            size="lg">
            <UsersIcon className="size-4" /> Assign Students
          </Button>
        </Link>
        <Link href={`/examiner/exams/${id}/assign-proctor` as Route}>
          <Button
            variant="outline"
            size="lg">
            <EyeIcon className="size-4" /> Assign Proctors
          </Button>
        </Link>
        <Link href={`/examiner/exams/${id}/results`}>
          <Button
            variant="outline"
            size="lg">
            <BarChart3Icon className="size-4" /> Results
          </Button>
        </Link>
      </div>

      <div className="border-border border-t pt-8">
        <QuestionsManager
          examId={id}
          questions={exam.questions}
        />
      </div>
    </section>
  );
};

export default ExaminerExamDetailPage;
