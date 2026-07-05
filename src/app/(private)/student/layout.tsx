import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const StudentLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "student") {
    const role = session.user.role;
    if (role === "administrator") redirect("/admin");
    if (role === "examiner") redirect("/examiner");
    if (role === "proctor") redirect("/proctor");
  }

  return <>{children}</>;
};

export default StudentLayout;
