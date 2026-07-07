import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/Sidebar/SidebarLayout";
import { adminNav } from "@/components/Sidebar/nav-config";

const AdminLayout = ({ children }: LayoutProps) => (
  <Suspense fallback={null}>
    <AdminGate>{children}</AdminGate>
  </Suspense>
);

const AdminGate = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    const role = session.user.role;
    if (role === "examiner") redirect("/examiner");
    if (role === "proctor") redirect("/proctor");
    redirect("/student");
  }

  return <SidebarLayout groups={adminNav}>{children}</SidebarLayout>;
};

export default AdminLayout;
