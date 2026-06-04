import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
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
  seniority: z.string().min(2),
  industry: z.string().min(2),
  rawExperience: z.string().min(20),
  jobDescription: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is required" },
      { status: 503 }
    )
  }

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

  const aiResult = await generateStructuredJson({
    system: buildResumeSystemPrompt(),
    user: JSON.stringify(parsed.data),
  })

  const validated = aiResumeResultSchema.safeParse(aiResult)
  if (!validated.success) {
    return NextResponse.json(
      { error: "AI returned invalid resume structure" },
      { status: 502 }
    )
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
    summary: validated.data.summary,
    skills: validated.data.skills,
    experience:
      currentContent.experience.length > 0
        ? currentContent.experience.map((exp, index) =>
            index === 0
              ? { ...exp, bullets: validated.data.experienceBullets }
              : exp
          )
        : [
            {
              company: "Recent Role",
              title: parsed.data.targetRole,
              bullets: validated.data.experienceBullets,
            },
          ],
  }

  const nextVersion = (latest?.version ?? 0) + 1

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      version: nextVersion,
      label: `AI generated v${nextVersion}`,
      template: latest?.template ?? "ATS Minimal",
      content: updatedContent,
      atsScore: validated.data.atsScore,
      changeSummary: "AI resume rewrite and ATS optimization",
    },
  })

  await prisma.atsAnalysis.create({
    data: {
      resumeId: resume.id,
      jobDescription: parsed.data.jobDescription,
      score: validated.data.atsScore,
      missingKeywords: validated.data.missingKeywords,
      suggestions: validated.data.suggestions,
    },
  })

  await prisma.resume.update({
    where: { id: resume.id },
    data: { targetRole: parsed.data.targetRole },
  })

  return NextResponse.json({
    version,
    analysis: validated.data,
    resumeText: resumeToText(updatedContent),
  })
}
