"use client"

import * as React from "react"
import { GaugeIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ToolWorkspace } from "@/components/dashboard/tool-workspace"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { resumeToText, type ResumeContent } from "@/lib/types/resume"

type ResumeOption = { id: string; title: string; content: ResumeContent }

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
      if (parsed.data.usedFallback) setNotice("Local keyword match (OpenAI unavailable).")
    } catch {
      setLoading(false)
      setError("Job match failed.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={GaugeIcon}
          title="No resumes"
          description="Create a resume to compare against job descriptions."
          actionLabel="Create resume"
          actionHref="/dashboard/resumes/new"
        />
      </div>
    )
  }

  return (
    <ToolWorkspace
      title="Job Match Engine"
      description="Semantic alignment between your resume and a target job description."
      icon={GaugeIcon}
      badge="Match AI"
      steps={[
        { label: "Resume", done: !!resumeId },
        { label: "Job description", done: jobDescription.length >= 20 },
        { label: "Analyze", done: !!result },
      ]}
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
              <Label>Job description</Label>
              <Textarea
                className="min-h-40"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting..."
              />
            </div>
            <Button type="button" className="w-full" onClick={runMatch} disabled={loading}>
              {loading ? "Analyzing..." : "Run job match"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
          </CardContent>
        </Card>
      }
    >
      <Card className="h-full border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Match report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!result ? (
            <p className="text-sm text-muted-foreground">Results appear after analysis.</p>
          ) : (
            <>
              <div>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-semibold tabular-nums">
                    {result.matchPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">overall match</span>
                </div>
                <Progress value={result.matchPercentage} className="mt-3 h-2" />
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium">Missing keywords</p>
                <p className="mt-1 text-muted-foreground">{result.missingKeywords.join(", ")}</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium">Weak areas</p>
                <p className="mt-1 text-muted-foreground">{result.weakAreas.join(", ")}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {result.rewriteSuggestions.map((s) => (
                  <li key={s} className="rounded-lg border px-3 py-2">
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </ToolWorkspace>
  )
}
