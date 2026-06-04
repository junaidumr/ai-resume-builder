"use client"

import Link from "next/link"
import { HistoryIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { VersionRestoreButton } from "@/components/versions/version-restore-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/dashboard/empty-state"

export type VersionItem = {
  id: string
  version: number
  label: string
  template: string
  atsScore: number
  changeSummary: string | null
  createdAt: string
  resume: { id: string; title: string }
}

export function VersionsTimeline({ versions }: { versions: VersionItem[] }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="Version Control"
          description="Audit every resume revision, compare ATS impact, preview history, and restore any snapshot."
          icon={HistoryIcon}
          badge={`${versions.length} snapshots`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 md:pt-4">
        {versions.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No versions yet"
            description="Each save, AI improve, or ATS scan can create a new version. Start in the resume editor."
            actionLabel="Create resume"
            actionHref="/dashboard/resumes/new"
          />
        ) : (
          <div className="relative space-y-0">
            <div className="absolute top-2 bottom-2 left-[1.125rem] w-px bg-border md:left-[1.375rem]" />
            {versions.map((version, index) => (
              <div key={version.id} className="relative flex gap-4 pb-8">
                <span className="relative z-10 mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {version.version}
                </span>
                <Card className="flex-1 border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/resumes/${version.resume.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {version.resume.title}
                        </Link>
                        <p className="mt-0.5 text-sm text-muted-foreground">{version.label}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{version.template}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 max-w-[200px]">
                      <ScoreBadge score={version.atsScore} showBar />
                    </div>
                    {version.changeSummary ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {version.changeSummary}
                      </p>
                    ) : null}
                    <VersionRestoreButton
                      resumeId={version.resume.id}
                      versionId={version.id}
                      versionNumber={version.version}
                    />
                    {index === 0 ? (
                      <p className="mt-2 text-xs font-medium text-primary">Latest for this resume</p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
