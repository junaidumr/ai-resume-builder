import { notFound } from "next/navigation"

import { ResumeEditor } from "@/components/resumes/resume-editor"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { resumeContentSchema } from "@/lib/types/resume"
import { emptyResumeContent } from "@/lib/types/resume-defaults"

export default async function ResumeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ version?: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const { version: versionParam } = await searchParams
  const versionNumber = versionParam ? Number.parseInt(versionParam, 10) : undefined

  const resume = await prisma.resume.findFirst({
    where: { id, ownerId: user.id },
    include: { versions: { orderBy: { version: "desc" } } },
  })

  if (!resume) notFound()

  const selected =
    versionNumber && !Number.isNaN(versionNumber)
      ? resume.versions.find((v) => v.version === versionNumber)
      : resume.versions[0]

  const content = selected
    ? resumeContentSchema.safeParse(selected.content).data ?? emptyResumeContent()
    : emptyResumeContent()

  return (
    <ResumeEditor
      resumeId={resume.id}
      initialTitle={resume.title}
      initialTargetRole={resume.targetRole}
      initialContent={content}
      viewingVersion={selected?.version}
      viewingVersionLabel={selected?.label}
    />
  )
}
