"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowRightIcon,
  BotIcon,
  BrainCircuitIcon,
  BriefcaseBusinessIcon,
  FileCheck2Icon,
  GaugeIcon,
  HistoryIcon,
  PlusIcon,
  SearchCheckIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"

import { PageHeader, PageHeaderLinkAction } from "@/components/dashboard/page-header"
import { ScoreBadge } from "@/components/dashboard/score-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { getDashboardMetrics } from "@/lib/services/dashboard"

type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>

const modules: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  tag: string
}[] = [
  {
    title: "Resume Builder",
    description: "Create, edit, and version tailored resumes.",
    href: "/dashboard/resumes",
    icon: SparklesIcon,
    tag: "Core",
  },
  {
    title: "ATS Intelligence",
    description: "Keyword gaps and formatting signals.",
    href: "/dashboard/ats",
    icon: SearchCheckIcon,
    tag: "Scan",
  },
  {
    title: "Job Match",
    description: "Semantic fit vs job descriptions.",
    href: "/dashboard/job-match",
    icon: BrainCircuitIcon,
    tag: "Match",
  },
  {
    title: "Career Coach",
    description: "Interview prep and career guidance.",
    href: "/dashboard/coach",
    icon: BotIcon,
    tag: "Coach",
  },
  {
    title: "Applications",
    description: "Pipeline from applied to offer.",
    href: "/dashboard/applications",
    icon: BriefcaseBusinessIcon,
    tag: "Track",
  },
  {
    title: "Versions",
    description: "Compare and restore resume history.",
    href: "/dashboard/versions",
    icon: HistoryIcon,
    tag: "History",
  },
]

function useIsHydrated() {
  return React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )
}

export function AnalyticsDashboard({ metrics }: { metrics: DashboardMetrics }) {
  const isHydrated = useIsHydrated()
  const { stats, scoreTrend, funnel, skillRadar, insights, resumes } = metrics

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="Command Center"
          description="Real-time career intelligence across resumes, ATS scores, job matching, and your application pipeline."
          badge="Live"
          icon={GaugeIcon}
          actions={
            <>
              <PageHeaderLinkAction href="/dashboard/resumes" variant="outline">
                View resumes
              </PageHeaderLinkAction>
              <PageHeaderLinkAction href="/dashboard/resumes/new">
                <PlusIcon className="size-4" />
                New resume
              </PageHeaderLinkAction>
            </>
          }
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pt-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="ATS Score"
            value={`${stats.atsScore || 0}%`}
            meta={`${stats.scoreDelta >= 0 ? "+" : ""}${stats.scoreDelta} vs last scan`}
            icon={GaugeIcon}
            trend={stats.scoreDelta >= 0 ? "up" : "down"}
          />
          <StatCard
            label="Job Match"
            value={`${stats.jobMatch || 0}%`}
            meta="Latest JD analysis"
            icon={BrainCircuitIcon}
          />
          <StatCard
            label="Applications"
            value={String(stats.applications)}
            meta={`${stats.interviews} in interview / offer`}
            icon={BriefcaseBusinessIcon}
          />
          <StatCard
            label="Versions"
            value={String(stats.resumeVersions)}
            meta={`${stats.tailoredVersions} multi-version resumes`}
            icon={FileCheck2Icon}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>ATS score trend</CardTitle>
                  <CardDescription>Quality and match over recent analyses.</CardDescription>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-72 min-h-[288px]">
              {isHydrated && scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  Run an ATS scan to populate this chart.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Priority actions</CardTitle>
              <CardDescription>AI-recommended next steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={`${insight}-${index}`}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant="outline" className="tabular-nums">
                      {index + 1}
                    </Badge>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Action
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Application funnel</CardTitle>
              <CardDescription>Stage distribution across your pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 min-h-[288px]">
              {isHydrated ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                  <BarChart data={funnel}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="stage" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg bg-muted/30" />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Skill profile</CardTitle>
              <CardDescription>Weighted dimensions from latest analysis.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 min-h-[288px]">
              {isHydrated ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                  <RadarChart data={skillRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" fontSize={11} />
                    <Radar
                      dataKey="value"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg bg-muted/30" />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Resume workspaces</CardTitle>
              <CardDescription>Jump back into active drafts.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/resumes">
                View all
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
                No resumes yet.{" "}
                <Link href="/dashboard/resumes/new" className="font-medium text-primary underline-offset-4 hover:underline">
                  Create your first resume
                </Link>
              </p>
            ) : (
              resumes.map((resume) => (
                <Link
                  key={resume.id}
                  href={`/dashboard/resumes/${resume.id}`}
                  className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <p className="font-medium group-hover:text-primary">{resume.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resume.targetRole ?? "No target role"}
                  </p>
                  <div className="mt-3">
                    <ScoreBadge score={resume.atsScore} showBar />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {resume.versionCount} version{resume.versionCount === 1 ? "" : "s"}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Modules
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <Card
                key={module.href}
                className="group border-border/80 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5">
                      <module.icon className="size-5 text-primary" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        <Badge variant="outline">{module.tag}</Badge>
                      </div>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:border-primary/40">
                    <Link href={module.href}>
                      Open
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
