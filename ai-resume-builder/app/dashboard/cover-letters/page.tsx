import { CoverLetterTool } from "@/components/tools/cover-letter-tool"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { resumeContentSchema } from "@/lib/types/resume"
import { emptyResumeContent } from "@/lib/types/resume-defaults"

export default async function CoverLettersPage() {
  const user = await requireUser()
  const rows = await prisma.resume.findMany({
    where: { ownerId: user.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  })

  const resumes = rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.versions[0]
      ? resumeContentSchema.safeParse(r.versions[0].content).data ??
        emptyResumeContent()
      : emptyResumeContent(),
  }))

  return <CoverLetterTool resumes={resumes} />
}
