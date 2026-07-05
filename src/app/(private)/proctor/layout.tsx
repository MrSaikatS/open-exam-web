import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

  return <>{children}</>;
};

export default ProctorLayout;
