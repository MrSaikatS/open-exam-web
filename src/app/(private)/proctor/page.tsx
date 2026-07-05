import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ProctorDashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section>
      <h1 className="text-2xl font-medium">Proctor Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {session?.user.name}
      </p>
    </section>
  );
};

export default ProctorDashboard;
