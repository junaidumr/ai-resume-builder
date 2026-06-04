import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUser } from "@/lib/auth/api"
import { generateStructuredJson } from "@/lib/ai/openai-json"
import { prisma } from "@/lib/db/prisma"
import { aiResumeResultSchema, resumeContentSchema, resumeToText } from "@/lib/types/resume"

const bodySchema = z.object({
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

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ATS request" }, { status: 400 })
  }

  const { id } = await params
  const resume = await prisma.resume.findFirst({
    where: { id, ownerId: user!.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  })

  if (!resume?.versions[0]) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }

  const content = resumeContentSchema.parse(resume.versions[0].content)
  const resumeText = resumeToText(content)

  const aiResult = await generateStructuredJson({
    system:
      "You are an ATS scanner. Return JSON with summary, experienceBullets, skills, missingKeywords, atsScore (0-100), suggestions (string array).",
    user: JSON.stringify({
      resumeText,
      jobDescription: parsed.data.jobDescription ?? "",
    }),
  })

  const validated = aiResumeResultSchema.safeParse(aiResult)
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid ATS analysis" }, { status: 502 })
  }

  const analysis = await prisma.atsAnalysis.create({
    data: {
      resumeId: resume.id,
      jobDescription: parsed.data.jobDescription,
      score: validated.data.atsScore,
      missingKeywords: validated.data.missingKeywords,
      suggestions: validated.data.suggestions,
    },
  })

  await prisma.resumeVersion.update({
    where: { id: resume.versions[0].id },
    data: { atsScore: validated.data.atsScore },
  })

  return NextResponse.json({ analysis, result: validated.data })
}
