"use client"

import * as React from "react"
import Link from "next/link"

import { parseApiResponse } from "@/lib/api/parse-response"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
        result: {
          atsScore: number
          missingKeywords: string[]
          suggestions: string[]
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
        setNotice("Used local keyword heuristics (OpenAI unavailable).")
      }
    } catch {
      setLoading(false)
      setError("ATS scan failed. Try again.")
    }
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <h1 className="text-2xl font-medium">ATS Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Create a resume first, then run ATS scans here.
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
        <h1 className="text-2xl font-medium">ATS Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Scan resumes for keyword gaps and optimization opportunities.
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
            <Label>Job description (optional)</Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description for targeted ATS matching."
            />
          </div>
          <Button type="button" onClick={runScan} disabled={loading || !resumeId}>
            {loading ? "Scanning..." : "Run ATS scan"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <p className="text-sm text-muted-foreground">Run a scan to see results.</p>
            ) : (
              <>
                <p className="text-3xl font-medium">{result.atsScore}%</p>
                <div>
                  <p className="mb-2 text-sm font-medium">Missing keywords</p>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {result.missingKeywords.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Suggestions</p>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {result.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
