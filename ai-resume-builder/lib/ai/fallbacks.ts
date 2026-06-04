import type { z } from "zod"

import type { coverLetterRequestSchema, jobMatchRequestSchema } from "@/lib/ai/prompts"
import type { resumeRequestSchema } from "@/lib/ai/prompts"
import type { aiResumeResultSchema, jobMatchResultSchema } from "@/lib/types/resume"

import { buildFallbackResume } from "@/lib/ai/build-fallback-resume"

type ResumeRequest = z.infer<typeof resumeRequestSchema>
type AiResumeResult = z.infer<typeof aiResumeResultSchema>
type JobMatchRequest = z.infer<typeof jobMatchRequestSchema>
type JobMatchResult = z.infer<typeof jobMatchResultSchema>
type CoverLetterRequest = z.infer<typeof coverLetterRequestSchema>

export { buildFallbackResume }

export function buildFallbackAts(resumeText: string, jobDescription?: string) {
  const text = `${resumeText} ${jobDescription ?? ""}`.toLowerCase()
  const common = [
    "javascript",
    "typescript",
    "react",
    "node",
    "sql",
    "api",
    "agile",
    "leadership",
    "communication",
  ]
  const present = common.filter((k) => text.includes(k))
  const missing = common.filter((k) => !text.includes(k)).slice(0, 5)
  const base = 55 + present.length * 4

  return {
    summary: "ATS scan completed with local heuristics.",
    experienceBullets: [],
    skills: present.length ? present : ["Communication", "Problem solving"],
    missingKeywords: missing.length ? missing : ["cloud", "ci/cd"],
    atsScore: Math.min(92, base),
    suggestions: [
      "Add role-specific keywords from the job description to your summary.",
      "Quantify achievements with metrics in each bullet.",
      jobDescription
        ? "Mirror phrasing from the pasted job description in your skills section."
        : "Paste a job description for targeted keyword matching.",
    ],
  } satisfies AiResumeResult
}

export function buildFallbackJobMatch(input: JobMatchRequest): JobMatchResult {
  const resume = input.resumeText.toLowerCase()
  const job = input.jobDescription.toLowerCase()
  const jobWords = job
    .split(/[^a-z0-9+#]+/i)
    .filter((w) => w.length > 3)
  const unique = [...new Set(jobWords)]
  const hits = unique.filter((w) => resume.includes(w))
  const missing = unique.filter((w) => !resume.includes(w)).slice(0, 8)
  const matchPercentage = unique.length
    ? Math.round((hits.length / unique.length) * 100)
    : 65

  return {
    matchPercentage: Math.min(95, Math.max(35, matchPercentage)),
    extractedSkills: hits.slice(0, 10).map((w) => w.replace(/^\w/, (c) => c.toUpperCase())),
    missingKeywords: missing.length ? missing : ["stakeholder management", "testing"],
    weakAreas: missing.length > 3 ? ["Keyword alignment", "Role-specific skills"] : ["Add more JD keywords to summary"],
    rewriteSuggestions: [
      "Lead with outcomes that match the top requirements in the job description.",
      "Add a skills section that includes missing keywords where you have experience.",
      "Tailor your professional summary to the role title and seniority in the posting.",
    ],
  }
}

export function buildFallbackCoverLetter(input: CoverLetterRequest): string {
  const tone = input.tone
  const opening =
    tone === "Creative"
      ? "I'm excited to bring fresh ideas and momentum to your team."
      : tone === "Startup"
        ? "I'm eager to ship fast, learn quickly, and own outcomes end-to-end."
        : tone === "Corporate"
          ? "I am writing to express my interest in the opportunity with your organization."
          : "I am writing to apply for the role described in your posting."

  return [
    "Dear Hiring Manager,",
    "",
    opening,
    "",
    "My background aligns with the requirements you've outlined. Highlights from my experience include:",
    "",
    input.resumeText
      .split("\n")
      .filter(Boolean)
      .slice(0, 6)
      .map((line) => `• ${line}`)
      .join("\n"),
    "",
    "I would welcome the chance to discuss how I can contribute to your team's goals.",
    "",
    "Sincerely,",
    "[Your Name]",
  ].join("\n")
}

export function buildFallbackCoachReply(userMessage: string): string {
  const q = userMessage.toLowerCase()
  if (q.includes("interview")) {
    return "For interviews, prepare 3 STAR stories (Situation, Task, Action, Result), research the company, and practice a 60-second intro. Ask about team priorities and success metrics at the end."
  }
  if (q.includes("resume") || q.includes("ats")) {
    return "For your resume: use one page if early-career, lead bullets with action verbs and metrics, mirror keywords from the job description, and keep formatting ATS-safe (simple headings, no tables)."
  }
  if (q.includes("salary") || q.includes("offer")) {
    return "Research market ranges for your role and location, anchor on total compensation (base + bonus + equity), and practice negotiating after you have an offer."
  }
  return "Focus on one clear goal this week: update your resume for a target role, apply to 5 quality matches, and schedule one networking conversation. Tell me your target role and I can suggest next steps."
}

export function ensureRawExperience(text: string, fallbackRole = "Software Engineer") {
  const trimmed = text.trim()
  if (trimmed.length >= 20) return trimmed
  return `Mid-level ${fallbackRole} with experience delivering features, collaborating across teams, and improving product quality. ${trimmed}`.slice(
    0,
    500
  )
}

export function buildGenerateInput(
  targetRole: string,
  summary: string,
  bullets: string[]
): ResumeRequest {
  const rawExperience = ensureRawExperience(
    [summary, ...bullets].filter(Boolean).join("\n"),
    targetRole
  )
  return {
    targetRole: targetRole || "Software Engineer",
    seniority: "Mid",
    industry: "Technology",
    rawExperience,
    jobDescription: "",
  }
}
