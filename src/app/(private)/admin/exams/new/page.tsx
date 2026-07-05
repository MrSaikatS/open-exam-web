import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Exam",
  description: "Create a new exam",
};

const AdminCreateExamPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Create Exam</h1>
    </section>
  );
};

export default AdminCreateExamPage;
