import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users",
};

const AdminUsersPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-medium">User Management</h1>
    </section>
  );
};

export default AdminUsersPage;
