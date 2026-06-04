import { ResumesWorkspace } from "@/components/resumes/resumes-workspace"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function ResumesPage() {
  const user = await requireUser()
  const resumes = await prisma.resume.findMany({
    where: { ownerId: user.id },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      _count: { select: { versions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <ResumesWorkspace
      resumes={resumes.map((r) => ({
        id: r.id,
        title: r.title,
        targetRole: r.targetRole,
        atsScore: r.versions[0]?.atsScore ?? 0,
        versionCount: r._count.versions,
        updatedAt: r.updatedAt.toISOString(),
      }))}
    />
  )
}
