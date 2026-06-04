import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/auth/api"
import { buildFallbackJobMatch } from "@/lib/ai/fallbacks"
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

  let result = buildFallbackJobMatch(parsed.data)
  let usedFallback = true

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiResult = await generateStructuredJson({
        system:
          "Analyze resume vs job description. Return JSON with matchPercentage, extractedSkills, missingKeywords, weakAreas, rewriteSuggestions.",
        user: buildJobMatchPrompt(parsed.data),
      })
      const fromAi = jobMatchResultSchema.safeParse(aiResult)
      if (fromAi.success) {
        result = fromAi.data
        usedFallback = false
      }
    } catch {
      // use fallback
    }
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
          score: result.matchPercentage,
          matchPercentage: result.matchPercentage,
          missingKeywords: result.missingKeywords,
          suggestions: result.rewriteSuggestions,
        },
      })
    }
  }

  return NextResponse.json({ result, usedFallback })
}
