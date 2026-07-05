import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/Sidebar/SidebarLayout";
import { studentNav } from "@/components/Sidebar/nav-config";

const StudentLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "student") {
    const role = session.user.role;
    if (role === "admin") redirect("/admin");
    if (role === "examiner") redirect("/examiner");
    if (role === "proctor") redirect("/proctor");
  }

  return <SidebarLayout groups={studentNav}>{children}</SidebarLayout>;
};

export default StudentLayout;
