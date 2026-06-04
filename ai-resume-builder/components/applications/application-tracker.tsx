"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { parseApiResponse } from "@/lib/api/parse-response"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Application = {
  id: string
  company: string
  title: string
  description: string | null
  status: string
  matchScore: number | null
}

const statuses = ["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "OFFER"] as const

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
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">Application Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track applications, statuses, and follow-up momentum.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add application</CardTitle>
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
            {loading ? "Saving..." : "Add application"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications tracked yet.</p>
        ) : (
          applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {app.title} · {app.company}
                  </p>
                  {app.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {app.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{app.status}</Badge>
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
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
