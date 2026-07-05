import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Exams",
  description: "Manage your exams",
};

const ExaminerExamsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">My Exams</h1>
    </section>
  );
};

export default ExaminerExamsPage;
