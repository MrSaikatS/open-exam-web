import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";
import { headers } from "next/headers";
import { SidebarLayout } from "@/components/Sidebar/SidebarLayout";
import {
  adminNav,
  examinerNav,
  proctorNav,
  studentNav,
} from "@/components/Sidebar/nav-config";

const SettingsLayout = ({ children }: LayoutProps) => (
  <Suspense fallback={null}>
    <SettingsGate>{children}</SettingsGate>
  </Suspense>
);

const SettingsGate = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const role = session?.user?.role ?? "student";
  const nav =
    role === "admin" ? adminNav
    : role === "examiner" ? examinerNav
    : role === "proctor" ? proctorNav
    : studentNav;

  return <SidebarLayout groups={nav}>{children}</SidebarLayout>;
};

export default SettingsLayout;
