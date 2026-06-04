import type { z } from "zod"

import type { resumeRequestSchema } from "@/lib/ai/prompts"
import type { aiResumeResultSchema } from "@/lib/types/resume"

type ResumeRequest = z.infer<typeof resumeRequestSchema>
type AiResumeResult = z.infer<typeof aiResumeResultSchema>

/** Deterministic draft when OpenAI is unavailable (quota, missing key, etc.). */
export function buildFallbackResume(input: ResumeRequest): AiResumeResult {
  const role = input.targetRole.trim()
  const notes = input.rawExperience.trim()

  const experienceBullets = notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)

  if (experienceBullets.length === 0) {
    experienceBullets.push(
      `Delivered ${input.seniority.toLowerCase()}-level outcomes as a ${role} in ${input.industry}.`,
      "Collaborated with cross-functional teams to ship reliable product features on schedule.",
      "Improved quality and maintainability through testing, code review, and documentation."
    )
  }

  return {
    summary: `${input.seniority} ${role} focused on ${input.industry}. ${notes.slice(0, 200)}`.trim(),
    experienceBullets,
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "API design",
      "Agile delivery",
    ],
    missingKeywords: ["leadership", "stakeholder management", "metrics-driven"],
    atsScore: 72,
    suggestions: [
      "Add measurable impact to each bullet (%, $, time saved).",
      "Mirror keywords from the job description in your skills section.",
      "Keep the resume to one page for early-career roles.",
    ],
  }
}
