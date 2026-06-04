"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BriefcaseBusinessIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

type Application = {
  id: string
  company: string
  title: string
  description: string | null
  status: string
  matchScore: number | null
}

const statuses = ["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "OFFER"] as const

const statusColors: Record<string, string> = {
  APPLIED: "border-blue-500/30 bg-blue-500/10",
  SHORTLISTED: "border-violet-500/30 bg-violet-500/10",
  INTERVIEW: "border-amber-500/30 bg-amber-500/10",
  OFFER: "border-emerald-500/30 bg-emerald-500/10",
  REJECTED: "border-border bg-muted/30",
}

export function ApplicationTracker({
  initialApplications,
}: {
  initialApplications: Application[]
}) {
  const router = useRouter()
  const [applications, setApplications] = React.useState(initialApplications)
  const [company, setCompany] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const counts = statuses.reduce(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length
      return acc
    },
    {} as Record<string, number>
  )

  const interviewRate =
    applications.length > 0
      ? Math.round(
          ((counts.INTERVIEW + counts.OFFER) / applications.length) * 100
        )
      : 0

  async function refreshList() {
    const listRes = await fetch("/api/applications", { credentials: "include" })
    const listParsed = await parseApiResponse<{ applications: Application[] }>(listRes)
    if (listParsed.ok) setApplications(listParsed.data.applications)
  }

  async function createApplication() {
    if (!company.trim() || !title.trim()) {
      setError("Company and role are required.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          status: "APPLIED",
        }),
      })
      const parsed = await parseApiResponse(res)
      setLoading(false)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setCompany("")
      setTitle("")
      setDescription("")
      await refreshList()
      router.refresh()
    } catch {
      setLoading(false)
      setError("Could not add application.")
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const parsed = await parseApiResponse(res)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    )
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Remove this application?")) return
    const res = await fetch(`/api/applications/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    const parsed = await parseApiResponse(res)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setApplications((prev) => prev.filter((app) => app.id !== id))
    router.refresh()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="Application Tracker"
          description="Manage your job search pipeline from first application through offer."
          icon={BriefcaseBusinessIcon}
          badge={`${applications.length} total`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active pipeline"
            value={String(applications.length)}
            meta="Total tracked roles"
            icon={BriefcaseBusinessIcon}
          />
          <StatCard
            label="Interviews"
            value={String(counts.INTERVIEW + counts.OFFER)}
            meta="Interview + offer stages"
            icon={BriefcaseBusinessIcon}
          />
          <StatCard
            label="Offers"
            value={String(counts.OFFER)}
            meta="Accepted pipeline outcomes"
            icon={BriefcaseBusinessIcon}
          />
          <StatCard
            label="Conversion"
            value={`${interviewRate}%`}
            meta="Interview rate"
            icon={BriefcaseBusinessIcon}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          {statuses.map((s) => (
            <div key={s} className="rounded-lg border bg-card p-3 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{counts[s]}</p>
            </div>
          ))}
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes / job description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button
              type="button"
              onClick={createApplication}
              disabled={loading || !company.trim() || !title.trim()}
            >
              {loading ? "Saving..." : "Add to pipeline"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {applications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No applications yet. Add your first role above.
            </p>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="border-border/80 shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{app.title}</p>
                      <span className="text-muted-foreground">·</span>
                      <p className="text-muted-foreground">{app.company}</p>
                      <Badge
                        variant="outline"
                        className={statusColors[app.status] ?? ""}
                      >
                        {app.status}
                      </Badge>
                    </div>
                    {app.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {app.description}
                      </p>
                    ) : null}
                    {app.matchScore != null ? (
                      <div className="mt-3 max-w-xs">
                        <Progress value={app.matchScore} className="h-1.5" />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Match {app.matchScore}%
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(app.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
