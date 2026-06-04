"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { UserMenu } from "@/components/dashboard/user-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/dashboard/resumes": "Resume Builder",
  "/dashboard/resumes/new": "Create Resume",
  "/dashboard/ats": "ATS Intelligence",
  "/dashboard/job-match": "Job Match Engine",
  "/dashboard/cover-letters": "Cover Letters",
  "/dashboard/versions": "Version Control",
  "/dashboard/coach": "AI Career Coach",
  "/dashboard/applications": "Application Tracker",
}

export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const title =
    Object.entries(titles).find(([path]) => pathname === path)?.[1] ??
    (pathname.startsWith("/dashboard/resumes/")
      ? "Resume Editor"
      : "Workspace")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">AI Resume Builder</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <UserMenu />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
