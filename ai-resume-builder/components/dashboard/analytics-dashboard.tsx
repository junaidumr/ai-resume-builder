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
  BotIcon,
  BrainCircuitIcon,
  BriefcaseBusinessIcon,
  FileCheck2Icon,
  FileTextIcon,
  GaugeIcon,
  HistoryIcon,
  SearchCheckIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"

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

const modules = [
  {
    title: "AI Resume Engine",
    href: "/dashboard/resumes",
    icon: SparklesIcon,
    status: "Core",
  },
  {
    title: "Job Match Engine",
    href: "/dashboard/job-match",
    icon: SearchCheckIcon,
    status: "AI",
  },
  {
    title: "Career Coach",
    href: "/dashboard/coach",
    icon: BotIcon,
    status: "Assistant",
  },
  {
    title: "Version Control",
    href: "/dashboard/versions",
    icon: HistoryIcon,
    status: "Workflow",
  },
  {
    title: "Cover Letters",
    href: "/dashboard/cover-letters",
    icon: FileTextIcon,
    status: "Content",
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: BriefcaseBusinessIcon,
    status: "Tracker",
  },
] as const

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

  const statCards: {
    label: string
    value: string
    meta: string
    icon: LucideIcon
  }[] = [
    {
      label: "ATS Score",
      value: String(stats.atsScore || 0),
      meta: `${stats.scoreDelta >= 0 ? "+" : ""}${stats.scoreDelta} pts`,
      icon: GaugeIcon,
    },
    {
      label: "Job Match",
      value: `${stats.jobMatch || 0}%`,
      meta: "Latest analysis",
      icon: BrainCircuitIcon,
    },
    {
      label: "Applications",
      value: String(stats.applications),
      meta: `${stats.interviews} interviews`,
      icon: BriefcaseBusinessIcon,
    },
    {
      label: "Resume Versions",
      value: String(stats.resumeVersions),
      meta: `${stats.tailoredVersions} tailored`,
      icon: FileCheck2Icon,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Live career intelligence from your resumes and applications.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/resumes/new">Create resume</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, meta, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>ATS Score Trend</CardTitle>
                <CardDescription>
                  Resume quality and job-description match over time.
                </CardDescription>
              </div>
              <Badge variant="success">Live AI scoring</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {isHydrated ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg bg-muted/50" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>
              Prioritized recommendations from the career coach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="rounded-lg border bg-background p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="text-sm font-medium">Next best action</span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>
              Success rate, response rate, and interview conversion tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isHydrated ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg bg-muted/50" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Radar</CardTitle>
            <CardDescription>
              Weighted skill relevance against the selected job description.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isHydrated ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <Radar
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.22}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg bg-muted/50" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your resumes</CardTitle>
          <CardDescription>Recently updated resume workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No resumes yet. Create one to start AI optimization.
            </p>
          ) : (
            resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/dashboard/resumes/${resume.id}`}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <p className="font-medium">{resume.title}</p>
                <p className="text-sm text-muted-foreground">
                  {resume.targetRole ?? "No target role"} · ATS {resume.atsScore}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {resume.versionCount} versions
                </p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <module.icon className="size-5" />
                </span>
                <div>
                  <CardTitle>{module.title}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {module.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={module.href}>Open module</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
