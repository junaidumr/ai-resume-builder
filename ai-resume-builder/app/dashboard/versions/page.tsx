import { VersionsTimeline } from "@/components/versions/versions-timeline"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function VersionsPage() {
  const user = await requireUser()
  const versions = await prisma.resumeVersion.findMany({
    where: { resume: { ownerId: user.id } },
    include: { resume: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <VersionsTimeline
      versions={versions.map((v) => ({
        id: v.id,
        version: v.version,
        label: v.label,
        template: v.template,
        atsScore: v.atsScore,
        changeSummary: v.changeSummary,
        createdAt: v.createdAt.toISOString(),
        resume: v.resume,
      }))}
    />
  )
}
