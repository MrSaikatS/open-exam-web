import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Details",
  description: "View exam details",
};

const ExaminerExamDetailPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Exam Details</h1>
    </section>
  );
};

export default ExaminerExamDetailPage;
