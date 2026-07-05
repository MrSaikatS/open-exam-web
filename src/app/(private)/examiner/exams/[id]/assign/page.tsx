import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assign Exam",
  description: "Assign exam to students",
};

const ExaminerAssignExamPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Assign Exam</h1>
    </section>
  );
};

export default ExaminerAssignExamPage;
