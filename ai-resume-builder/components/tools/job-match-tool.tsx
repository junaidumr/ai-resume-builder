"use client"

import * as React from "react"
import Link from "next/link"

import { parseApiResponse } from "@/lib/api/parse-response"
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
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{
    matchPercentage: number
    missingKeywords: string[]
    weakAreas: string[]
    rewriteSuggestions: string[]
  } | null>(null)

  const selected = resumes.find((r) => r.id === resumeId)

  async function runMatch() {
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
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selected.id,
          resumeText: resumeToText(selected.content),
          jobDescription: jobDescription.trim(),
        }),
      })
      const parsed = await parseApiResponse<{
        error?: string
        result: {
          matchPercentage: number
          missingKeywords: string[]
          weakAreas: string[]
          rewriteSuggestions: string[]
        }
        usedFallback?: boolean
      }>(res)
      setLoading(false)
      if (!parsed.ok) {
        setError(parsed.error)
        setResult(null)
        return
      }
      setResult(parsed.data.result)
      if (parsed.data.usedFallback) {
        setNotice("Used local keyword matching (OpenAI unavailable).")
      }
    } catch {
      setLoading(false)
      setError("Job match failed. Try again.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <h1 className="text-2xl font-medium">Job Match Engine</h1>
        <p className="text-sm text-muted-foreground">
          Create a resume first to compare against job descriptions.
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
        <h1 className="text-2xl font-medium">Job Match Engine</h1>
        <p className="text-sm text-muted-foreground">
          Compare your resume against a job description.
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
              placeholder="Paste the full job description (min. 20 characters)."
            />
          </div>
          <Button type="button" onClick={runMatch} disabled={loading || !resumeId}>
            {loading ? "Matching..." : "Run job match"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
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
