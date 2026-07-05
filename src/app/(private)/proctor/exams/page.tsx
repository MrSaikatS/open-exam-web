import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assigned Exams",
  description: "View assigned exams",
};

const ProctorExamsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Assigned Exams</h1>
    </section>
  );
};

export default ProctorExamsPage;
