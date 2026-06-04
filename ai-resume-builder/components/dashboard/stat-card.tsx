import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  trend,
  className,
}: {
  label: string
  value: string
  meta: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-sm", className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/5">
          <Icon className="size-4 text-primary" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-emerald-600 dark:text-emerald-400",
            trend === "down" && "text-amber-600 dark:text-amber-400",
            !trend && "text-muted-foreground"
          )}
        >
          {meta}
        </p>
      </CardContent>
    </Card>
  )
}
