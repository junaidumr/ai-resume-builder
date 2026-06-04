import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { buildFallbackCoachReply } from "@/lib/ai/fallbacks"
import { getOpenAIClient } from "@/lib/ai/prompts"
import { prisma } from "@/lib/db/prisma"

const messageSchema = z.object({
  content: z.string().min(1),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const thread = await prisma.coachThread.findFirst({
    where: { id, userId: user!.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }

  return NextResponse.json({ thread })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = messageSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  }

  const { id } = await params
  const thread = await prisma.coachThread.findFirst({
    where: { id, userId: user!.id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  })

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }

  await prisma.coachMessage.create({
    data: {
      threadId: thread.id,
      role: "user",
      content: parsed.data.content,
    },
  })

  const history = thread.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n")

  let assistantContent = buildFallbackCoachReply(parsed.data.content)
  let usedFallback = true

  if (process.env.OPENAI_API_KEY) {
    try {
      const completion = await getOpenAIClient().responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1",
        input: [
          {
            role: "system",
            content:
              "You are an AI Career Coach. Help with resumes, career paths, certifications, mock interviews, and recruiter questions. Be concise and actionable.",
          },
          {
            role: "user",
            content: `Conversation history:\n${history}\n\nUser: ${parsed.data.content}`,
          },
        ],
      })
      const text = completion.output_text?.trim()
      if (text) {
        assistantContent = text
        usedFallback = false
      }
    } catch {
      // use fallback
    }
  }

  const assistantMessage = await prisma.coachMessage.create({
    data: {
      threadId: thread.id,
      role: "assistant",
      content: assistantContent,
    },
  })

  await prisma.coachThread.update({
    where: { id: thread.id },
    data: {
      memory: {
        lastTopic: parsed.data.content.slice(0, 120),
        updatedAt: new Date().toISOString(),
      },
    },
  })

  return NextResponse.json({ message: assistantMessage, usedFallback })
}
