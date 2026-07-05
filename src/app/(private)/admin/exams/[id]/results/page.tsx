import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Results",
  description: "View exam results",
};

const AdminExamResultsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Exam Results</h1>
    </section>
  );
};

export default AdminExamResultsPage;
