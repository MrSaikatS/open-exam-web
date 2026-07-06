"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/shadcnui/sidebar";
import { Separator } from "@/components/shadcnui/separator";
import { Avatar, AvatarFallback } from "@/components/shadcnui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/shadcnui/dropdown-menu";
import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./nav-config";
import { authClient } from "@/lib/auth-client";

const SidebarLayout = ({
  groups,
  children,
}: {
  groups: NavGroup[];
  children: React.ReactNode;
}) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const initials = session?.user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <SidebarProvider>
      <AppSidebar groups={groups} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="h-6"
          />
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar
                  size="sm"
                  className="cursor-pointer">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSignOut}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export { SidebarLayout };
