"use client"

import * as React from "react"
import Link from "next/link"

import { parseApiResponse } from "@/lib/api/parse-response"
import { Button } from "@/components/ui/button"
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
      if (parsed.data.usedFallback) {
        setNotice("Used template generator (OpenAI unavailable).")
      }
    } catch {
      setLoading(false)
      setError("Cover letter generation failed.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <h1 className="text-2xl font-medium">Cover Letter Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create a resume first to generate tailored cover letters.
        </p>
        <Button asChild>
          <Link href="/dashboard/resumes/new">Create resume</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">Cover Letter Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate tailored cover letters with tone control.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
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
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description (min. 20 characters)."
            />
          </div>
          <Button type="button" onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate cover letter"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Live preview</Label>
          <Textarea
            className="min-h-80"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
