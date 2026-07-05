import type { Metadata } from "next";
import { startExam, getAttemptQuestions } from "@/server/actions/studentExam";
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
  const attempt = await startExam(id);
  const data = await getAttemptQuestions(attempt.id);

  if (data.attempt.status !== "in_progress") {
    return (
      <section>
        <h1 className="text-2xl font-medium">Exam already submitted</h1>
        <p className="text-muted-foreground">
          You have already submitted this exam.
        </p>
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
