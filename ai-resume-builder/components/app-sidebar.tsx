"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BotIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  ChartNoAxesCombinedIcon,
  FileTextIcon,
  HistoryIcon,
  LockKeyholeIcon,
  SearchCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Workspace",
    items: [{ title: "Command Center", href: "/dashboard" }],
  },
  {
    title: "AI Resume Suite",
    items: [
      { title: "Resume Builder", href: "/dashboard/resumes" },
      { title: "ATS Intelligence", href: "/dashboard/ats" },
      { title: "Job Match Engine", href: "/dashboard/job-match" },
      { title: "Cover Letters", href: "/dashboard/cover-letters" },
      { title: "Version Control", href: "/dashboard/versions" },
    ],
  },
  {
    title: "Career OS",
    items: [
      { title: "AI Career Coach", href: "/dashboard/coach" },
      { title: "Application Tracker", href: "/dashboard/applications" },
    ],
  },
]

const disabledItems = [
  { title: "LinkedIn Optimizer", icon: ChartNoAxesCombinedIcon },
  { title: "Recruiter Portal", icon: UsersIcon },
  { title: "Organizations", icon: Building2Icon },
  { title: "RBAC", icon: LockKeyholeIcon },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <SparklesIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">AI Resume Builder</span>
                  <span>Career OS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((group) => (
              <SidebarMenuItem key={group.title}>
                <SidebarMenuButton className="font-medium pointer-events-none opacity-70">
                  {group.title}
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {group.items.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(pathname, item.href)}
                      >
                        <Link href={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
          <SidebarMenu>
            {disabledItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton className="opacity-50" disabled>
                  <item.icon />
                  {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Quick access</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(pathname, "/dashboard/resumes")}>
                <Link href="/dashboard/resumes">
                  <FileTextIcon />
                  Builder
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(pathname, "/dashboard/ats")}>
                <Link href="/dashboard/ats">
                  <SearchCheckIcon />
                  ATS
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(pathname, "/dashboard/applications")}>
                <Link href="/dashboard/applications">
                  <BriefcaseBusinessIcon />
                  Jobs
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(pathname, "/dashboard/coach")}>
                <Link href="/dashboard/coach">
                  <BotIcon />
                  Coach
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(pathname, "/dashboard/versions")}>
                <Link href="/dashboard/versions">
                  <HistoryIcon />
                  Versions
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
