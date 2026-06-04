"use client"

import type { LucideIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { cn } from "@/lib/utils"

export function ToolWorkspace({
  title,
  description,
  icon,
  badge,
  steps,
  sidebar,
  children,
  className,
}: {
  title: string
  description: string
  icon: LucideIcon
  badge?: string
  steps?: { label: string; done?: boolean }[]
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <div className="px-4 pt-6 md:px-6">
        <PageHeader title={title} description={description} icon={icon} badge={badge} />
        {steps && steps.length > 0 ? (
          <ol className="mt-4 flex flex-wrap gap-2">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  step.done
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {i + 1}. {step.label}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <div className="grid flex-1 gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-6">
        <div className="space-y-4">{sidebar}</div>
        <div className="min-h-[320px]">{children}</div>
      </div>
    </div>
  )
}
