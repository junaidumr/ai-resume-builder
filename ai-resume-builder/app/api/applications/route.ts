import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"

const createSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z
    .enum(["APPLIED", "INTERVIEW", "SHORTLISTED", "REJECTED", "OFFER"])
    .default("APPLIED"),
  resumeId: z.string().optional(),
  reminderAt: z.string().datetime().optional(),
})

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const applications = await prisma.jobApplication.findMany({
    where: { userId: user!.id },
    include: { resume: { select: { id: true, title: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ applications })
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application payload", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const application = await prisma.jobApplication.create({
    data: {
      userId: user!.id,
      company: parsed.data.company,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      resumeId: parsed.data.resumeId,
      reminderAt: parsed.data.reminderAt
        ? new Date(parsed.data.reminderAt)
        : undefined,
    },
  })

  return NextResponse.json({ application }, { status: 201 })
}
