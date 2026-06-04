import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireUser } from "@/lib/auth/session"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return <DashboardShell>{children}</DashboardShell>
}
