"use client";

import { usePathname, useRouter } from "next/navigation";
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

const getPageTitle = (pathname: string, groups: NavGroup[]): string => {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const allItems = groups.flatMap((g) => g.items);
  for (const item of allItems) {
    if (item.notActiveFor?.includes(normalized)) continue;
    if (normalized === item.url) return item.title;
    if (item.exact) continue;
    if (normalized.startsWith(item.url + "/")) return item.title;
  }
  const segments = normalized.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last ?
      last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Dashboard";
};

const SidebarLayout = ({
  groups,
  children,
}: {
  groups: NavGroup[];
  children: React.ReactNode;
}) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname, groups);

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
          <span className="truncate font-medium">{pageTitle}</span>
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
