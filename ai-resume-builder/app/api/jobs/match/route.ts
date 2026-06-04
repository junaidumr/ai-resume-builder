import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/auth/api"
import { generateStructuredJson } from "@/lib/ai/openai-json"
import { buildJobMatchPrompt, jobMatchRequestSchema } from "@/lib/ai/prompts"
import { prisma } from "@/lib/db/prisma"
import { jobMatchResultSchema } from "@/lib/types/resume"

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = jobMatchRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid job match request", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is required for semantic job matching" },
      { status: 503 }
    )
  }

  const aiResult = await generateStructuredJson({
    system:
      "Analyze resume vs job description. Return JSON with matchPercentage, extractedSkills, missingKeywords, weakAreas, rewriteSuggestions.",
    user: buildJobMatchPrompt(parsed.data),
  })

  const validated = jobMatchResultSchema.safeParse(aiResult)
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid match result" }, { status: 502 })
  }

  if (parsed.data.resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: parsed.data.resumeId, ownerId: user!.id },
    })

    if (resume) {
      await prisma.atsAnalysis.create({
        data: {
          resumeId: resume.id,
          jobDescription: parsed.data.jobDescription,
          score: validated.data.matchPercentage,
          matchPercentage: validated.data.matchPercentage,
          missingKeywords: validated.data.missingKeywords,
          suggestions: validated.data.rewriteSuggestions,
        },
      })
    }
  }

  return NextResponse.json({ result: validated.data })
}
