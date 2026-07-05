import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Exams",
  description: "View your exams",
};

const StudentExamsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">My Exams</h1>
    </section>
  );
};

export default StudentExamsPage;
