import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const PrivateLayout = ({ children }: LayoutProps) => (
  <AuthGate>
    <Suspense fallback={null}>{children}</Suspense>
  </AuthGate>
);

const AuthGate = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return <>{children}</>;
};

export default PrivateLayout;
