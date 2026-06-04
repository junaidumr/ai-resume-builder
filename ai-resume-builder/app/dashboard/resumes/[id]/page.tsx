import { notFound } from "next/navigation"

import { ResumeEditor } from "@/components/resumes/resume-editor"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { resumeContentSchema } from "@/lib/types/resume"
import { emptyResumeContent } from "@/lib/types/resume-defaults"

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params

  const resume = await prisma.resume.findFirst({
    where: { id, ownerId: user.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  })

  if (!resume) notFound()

  const latest = resume.versions[0]
  const content = latest
    ? resumeContentSchema.safeParse(latest.content).data ?? emptyResumeContent()
    : emptyResumeContent()

  return (
    <ResumeEditor
      resumeId={resume.id}
      initialTitle={resume.title}
      initialTargetRole={resume.targetRole}
      initialContent={content}
    />
  )
}
