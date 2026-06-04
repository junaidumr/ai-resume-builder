import { NextResponse } from "next/server"

import { requireApiUser } from "@/lib/auth/api"
import { buildFallbackResume } from "@/lib/ai/build-fallback-resume"
import { generateStructuredJson } from "@/lib/ai/openai-json"
import {
  buildResumeSystemPrompt,
  resumeRequestSchema,
} from "@/lib/ai/prompts"
import { prisma } from "@/lib/db/prisma"
import { aiResumeResultSchema } from "@/lib/types/resume"
import { emptyResumeContent } from "@/lib/types/resume-defaults"

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = resumeRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid resume generation request", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  let result = buildFallbackResume(parsed.data)
  let usedFallback = true

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiResult = await generateStructuredJson({
        system: buildResumeSystemPrompt(),
        user: JSON.stringify(parsed.data),
      })
      const fromAi = aiResumeResultSchema.safeParse(aiResult)
      if (fromAi.success) {
        result = fromAi.data
        usedFallback = false
      }
    } catch {
      // Quota, network, or model errors — use local draft generator below.
    }
  }

  const resume = await prisma.resume.create({
    data: {
      title: `${parsed.data.targetRole} Resume`,
      targetRole: parsed.data.targetRole,
      ownerId: user!.id,
      versions: {
        create: {
          version: 1,
          label: usedFallback ? "Draft (local generator)" : "AI generated",
          template: "ATS Minimal",
          content: {
            ...emptyResumeContent(),
            summary: result.summary,
            skills: result.skills,
            experience: [
              {
                company: "Experience",
                title: parsed.data.targetRole,
                bullets: result.experienceBullets,
              },
            ],
          },
          atsScore: result.atsScore,
        },
      },
      analyses: {
        create: {
          score: result.atsScore,
          jobDescription: parsed.data.jobDescription,
          missingKeywords: result.missingKeywords,
          suggestions: result.suggestions,
        },
      },
    },
    include: { versions: true },
  })

  return NextResponse.json({
    resume,
    result,
    usedFallback,
  })
}
