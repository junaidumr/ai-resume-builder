"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRightIcon,
  BotIcon,
  BriefcaseBusinessIcon,
  FileTextIcon,
  GaugeIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { signIn, useSession } from "next-auth/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const capabilities = [
  {
    icon: SparklesIcon,
    title: "AI Resume Engine",
    description:
      "Generate, rewrite, score, and tailor resumes for each market, role, and job description.",
  },
  {
    icon: GaugeIcon,
    title: "ATS Intelligence",
    description:
      "Expose keyword gaps, formatting risks, recruiter signals, and one-click optimization paths.",
  },
  {
    icon: BriefcaseBusinessIcon,
    title: "Application Tracker",
    description:
      "Track stages, response rates, interview conversion, reminders, and improvement history.",
  },
  {
    icon: BotIcon,
    title: "AI Career Coach",
    description:
      "Guide users with resume reviews, mock interviews, career paths, and skill roadmaps.",
  },
]

const stack = [
  "Next.js App Router",
  "Prisma + PostgreSQL",
  "OpenAI ready",
  "Redis cache",
  "S3 storage",
  "RBAC",
]

type LandingPageProps = {
  authErrorCode?: string | null
}

export function LandingPage({ authErrorCode }: LandingPageProps) {
  const { data: session } = useSession()

  const authError =
    authErrorCode === "OAuthCreateAccount"
      ? "We could not create your account. Restart the dev server after database updates, then try again."
      : authErrorCode === "OAuthCallback" || authErrorCode === "OAuthSignin"
        ? "Google sign-in could not complete. Clear site cookies for localhost, then try again."
        : authErrorCode
          ? "Sign-in failed. Please try again."
          : null

  React.useEffect(() => {
    const url = new URL(window.location.href)
    if (
      url.searchParams.has("callbackUrl") ||
      url.searchParams.has("error")
    ) {
      window.history.replaceState({}, "", "/")
    }
  }, [])

  function goToGoogleSignIn() {
    void signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <main className="min-h-svh overflow-hidden bg-background">
      <section className="relative px-6 py-8 md:px-10">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,oklch(0.55_0.2_260/0.22),transparent_60%)]" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileTextIcon className="size-4" />
            </span>
            AI Resume Builder
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline">Career OS</Badge>
            <Badge variant="outline">Enterprise SaaS</Badge>
          </div>
          {session ? (
            <Button asChild>
              <Link href="/dashboard">
                Open dashboard
                <ArrowRightIcon />
              </Link>
            </Button>
          ) : (
            <Button type="button" onClick={goToGoogleSignIn}>
              Sign in with Google
            </Button>
          )}
        </nav>

        {authError ? (
          <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {authError}
          </div>
        ) : null}

        <div className="mx-auto grid max-w-7xl gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-5">
              AI-powered career intelligence platform
            </Badge>
            <h1 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">
              Build job-ready resumes, match roles, and manage your career pipeline.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              A production-grade SaaS foundation for resume generation, ATS
              analysis, job matching, cover letters, version control, recruiter
              search, and career coaching.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {session ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Launch workspace
                    <ArrowRightIcon />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={goToGoogleSignIn}>
                  Sign in with Google
                  <ArrowRightIcon />
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <a href="#architecture">View architecture</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {stack.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card/80 backdrop-blur">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                    <p className="text-3xl font-medium">92%</p>
                  </div>
                  <GaugeIcon className="size-8 text-emerald-500" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Keyword match", "86%"],
                    ["Skill relevance", "91%"],
                    ["Formatting", "98%"],
                    ["Recruiter signal", "High"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border bg-background p-4">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-2 text-xl font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="size-4 text-emerald-500" />
                    <p className="text-sm font-medium">
                      Enterprise controls ready
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    RBAC, audit logs, plan limits, encrypted data model, and API
                    validation are scaffolded for the platform layer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="architecture" className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <Card key={capability.title}>
                <CardContent className="p-5">
                  <capability.icon className="mb-4 size-5 text-primary" />
                  <h2 className="font-medium">{capability.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {capability.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
