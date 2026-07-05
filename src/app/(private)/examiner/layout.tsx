import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/Sidebar/SidebarLayout";
import { examinerNav } from "@/components/Sidebar/nav-config";

const ExaminerLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "examiner") {
    const role = session.user.role;
    if (role === "administrator") redirect("/admin");
    if (role === "proctor") redirect("/proctor");
    redirect("/student");
  }

  return <SidebarLayout groups={examinerNav}>{children}</SidebarLayout>;
};

export default ExaminerLayout;
