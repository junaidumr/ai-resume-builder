import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"
import { emptyResumeContent } from "@/lib/types/resume-defaults"
import { createResumeSchema } from "@/lib/types/resume"

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const resumes = await prisma.resume.findMany({
    where: { ownerId: user!.id },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      _count: { select: { versions: true, analyses: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ resumes })
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = createResumeSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid resume payload", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const content = parsed.data.content ?? emptyResumeContent()

  const resume = await prisma.resume.create({
    data: {
      title: parsed.data.title,
      targetRole: parsed.data.targetRole,
      ownerId: user!.id,
      versions: {
        create: {
          version: 1,
          label: "Initial draft",
          template: parsed.data.template,
          content,
          atsScore: 0,
        },
      },
    },
    include: { versions: true },
  })

  return NextResponse.json({ resume }, { status: 201 })
}
