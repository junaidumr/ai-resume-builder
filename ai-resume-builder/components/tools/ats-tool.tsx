"use client"

import * as React from "react"
import Link from "next/link"
import { SearchCheckIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ToolWorkspace } from "@/components/dashboard/tool-workspace"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type ResumeOption = { id: string; title: string }

export function AtsTool({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = React.useState(resumes[0]?.id ?? "")
  const [jobDescription, setJobDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{
    atsScore: number
    missingKeywords: string[]
    suggestions: string[]
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  async function runScan() {
    if (!resumeId) {
      setError("Create a resume first.")
      return
    }
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ats`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      })
      const parsed = await parseApiResponse<{
        error?: string
        result: { atsScore: number; missingKeywords: string[]; suggestions: string[] }
        usedFallback?: boolean
      }>(res)
      setLoading(false)
      if (!parsed.ok) {
        setError(parsed.error)
        setResult(null)
        return
      }
      setResult(parsed.data.result)
      if (parsed.data.usedFallback) setNotice("Heuristic scan (OpenAI unavailable).")
    } catch {
      setLoading(false)
      setError("ATS scan failed.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={SearchCheckIcon}
          title="No resumes to scan"
          description="Create a resume, then run ATS intelligence against job descriptions."
          actionLabel="Create resume"
          actionHref="/dashboard/resumes/new"
        />
      </div>
    )
  }

  return (
    <ToolWorkspace
      title="ATS Intelligence"
      description="Deep keyword analysis, formatting signals, and optimization paths for applicant tracking systems."
      icon={SearchCheckIcon}
      badge="Scanner"
      steps={[
        { label: "Select resume", done: !!resumeId },
        { label: "Add JD (optional)", done: jobDescription.length > 0 },
        { label: "Run scan", done: !!result },
      ]}
      sidebar={
        <>
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
                <Label>Job description (optional)</Label>
                <Textarea
                  className="min-h-36"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job posting for targeted keyword matching..."
                />
              </div>
              <Button type="button" className="w-full" onClick={runScan} disabled={loading}>
                {loading ? "Scanning..." : "Run ATS scan"}
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
            </CardContent>
          </Card>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/dashboard/resumes/${resumeId}`}>Open in editor</Link>
          </Button>
        </>
      }
    >
      <Card className="h-full border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Analysis report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <p className="text-sm text-muted-foreground">
              Configure inputs and run a scan to see ATS score, gaps, and recommendations.
            </p>
          ) : (
            <>
              <ScoreBadge score={result.atsScore} showBar />
              <div>
                <p className="mb-2 text-sm font-medium">Missing keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Recommendations</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.suggestions.map((s) => (
                    <li key={s} className="rounded-lg border bg-muted/20 px-3 py-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ToolWorkspace>
  )
}
