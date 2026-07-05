import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "administrator") {
    const role = session.user.role;
    if (role === "examiner") redirect("/examiner");
    if (role === "proctor") redirect("/proctor");
    redirect("/student");
  }

  return <>{children}</>;
};

export default AdminLayout;
