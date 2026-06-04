import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"
import { resumeContentSchema } from "@/lib/types/resume"

const bodySchema = z.object({
  versionId: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid restore request" }, { status: 400 })
  }

  const { id } = await params
  const resume = await prisma.resume.findFirst({
    where: { id, ownerId: user!.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  })

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  const source = await prisma.resumeVersion.findFirst({
    where: { id: parsed.data.versionId, resumeId: resume.id },
  })

  if (!source) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  const content = resumeContentSchema.parse(source.content)
  const latest = resume.versions[0]
  const nextVersion = (latest?.version ?? 0) + 1

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      version: nextVersion,
      label: `Restored from v${source.version}`,
      template: source.template,
      content,
      atsScore: source.atsScore,
      changeSummary: `Restored content from version ${source.version}`,
    },
  })

  return NextResponse.json({ version })
}
