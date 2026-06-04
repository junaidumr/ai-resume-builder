import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import {
  buildFallbackResume,
  buildGenerateInput,
  ensureRawExperience,
} from "@/lib/ai/fallbacks"
import { generateStructuredJson } from "@/lib/ai/openai-json"
import { buildResumeSystemPrompt } from "@/lib/ai/prompts"
import { prisma } from "@/lib/db/prisma"
import {
  aiResumeResultSchema,
  resumeContentSchema,
  resumeToText,
  type ResumeContent,
} from "@/lib/types/resume"

const bodySchema = z.object({
  targetRole: z.string().min(2),
  seniority: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  rawExperience: z.string().optional(),
  jobDescription: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid generation request", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = await params
  const resume = await prisma.resume.findFirst({
    where: { id, ownerId: user!.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  })

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  const genInput = buildGenerateInput(parsed.data.targetRole, "", [])
  const requestPayload = {
    targetRole: parsed.data.targetRole,
    seniority: parsed.data.seniority ?? genInput.seniority,
    industry: parsed.data.industry ?? genInput.industry,
    rawExperience: ensureRawExperience(
      parsed.data.rawExperience ?? "",
      parsed.data.targetRole
    ),
    jobDescription: parsed.data.jobDescription,
  }

  let result = buildFallbackResume(requestPayload)
  let usedFallback = true

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiResult = await generateStructuredJson({
        system: buildResumeSystemPrompt(),
        user: JSON.stringify(requestPayload),
      })
      const fromAi = aiResumeResultSchema.safeParse(aiResult)
      if (fromAi.success) {
        result = fromAi.data
        usedFallback = false
      }
    } catch {
      // use fallback
    }
  }

  const latest = resume.versions[0]
  const currentContent = latest
    ? resumeContentSchema.parse(latest.content)
    : ({
        personal: {},
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      } satisfies ResumeContent)

  const updatedContent: ResumeContent = {
    ...currentContent,
    summary: result.summary,
    skills: result.skills,
    experience:
      currentContent.experience.length > 0
        ? currentContent.experience.map((exp, index) =>
            index === 0
              ? { ...exp, bullets: result.experienceBullets }
              : exp
          )
        : [
            {
              company: "Recent Role",
              title: parsed.data.targetRole,
              bullets: result.experienceBullets,
            },
          ],
  }

  const nextVersion = (latest?.version ?? 0) + 1

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      version: nextVersion,
      label: usedFallback
        ? `Draft improve v${nextVersion}`
        : `AI generated v${nextVersion}`,
      template: latest?.template ?? "ATS Minimal",
      content: updatedContent,
      atsScore: result.atsScore,
      changeSummary: usedFallback
        ? "Local AI draft improvement"
        : "AI resume rewrite and ATS optimization",
    },
  })

  await prisma.atsAnalysis.create({
    data: {
      resumeId: resume.id,
      jobDescription: parsed.data.jobDescription,
      score: result.atsScore,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
    },
  })

  await prisma.resume.update({
    where: { id: resume.id },
    data: { targetRole: parsed.data.targetRole },
  })

  return NextResponse.json({
    version,
    analysis: result,
    resumeText: resumeToText(updatedContent),
    usedFallback,
    content: updatedContent,
  })
}
