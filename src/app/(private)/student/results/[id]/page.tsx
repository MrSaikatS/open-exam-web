import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Result Details",
  description: "View result details",
};

const StudentResultDetailPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">Result Details</h1>
    </section>
  );
};

export default StudentResultDetailPage;
