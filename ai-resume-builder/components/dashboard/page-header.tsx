import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  className,
}: {
  title: string
  description: string
  badge?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/60 bg-gradient-to-r from-muted/30 via-background to-background pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex gap-4">
        {Icon ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-card shadow-sm">
            <Icon className="size-5 text-primary" />
          </div>
        ) : null}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {badge ? <Badge variant="outline">{badge}</Badge> : null}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function PageHeaderLinkAction({
  href,
  children,
  variant = "default",
}: {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline"
}) {
  return (
    <Button asChild variant={variant}>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
