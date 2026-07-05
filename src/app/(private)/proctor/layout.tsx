import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/Sidebar/SidebarLayout";
import { proctorNav } from "@/components/Sidebar/nav-config";

const ProctorLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "proctor") {
    const role = session.user.role;
    if (role === "administrator") redirect("/admin");
    if (role === "examiner") redirect("/examiner");
    redirect("/student");
  }

  return <SidebarLayout groups={proctorNav}>{children}</SidebarLayout>;
};

export default ProctorLayout;
