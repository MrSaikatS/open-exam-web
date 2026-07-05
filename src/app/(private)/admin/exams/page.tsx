import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exams",
  description: "Manage all exams",
};

const AdminExamsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">All Exams</h1>
    </section>
  );
};

export default AdminExamsPage;
