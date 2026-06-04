import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { prisma } from "@/lib/db/prisma"

const createSchema = z.object({
  title: z.string().min(2).default("Career coaching"),
})

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const threads = await prisma.coachThread.findMany({
    where: { userId: user!.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  return NextResponse.json({ threads })
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 })
  }

  const thread = await prisma.coachThread.create({
    data: {
      userId: user!.id,
      title: parsed.data.title,
    },
  })

  return NextResponse.json({ thread }, { status: 201 })
}
