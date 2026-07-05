import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Results",
  description: "View all exam results",
};

const AdminAllResultsPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">All Results</h1>
    </section>
  );
};

export default AdminAllResultsPage;
