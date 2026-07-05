import type { Metadata } from "next";
import ExamForm from "@/components/Exam/ExamForm";
import { createExam } from "@/server/actions/exam";

export const metadata: Metadata = {
  title: "Create Exam",
  description: "Create a new exam",
};

const ExaminerCreateExamPage = () => {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-medium">Create Exam</h1>
      <ExamForm
        action={createExam}
        submitLabel="Create Exam"
      />
    </section>
  );
};

export default ExaminerCreateExamPage;
