"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BotIcon,
  BriefcaseBusinessIcon,
  FileTextIcon,
  GaugeIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MailIcon,
  PlusIcon,
  SearchCheckIcon,
  SparklesIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navItems = [
  { title: "Command Center", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Resume Builder", href: "/dashboard/resumes", icon: FileTextIcon },
  { title: "ATS Intelligence", href: "/dashboard/ats", icon: SearchCheckIcon },
  { title: "Job Match", href: "/dashboard/job-match", icon: GaugeIcon },
  { title: "Cover Letters", href: "/dashboard/cover-letters", icon: MailIcon },
  { title: "Versions", href: "/dashboard/versions", icon: HistoryIcon },
  { title: "Career Coach", href: "/dashboard/coach", icon: BotIcon },
  { title: "Applications", href: "/dashboard/applications", icon: BriefcaseBusinessIcon },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <SparklesIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">AI Resume Builder</span>
                  <span className="text-xs text-sidebar-foreground/70">Career OS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(pathname, item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <Button asChild className="w-full justify-start" size="sm">
          <Link href="/dashboard/resumes/new">
            <PlusIcon />
            New resume
          </Link>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
