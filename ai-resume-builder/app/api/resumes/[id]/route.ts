import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"
import { updateResumeSchema } from "@/lib/types/resume"

async function getOwnedResume(userId: string, id: string) {
  return prisma.resume.findFirst({
    where: { id, ownerId: userId },
    include: {
      versions: { orderBy: { version: "desc" } },
      analyses: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const resume = await getOwnedResume(user!.id, id)

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  return NextResponse.json({ resume })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = updateResumeSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update payload", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = await params
  const existing = await getOwnedResume(user!.id, id)
  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  const latest = existing.versions[0]

  if (parsed.data.content && latest) {
    await prisma.resumeVersion.update({
      where: { id: latest.id },
      data: { content: parsed.data.content },
    })
  }

  const resume = await prisma.resume.update({
    where: { id },
    data: {
      title: parsed.data.title,
      targetRole: parsed.data.targetRole,
    },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  })

  return NextResponse.json({ resume })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const existing = await getOwnedResume(user!.id, id)
  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  await prisma.resume.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
