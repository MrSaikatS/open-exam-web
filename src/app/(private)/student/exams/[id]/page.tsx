import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Exam",
  description: "Take exam",
};

const StudentTakeExamPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Take Exam</h1>
    </section>
  );
};

export default StudentTakeExamPage;
