"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { resumeToText, type ResumeContent } from "@/lib/types/resume"

type ResumeOption = {
  id: string
  title: string
  content: ResumeContent
}

export function JobMatchTool({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "")
  const [jobDescription, setJobDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{
    matchPercentage: number
    missingKeywords: string[]
    weakAreas: string[]
    rewriteSuggestions: string[]
  } | null>(null)

  const selected = resumes.find((r) => r.id === resumeId)

  async function runMatch() {
    if (!selected || jobDescription.length < 20) return
    setLoading(true)
    const res = await fetch("/api/jobs/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: selected.id,
        resumeText: resumeToText(selected.content),
        jobDescription,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) setResult(data.result)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">Job Match Engine</h1>
        <p className="text-sm text-muted-foreground">
          Compare your resume against a job description with semantic AI.
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
            <Label>Job description</Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <Button onClick={runMatch} disabled={loading || !resumeId}>
            {loading ? "Matching..." : "Run job match"}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Match analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {!result ? (
              <p>Results will appear here.</p>
            ) : (
              <>
                <p className="text-3xl font-medium text-foreground">
                  {result.matchPercentage}%
                </p>
                <p>
                  <strong className="text-foreground">Missing:</strong>{" "}
                  {result.missingKeywords.join(", ")}
                </p>
                <p>
                  <strong className="text-foreground">Weak areas:</strong>{" "}
                  {result.weakAreas.join(", ")}
                </p>
                <ul className="list-inside list-disc">
                  {result.rewriteSuggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
