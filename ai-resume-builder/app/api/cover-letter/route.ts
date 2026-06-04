import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { getOpenAIClient } from "@/lib/ai/prompts"
import { coverLetterRequestSchema } from "@/lib/ai/prompts"
import { prisma } from "@/lib/db/prisma"

const extendedSchema = coverLetterRequestSchema.extend({
  resumeId: z.string().optional(),
})

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = extendedSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cover letter request", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is required for cover letter generation" },
      { status: 503 }
    )
  }

  const completion = await getOpenAIClient().responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1",
    input: [
      "Write a tailored cover letter using the requested tone.",
      "Keep it specific, concise, editable, and aligned with the job description.",
      JSON.stringify(parsed.data),
    ].join("\n\n"),
  })

  const letter = completion.output_text?.trim() ?? ""

  if (parsed.data.resumeId) {
    await prisma.uploadedFile.create({
      data: {
        userId: user!.id,
        type: "COVER_LETTER",
        fileName: `cover-letter-${Date.now()}.txt`,
        contentType: "text/plain",
        s3Key: `local/${user!.id}/cover-letters/${Date.now()}.txt`,
        extracted: { content: letter, tone: parsed.data.tone },
      },
    })
  }

  return NextResponse.json({ letter })
}
