import { ProfileSettings } from "@/components/Profile/ProfileSettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

const SettingsPage = () => (
  <section className="mx-auto w-full max-w-2xl">
    <div className="mb-8">
      <h1 className="text-2xl font-medium">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and change your password
      </p>
    </div>
    <ProfileSettings />
  </section>
);

export default SettingsPage;
