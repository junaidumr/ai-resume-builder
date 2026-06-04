import { z } from "zod"

export const resumeContentSchema = z.object({
  personal: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        title: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        bullets: z.array(z.string()),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        school: z.string(),
        degree: z.string().optional(),
        year: z.string().optional(),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        impact: z.string().optional(),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
})

export type ResumeContent = z.infer<typeof resumeContentSchema>

export const createResumeSchema = z.object({
  title: z.string().min(2),
  targetRole: z.string().optional(),
  template: z.string().default("ATS Minimal"),
  content: resumeContentSchema.optional(),
})

export const updateResumeSchema = z.object({
  title: z.string().min(2).optional(),
  targetRole: z.string().optional(),
  content: resumeContentSchema.optional(),
})

export function resumeToText(content: ResumeContent) {
  const parts = [
    content.personal.fullName,
    content.summary,
    ...content.experience.flatMap((exp) => [
      `${exp.title} at ${exp.company}`,
      ...exp.bullets,
    ]),
    ...content.skills,
    ...content.education.map((e) => `${e.degree ?? ""} ${e.school}`.trim()),
  ]

  return parts.filter(Boolean).join("\n")
}

export const aiResumeResultSchema = z.object({
  summary: z.string(),
  experienceBullets: z.array(z.string()),
  skills: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  atsScore: z.number(),
  suggestions: z.array(z.string()),
})

export const jobMatchResultSchema = z.object({
  matchPercentage: z.number(),
  extractedSkills: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  weakAreas: z.array(z.string()),
  rewriteSuggestions: z.array(z.string()),
})
