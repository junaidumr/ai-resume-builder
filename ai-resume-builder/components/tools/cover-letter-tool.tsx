"use client"

import * as React from "react"
import { MailIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ToolWorkspace } from "@/components/dashboard/tool-workspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { resumeToText, type ResumeContent } from "@/lib/types/resume"

type ResumeOption = { id: string; title: string; content: ResumeContent }

const tones = ["Professional", "Startup", "Corporate", "Creative"] as const

export function CoverLetterTool({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "")
  const [jobDescription, setJobDescription] = React.useState("")
  const [tone, setTone] = React.useState<(typeof tones)[number]>("Professional")
  const [letter, setLetter] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const selected = resumes.find((r) => r.id === resumeId)

  async function generate() {
    if (!selected) {
      setError("Select a resume.")
      return
    }
    if (jobDescription.trim().length < 20) {
      setError("Job description must be at least 20 characters.")
      return
    }
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selected.id,
          resumeText: resumeToText(selected.content),
          jobDescription: jobDescription.trim(),
          tone,
        }),
      })
      const parsed = await parseApiResponse<{
        error?: string
        letter: string
        usedFallback?: boolean
      }>(res)
      setLoading(false)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setLetter(parsed.data.letter)
      if (parsed.data.usedFallback) setNotice("Template letter (OpenAI unavailable).")
    } catch {
      setLoading(false)
      setError("Generation failed.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MailIcon}
          title="No resumes"
          description="Create a resume to generate tailored cover letters."
          actionLabel="Create resume"
          actionHref="/dashboard/resumes/new"
        />
      </div>
    )
  }

  return (
    <ToolWorkspace
      title="Cover Letter Generator"
      description="Role-specific letters with tone control — professional, startup, corporate, or creative."
      icon={MailIcon}
      badge="Writer"
      sidebar={
        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-4 pt-4">
            <div className="space-y-2">
              <Label>Resume</Label>
              <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={tone}
                onChange={(e) => setTone(e.target.value as (typeof tones)[number])}
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job description</Label>
              <Textarea
                className="min-h-32"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            <Button type="button" className="w-full" onClick={generate} disabled={loading}>
              {loading ? "Writing..." : "Generate letter"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
          </CardContent>
        </Card>
      }
    >
      <Card className="h-full border-border/80 shadow-sm">
        <CardContent className="p-4 pt-4">
          <Label>Editor — copy and customize</Label>
          <Textarea
            className="mt-2 min-h-[420px] font-mono text-sm leading-relaxed"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Your cover letter will appear here..."
          />
        </CardContent>
      </Card>
    </ToolWorkspace>
  )
}
