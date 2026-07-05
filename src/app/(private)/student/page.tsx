import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Student dashboard",
};

const StudentDashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section>
      <h1 className="text-2xl font-medium">Student Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {session?.user.name}
      </p>
    </section>
  );
};

export default StudentDashboard;
