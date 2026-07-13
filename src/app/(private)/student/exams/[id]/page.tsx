import type { Metadata } from "next";
import Link from "next/link";
import { startExam, getAttemptQuestions } from "@/server/studentExamActions";
import { ExamPlayer } from "@/components/Student/ExamPlayer";

export const metadata: Metadata = {
  title: "Take Exam",
  description: "Take exam",
};

const StudentTakeExamPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  let attempt: Awaited<ReturnType<typeof startExam>>;
  try {
    attempt = await startExam(id);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "This exam is not available";
    return (
      <section className="grid gap-4">
        <h1 className="text-2xl font-medium">Exam Unavailable</h1>
        <p className="text-muted-foreground">{message}</p>
        <div>
          <Link
            href="/student/exams"
            className="text-primary text-sm hover:underline">
            ← Back to My Exams
          </Link>
        </div>
      </section>
    );
  }

  if (!attempt) {
    return (
      <section className="grid gap-4">
        <h1 className="text-2xl font-medium">Exam not found</h1>
        <p className="text-muted-foreground">
          Could not start this exam. Please try again.
        </p>
        <div>
          <Link
            href="/student/exams"
            className="text-primary text-sm hover:underline">
            ← Back to My Exams
          </Link>
        </div>
      </section>
    );
  }

  const data = await getAttemptQuestions(attempt.id);

  if (data.attempt.status !== "in_progress") {
    return (
      <section className="grid gap-4">
        <h1 className="text-2xl font-medium">Exam already submitted</h1>
        <p className="text-muted-foreground">
          You have already submitted this exam.
        </p>
        <div>
          <Link
            href="/student/exams"
            className="text-primary text-sm hover:underline">
            ← Back to My Exams
          </Link>
        </div>
      </section>
    );
  }

  return (
    <ExamPlayer
      attemptId={data.attempt.id}
      examTitle={data.attempt.exam?.title ?? "Exam"}
      duration={data.attempt.exam?.duration ?? 0}
      startedAt={data.attempt.startedAt.toISOString()}
      questions={data.questions}
      savedAnswers={data.answers}
    />
  );
};

export default StudentTakeExamPage;
