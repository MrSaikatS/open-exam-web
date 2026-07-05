import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <section>
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
    </section>
  );
};

export default DashboardPage;
