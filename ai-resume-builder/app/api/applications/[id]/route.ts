import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"

const updateSchema = z.object({
  company: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z
    .enum(["APPLIED", "INTERVIEW", "SHORTLISTED", "REJECTED", "OFFER"])
    .optional(),
  resumeId: z.string().nullable().optional(),
  matchScore: z.number().int().min(0).max(100).optional(),
  reminderAt: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = await params
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId: user!.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const application = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...parsed.data,
      reminderAt:
        parsed.data.reminderAt === null
          ? null
          : parsed.data.reminderAt
            ? new Date(parsed.data.reminderAt)
            : undefined,
    },
  })

  return NextResponse.json({ application })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId: user!.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.jobApplication.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
