"use client"

import * as React from "react"

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

  const selected = resumes.find((r) => r.id === resumeId)

  async function generate() {
    if (!selected) return
    setLoading(true)
    const res = await fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: selected.id,
        resumeText: resumeToText(selected.content),
        jobDescription,
        tone,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) setLetter(data.letter)
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
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate cover letter"}
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Live preview</Label>
          <Textarea className="min-h-80" value={letter} onChange={(e) => setLetter(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
