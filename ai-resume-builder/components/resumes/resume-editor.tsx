"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

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
}: {
  resumeId: string
  initialTitle: string
  initialTargetRole?: string | null
  initialContent: ResumeContent
}) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialTitle)
  const [targetRole, setTargetRole] = React.useState(initialTargetRole ?? "")
  const [content, setContent] = React.useState(initialContent)
  const [saving, setSaving] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [atsRunning, setAtsRunning] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function save() {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetRole, content }),
    })
    setSaving(false)
    if (!res.ok) {
      setMessage("Failed to save resume")
      return
    }
    setMessage("Resume saved")
    router.refresh()
  }

  async function generateWithAi() {
    setGenerating(true)
    setMessage(null)
    const res = await fetch(`/api/resumes/${resumeId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole: targetRole || "Software Engineer",
        seniority: "Mid",
        industry: "Technology",
        rawExperience: `${content.summary}\n${content.experience
          .map((e) => e.bullets.join("\n"))
          .join("\n")}`,
        jobDescription: "",
      }),
    })
    setGenerating(false)
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? "AI generation failed")
      return
    }
    setMessage(`AI generated version ${data.version.version} · ATS ${data.version.atsScore}%`)
    router.refresh()
  }

  async function runAts() {
    setAtsRunning(true)
    setMessage(null)
    const res = await fetch(`/api/resumes/${resumeId}/ats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    setAtsRunning(false)
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? "ATS scan failed")
      return
    }
    setMessage(`ATS score: ${data.result.atsScore}%`)
    router.refresh()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Resume Editor</h1>
          <p className="text-sm text-muted-foreground">
            Edit content, generate with AI, and run ATS scans.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={runAts} disabled={atsRunning}>
            {atsRunning ? "Scanning..." : "Run ATS scan"}
          </Button>
          <Button variant="outline" onClick={generateWithAi} disabled={generating}>
            {generating ? "Generating..." : "AI improve"}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">{message}</p>
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
          value={
            content.experience[0]?.bullets.join("\n") ??
            ""
          }
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
