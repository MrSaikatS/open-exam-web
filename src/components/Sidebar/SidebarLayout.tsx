"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/shadcnui/sidebar";
import { Separator } from "@/components/shadcnui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/shadcnui/dropdown-menu";
import { AppSidebar } from "./AppSidebar";
import { findMatchingNavItem, type NavGroup } from "./nav-config";
import { authClient } from "@/lib/auth-client";

const getPageTitle = (pathname: string, groups: NavGroup[]): string => {
  const allItems = groups.flatMap((g) => g.items);
  const match = findMatchingNavItem(pathname, allItems);
  if (match) return match.title;
  const normalized = pathname.replace(/\/$/, "") || "/";
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
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar size="sm">
                      <AvatarImage src={session?.user?.image ?? undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {session?.user?.name ?? "User"}
                        </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 px-1.5 py-0 text-[10px] leading-none capitalize">
                          {session?.user?.role}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground truncate text-xs">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings")}>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
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
