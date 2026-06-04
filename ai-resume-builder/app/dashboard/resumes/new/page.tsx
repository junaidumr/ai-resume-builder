"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileTextIcon, SparklesIcon, Wand2Icon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { ensureRawExperience } from "@/lib/ai/fallbacks"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CreateResumeResponse = { resume: { id: string } }
type AiResumeResponse = { resume: { id: string }; usedFallback?: boolean }

export default function NewResumePage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<"ai" | "blank">("ai")
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
      const parsed = await parseApiResponse<CreateResumeResponse & { error?: string }>(res)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      router.push(`/dashboard/resumes/${parsed.data.resume.id}`)
    } catch {
      setError("Could not create resume.")
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
      const parsed = await parseApiResponse<AiResumeResponse & { error?: string }>(res)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      if (parsed.data.usedFallback) {
        setNotice("Draft created with built-in AI (add OpenAI credits for full generation).")
      }
      router.push(`/dashboard/resumes/${parsed.data.resume.id}`)
    } catch {
      setError("Could not generate resume.")
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="Create resume"
          description="Start from a blank canvas or let AI draft a job-ready resume from your notes."
          icon={FileTextIcon}
          badge="New workspace"
        />
      </div>

      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-6 p-4 md:p-6 md:pt-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("ai")}
              className={
                mode === "ai"
                  ? "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm font-medium"
                  : "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-muted-foreground"
              }
            >
              <SparklesIcon className="size-4" />
              AI draft
            </button>
            <button
              type="button"
              onClick={() => setMode("blank")}
              className={
                mode === "blank"
                  ? "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm font-medium"
                  : "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-muted-foreground"
              }
            >
              <FileTextIcon className="size-4" />
              Blank
            </button>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Resume details</CardTitle>
              <CardDescription>
                {mode === "ai"
                  ? "Short skill lists work — we expand them into full bullets."
                  : "You can fill in content in the editor after creating."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Frontend Engineer 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Target role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              {mode === "ai" ? (
                <div className="space-y-2">
                  <Label htmlFor="summary">Background / experience notes</Label>
                  <Textarea
                    id="summary"
                    className="min-h-28"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="HTML, CSS, React, 3 years building dashboards..."
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2">
                {mode === "ai" ? (
                  <Button type="button" onClick={createWithAi} disabled={aiLoading || loading}>
                    <Wand2Icon />
                    {aiLoading ? "Generating..." : "Generate with AI"}
                  </Button>
                ) : (
                  <Button type="button" onClick={createManual} disabled={loading || aiLoading}>
                    {loading ? "Creating..." : "Create blank resume"}
                  </Button>
                )}
                {mode === "ai" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={createManual}
                    disabled={loading || aiLoading}
                  >
                    Start blank instead
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="border-border/80 bg-muted/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Use a specific title per role you are targeting.</p>
              <p>• Paste a job description later in ATS or Job Match.</p>
              <p>• Version Control saves every AI improvement.</p>
              <Badge variant="outline" className="mt-2">
                Pro workflow
              </Badge>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
