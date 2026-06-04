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
import { cn } from "@/lib/utils"

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
      <SidebarInset className="bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.12_260/0.06),transparent_50%)]">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-1 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Career OS</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <UserMenu />
        </header>
        <main className={cn("flex min-h-[calc(100svh-3.5rem)] flex-1 flex-col")}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
