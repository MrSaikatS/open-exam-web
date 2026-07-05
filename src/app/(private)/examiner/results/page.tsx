import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Results",
  description: "View all results",
};

const ExaminerAllResultsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">All Results</h1>
    </section>
  );
};

export default ExaminerAllResultsPage;
