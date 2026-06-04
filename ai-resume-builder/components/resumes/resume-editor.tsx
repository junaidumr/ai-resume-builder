"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SparklesIcon, GaugeIcon, SaveIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { ensureRawExperience } from "@/lib/ai/fallbacks"
import { PageHeader } from "@/components/dashboard/page-header"
import { ResumePreview } from "@/components/resumes/resume-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeContent } from "@/lib/types/resume"

const sections = ["Profile", "Summary", "Experience", "Skills", "Education"] as const

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
  const [activeSection, setActiveSection] = React.useState<(typeof sections)[number]>("Profile")
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
      showMessage("Resume saved successfully")
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

      if (parsed.data.content) setContent(parsed.data.content)
      const note = parsed.data.usedFallback ? " (local draft)" : ""
      showMessage(
        `Version ${parsed.data.version?.version ?? ""} created · ATS ${parsed.data.version?.atsScore ?? 0}%${note}`
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
      showMessage(
        `ATS score: ${parsed.data.result?.atsScore ?? 0}%${parsed.data.usedFallback ? " (heuristic)" : ""}`
      )
      router.refresh()
    } catch {
      showMessage("ATS scan failed", true)
    } finally {
      setAtsRunning(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title={title}
          description="Edit sections, preview your document, and run AI optimization."
          badge={viewingVersion ? `Viewing v${viewingVersion}` : "Editor"}
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={runAts} disabled={atsRunning}>
                <GaugeIcon />
                {atsRunning ? "Scanning..." : "ATS scan"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={generateWithAi} disabled={generating}>
                <SparklesIcon />
                {generating ? "Improving..." : "AI improve"}
              </Button>
              <Button type="button" size="sm" onClick={save} disabled={saving}>
                <SaveIcon />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          }
        />
        {viewingVersionLabel ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {viewingVersionLabel} — save to apply edits to the latest version.
          </p>
        ) : null}
      </div>

      <div className="grid flex-1 gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:p-6 lg:pt-4">
        <div className="flex flex-col gap-4">
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

          <div className="flex flex-wrap gap-1.5">
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSection(s)}
                className={
                  activeSection === s
                    ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
                }
              >
                {s}
              </button>
            ))}
          </div>

          <Card className="border-border/80 shadow-sm">
            <CardContent className="space-y-4 p-4 pt-4">
              {activeSection === "Profile" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Document title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Target role</Label>
                      <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full name</Label>
                      <Input
                        value={content.personal.fullName ?? ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            personal: { ...content.personal, fullName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={content.personal.email ?? ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            personal: { ...content.personal, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={content.personal.phone ?? ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            personal: { ...content.personal, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={content.personal.location ?? ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            personal: { ...content.personal, location: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === "Summary" && (
                <div className="space-y-2">
                  <Label>Professional summary</Label>
                  <Textarea
                    className="min-h-32"
                    value={content.summary ?? ""}
                    onChange={(e) => setContent({ ...content, summary: e.target.value })}
                  />
                </div>
              )}

              {activeSection === "Experience" && (
                <div className="space-y-2">
                  <Label>Experience bullets (one per line)</Label>
                  <Textarea
                    className="min-h-40"
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
              )}

              {activeSection === "Skills" && (
                <div className="space-y-2">
                  <Label>Skills (comma separated)</Label>
                  <Input
                    value={content.skills.join(", ")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              )}

              {activeSection === "Education" && (
                <div className="space-y-2">
                  <Label>School · degree · year (one line: MIT | B.S. CS | 2022)</Label>
                  <Textarea
                    className="min-h-24"
                    value={
                      content.education[0]
                        ? `${content.education[0].school}|${content.education[0].degree ?? ""}|${content.education[0].year ?? ""}`
                        : ""
                    }
                    onChange={(e) => {
                      const [school = "", degree = "", year = ""] = e.target.value.split("|")
                      setContent({
                        ...content,
                        education: school
                          ? [{ school: school.trim(), degree: degree.trim(), year: year.trim() }]
                          : [],
                      })
                    }}
                    placeholder="Stanford University|B.S. Computer Science|2021"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live preview</CardTitle>
                <Badge variant="outline">ATS-ready</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResumePreview title={title} targetRole={targetRole} content={content} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
