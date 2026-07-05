import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Results",
  description: "View your results",
};

const StudentResultsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">My Results</h1>
    </section>
  );
};

export default StudentResultsPage;
