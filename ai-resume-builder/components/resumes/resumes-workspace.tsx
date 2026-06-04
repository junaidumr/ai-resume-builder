"use client"

import * as React from "react"
import Link from "next/link"
import { FileTextIcon, PlusIcon, SearchIcon } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader, PageHeaderLinkAction } from "@/components/dashboard/page-header"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { ResumeCardActions } from "@/components/resumes/resume-card-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export type ResumeListItem = {
  id: string
  title: string
  targetRole: string | null
  atsScore: number
  versionCount: number
  updatedAt: string
}

export function ResumesWorkspace({ resumes }: { resumes: ResumeListItem[] }) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<"recent" | "score" | "title">("recent")

  const filtered = resumes
    .filter((r) => {
      const q = query.toLowerCase()
      return (
        r.title.toLowerCase().includes(q) ||
        (r.targetRole?.toLowerCase().includes(q) ?? false)
      )
    })
    .sort((a, b) => {
      if (sort === "score") return b.atsScore - a.atsScore
      if (sort === "title") return a.title.localeCompare(b.title)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="Resume Builder"
          description="Manage AI-optimized resumes, track ATS scores, and open the editor for any version."
          icon={FileTextIcon}
          badge={`${resumes.length} active`}
          actions={
            <PageHeaderLinkAction href="/dashboard/resumes/new">
              <PlusIcon className="size-4" />
              New resume
            </PageHeaderLinkAction>
          }
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pt-4">
        {resumes.length > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by title or role..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["recent", "Recent"],
                  ["score", "ATS score"],
                  ["title", "Title"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={
                    sort === key
                      ? "rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {resumes.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            title="No resumes yet"
            description="Create your first resume workspace. Use AI to generate a draft or start from a blank template."
            actionLabel="Create resume"
            actionHref="/dashboard/resumes/new"
          />
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No matches for &quot;{query}&quot;</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((resume) => (
              <Card
                key={resume.id}
                className="flex flex-col border-border/80 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-snug">{resume.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0 tabular-nums">
                      v{resume.versionCount}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {resume.targetRole ?? "Set a target role"}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3">
                  <ScoreBadge score={resume.atsScore} showBar />
                  <Link
                    href={`/dashboard/resumes/${resume.id}`}
                    className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Open editor
                  </Link>
                  <ResumeCardActions resumeId={resume.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
