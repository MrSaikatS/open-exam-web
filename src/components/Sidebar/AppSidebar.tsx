"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  BookOpenIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/shadcnui/sidebar";
import { Separator } from "@/components/shadcnui/separator";
import type { NavGroup, NavItem } from "./nav-config";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  FileText: FileTextIcon,
  PlusCircle: PlusCircleIcon,
  Users: UsersIcon,
  BarChart3: BarChart3Icon,
  BookOpen: BookOpenIcon,
};

const AppSidebar = ({ groups }: { groups: NavGroup[] }) => {
  const pathname = usePathname().replace(/\/$/, "") || "/";

  const isActive = (item: NavItem) => {
    if (item.notActiveFor?.includes(pathname)) return false;
    if (pathname === item.url) return true;
    if (item.exact) return false;
    return pathname.startsWith(item.url + "/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-xl">
                <GraduationCapIcon />
              </div>
              <span className="font-heading truncate font-semibold">
                OpenExam
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<a href={item.url} />}
                        isActive={isActive(item)}
                        tooltip={item.title}>
                        {Icon && <Icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <p className="text-sidebar-foreground/50 truncate px-2 text-xs group-data-[collapsible=icon]:hidden">
          OpenExam v1.0
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
