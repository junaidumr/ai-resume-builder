import { prisma } from "@/lib/db/prisma"

export async function getDashboardMetrics(userId: string) {
  const [resumes, applications, analyses, versions] = await Promise.all([
    prisma.resume.findMany({
      where: { ownerId: userId },
      include: {
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
        versions: { orderBy: { version: "desc" }, take: 1 },
        _count: { select: { versions: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.atsAnalysis.findMany({
      where: { resume: { ownerId: userId } },
      orderBy: { createdAt: "asc" },
      take: 12,
    }),
    prisma.resumeVersion.count({ where: { resume: { ownerId: userId } } }),
  ])

  const latestScore =
    analyses.at(-1)?.score ??
    resumes[0]?.versions[0]?.atsScore ??
    resumes[0]?.analyses[0]?.score ??
    0

  const previousScore = analyses.at(-2)?.score ?? latestScore
  const scoreDelta = latestScore - previousScore

  const scoreTrend = analyses.length
    ? analyses.map((a) => ({
        month: new Intl.DateTimeFormat("en", { month: "short" }).format(
          a.createdAt
        ),
        score: a.score,
      }))
    : [{ month: "Now", score: latestScore || 0 }]

  const statusCounts = applications.reduce<Record<string, number>>(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1
      return acc
    },
    {}
  )

  const funnel = [
    { stage: "Applied", count: statusCounts.APPLIED ?? 0 },
    { stage: "Shortlisted", count: statusCounts.SHORTLISTED ?? 0 },
    { stage: "Interview", count: statusCounts.INTERVIEW ?? 0 },
    { stage: "Offer", count: statusCounts.OFFER ?? 0 },
  ]

  const latestMatch = analyses
    .filter((a) => a.matchPercentage != null)
    .at(-1)?.matchPercentage

  const skillRadar = [
    { skill: "Technical", value: Math.min(100, latestScore) },
    { skill: "Keywords", value: Math.min(100, (latestMatch ?? latestScore) || 0) },
    { skill: "Impact", value: Math.min(100, Math.max(50, latestScore - 8)) },
    { skill: "Format", value: Math.min(100, latestScore + 4) },
    { skill: "Leadership", value: Math.min(100, Math.max(40, latestScore - 12)) },
  ]

  const latestSuggestions = analyses.at(-1)?.suggestions
  const insights = Array.isArray(latestSuggestions)
    ? latestSuggestions.filter((item): item is string => typeof item === "string")
    : [
        "Create your first tailored resume version for a target role.",
        "Add measurable outcomes to your top two experience bullets.",
        "Track applications to unlock funnel analytics.",
      ]

  const interviewCount = applications.filter(
    (a) => a.status === "INTERVIEW" || a.status === "OFFER"
  ).length

  return {
    stats: {
      atsScore: latestScore,
      scoreDelta,
      jobMatch: latestMatch ?? 0,
      applications: applications.length,
      interviews: interviewCount,
      resumeVersions: versions,
      tailoredVersions: resumes.filter((r) => r._count.versions > 1).length,
    },
    scoreTrend,
    funnel,
    skillRadar,
    insights: insights.slice(0, 3),
    resumes: resumes.map((r) => ({
      id: r.id,
      title: r.title,
      targetRole: r.targetRole,
      atsScore: r.versions[0]?.atsScore ?? r.analyses[0]?.score ?? 0,
      versionCount: r._count.versions,
    })),
  }
}
