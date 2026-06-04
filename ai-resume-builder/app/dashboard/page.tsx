import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { requireUser } from "@/lib/auth/session"
import { getDashboardMetrics } from "@/lib/services/dashboard"

export default async function DashboardPage() {
  const user = await requireUser()
  const metrics = await getDashboardMetrics(user.id)

  return <AnalyticsDashboard metrics={metrics} />
}
