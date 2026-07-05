import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitor Exam",
  description: "Monitor exam in progress",
};

const ProctorMonitorExamPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Monitor Exam</h1>
    </section>
  );
};

export default ProctorMonitorExamPage;
