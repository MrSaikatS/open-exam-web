import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assign Exam",
  description: "Assign exam to users",
};

const AdminAssignExamPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Assign Exam</h1>
    </section>
  );
};

export default AdminAssignExamPage;
