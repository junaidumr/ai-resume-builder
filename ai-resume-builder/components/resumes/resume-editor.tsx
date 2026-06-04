"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { parseApiResponse } from "@/lib/api/parse-response"
import { ensureRawExperience } from "@/lib/ai/fallbacks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeContent } from "@/lib/types/resume"

export function ResumeEditor({
  resumeId,
  initialTitle,
  initialTargetRole,
  initialContent,
  viewingVersion,
  viewingVersionLabel,
}: {
  resumeId: string
  initialTitle: string
  initialTargetRole?: string | null
  initialContent: ResumeContent
  viewingVersion?: number
  viewingVersionLabel?: string
}) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialTitle)
  const [targetRole, setTargetRole] = React.useState(initialTargetRole ?? "")
  const [content, setContent] = React.useState(initialContent)
  const [saving, setSaving] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [atsRunning, setAtsRunning] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [isError, setIsError] = React.useState(false)

  function showMessage(text: string, error = false) {
    setMessage(text)
    setIsError(error)
  }

  async function save() {
    const resolvedTitle = title.trim().length >= 2 ? title.trim() : "Untitled Resume"
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resolvedTitle,
          targetRole: targetRole.trim() || undefined,
          content,
        }),
      })
      const parsed = await parseApiResponse<{ error?: string }>(res)
      if (!parsed.ok) {
        showMessage(parsed.error, true)
        return
      }
      setTitle(resolvedTitle)
      showMessage("Resume saved")
      router.refresh()
    } catch {
      showMessage("Failed to save resume", true)
    } finally {
      setSaving(false)
    }
  }

  async function generateWithAi() {
    setGenerating(true)
    setMessage(null)
    const role = targetRole.trim() || "Software Engineer"
    const bullets = content.experience.flatMap((e) => e.bullets)
    const rawExperience = ensureRawExperience(
      [content.summary ?? "", ...bullets].filter(Boolean).join("\n"),
      role
    )

    try {
      const res = await fetch(`/api/resumes/${resumeId}/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: role,
          seniority: "Mid",
          industry: "Technology",
          rawExperience,
          jobDescription: "",
        }),
      })
      const parsed = await parseApiResponse<{
        error?: string
        content?: ResumeContent
        version?: { version: number; atsScore: number }
        usedFallback?: boolean
      }>(res)

      if (!parsed.ok) {
        showMessage(parsed.error, true)
        return
      }

      if (parsed.data.content) {
        setContent(parsed.data.content)
      }

      const note = parsed.data.usedFallback
        ? " (local draft — add OpenAI credits for full AI)"
        : ""
      showMessage(
        `Created version ${parsed.data.version?.version ?? ""} · ATS ${parsed.data.version?.atsScore ?? 0}%${note}`
      )
      router.refresh()
    } catch {
      showMessage("AI improve failed", true)
    } finally {
      setGenerating(false)
    }
  }

  async function runAts() {
    setAtsRunning(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ats`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const parsed = await parseApiResponse<{
        error?: string
        result?: { atsScore: number }
        usedFallback?: boolean
      }>(res)

      if (!parsed.ok) {
        showMessage(parsed.error, true)
        return
      }

      const note = parsed.data.usedFallback ? " (heuristic scan)" : ""
      showMessage(`ATS score: ${parsed.data.result?.atsScore ?? 0}%${note}`)
      router.refresh()
    } catch {
      showMessage("ATS scan failed", true)
    } finally {
      setAtsRunning(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Resume Editor</h1>
          <p className="text-sm text-muted-foreground">
            Edit content, generate with AI, and run ATS scans.
          </p>
          {viewingVersion ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Viewing version {viewingVersion}
              {viewingVersionLabel ? ` · ${viewingVersionLabel}` : ""}. Save to keep edits on
              the latest version.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={runAts} disabled={atsRunning}>
            {atsRunning ? "Scanning..." : "Run ATS scan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={generateWithAi}
            disabled={generating}
          >
            {generating ? "Generating..." : "AI improve"}
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {message ? (
        <p
          className={
            isError
              ? "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-lg border bg-muted/40 px-3 py-2 text-sm"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Target role</Label>
          <Input
            id="role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Professional summary</Label>
        <Textarea
          id="summary"
          value={content.summary ?? ""}
          onChange={(e) => setContent({ ...content, summary: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          value={content.skills.join(", ")}
          onChange={(e) =>
            setContent({
              ...content,
              skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience bullets (one per line)</Label>
        <Textarea
          id="experience"
          value={content.experience[0]?.bullets.join("\n") ?? ""}
          onChange={(e) =>
            setContent({
              ...content,
              experience: [
                {
                  company: content.experience[0]?.company ?? "Company",
                  title: content.experience[0]?.title ?? (targetRole || "Role"),
                  bullets: e.target.value.split("\n").filter(Boolean),
                },
              ],
            })
          }
        />
      </div>
    </div>
  )
}
