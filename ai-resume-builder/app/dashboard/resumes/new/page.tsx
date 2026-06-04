"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { parseApiResponse } from "@/lib/api/parse-response"
import { ensureRawExperience } from "@/lib/ai/fallbacks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CreateResumeResponse = { resume: { id: string } }
type AiResumeResponse = {
  resume: { id: string }
  usedFallback?: boolean
}

export default function NewResumePage() {
  const router = useRouter()
  const [title, setTitle] = React.useState("")
  const [targetRole, setTargetRole] = React.useState("")
  const [summary, setSummary] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  function resolveTitle() {
    const trimmed = title.trim()
    return trimmed.length >= 2 ? trimmed : "Untitled Resume"
  }

  async function createManual() {
    setLoading(true)
    setError(null)
    setNotice(null)

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resolveTitle(),
          targetRole: targetRole.trim() || undefined,
          content: {
            personal: {},
            summary: summary.trim(),
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
          },
        }),
      })

      const parsed = await parseApiResponse<CreateResumeResponse & { error?: string }>(
        res
      )
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }

      router.push(`/dashboard/resumes/${parsed.data.resume.id}`)
    } catch {
      setError("Could not create resume. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  async function createWithAi() {
    const role = targetRole.trim() || "Software Engineer"
    if (role.length < 2) {
      setError("Target role must be at least 2 characters.")
      return
    }

    setAiLoading(true)
    setError(null)
    setNotice(null)

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: role,
          seniority: "Mid",
          industry: "Technology",
          rawExperience: ensureRawExperience(summary.trim(), role),
        }),
      })

      const parsed = await parseApiResponse<AiResumeResponse & { error?: string }>(
        res
      )
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }

      if (parsed.data.usedFallback) {
        setNotice(
          "Created a draft resume using the built-in generator (OpenAI quota unavailable). You can edit it in the editor."
        )
      }

      router.push(`/dashboard/resumes/${parsed.data.resume.id}`)
    } catch {
      setError("Could not generate resume. Check your connection and try again.")
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">Create resume</h1>
        <p className="text-sm text-muted-foreground">
          Start blank or generate a job-ready draft with AI.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {notice}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Resume title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Target role</Label>
        <Input id="role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Background / experience notes</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Optional: skills, projects, or bullets (e.g. HTML, CSS, React). Short notes work — we build a full draft."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={createManual} disabled={loading || aiLoading}>
          {loading ? "Creating..." : "Create blank resume"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={createWithAi}
          disabled={loading || aiLoading}
        >
          {aiLoading ? "Generating..." : "Generate with AI"}
        </Button>
      </div>
    </div>
  )
}
