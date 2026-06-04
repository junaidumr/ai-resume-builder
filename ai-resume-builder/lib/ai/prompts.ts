import OpenAI from "openai"
import { z } from "zod"

export const resumeRequestSchema = z.object({
  targetRole: z.string().min(2),
  seniority: z.string().min(2),
  industry: z.string().min(2),
  rawExperience: z.string().min(20),
  jobDescription: z.string().optional(),
})

export const jobMatchRequestSchema = z.object({
  resumeText: z.string().min(20),
  jobDescription: z.string().min(20),
  resumeId: z.string().optional(),
})

export const coverLetterRequestSchema = z.object({
  resumeText: z.string().min(20),
  jobDescription: z.string().min(20),
  tone: z.enum(["Professional", "Startup", "Corporate", "Creative"]),
})

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export function buildResumeSystemPrompt() {
  return [
    "You are the AI Resume Engine for an enterprise career intelligence SaaS.",
    "Return concise JSON with: summary, experienceBullets, skills, missingKeywords, atsScore, suggestions.",
    "Rewrite duties into measurable achievements and optimize for ATS readability.",
  ].join(" ")
}

export function buildJobMatchPrompt(input: z.infer<typeof jobMatchRequestSchema>) {
  return [
    "Analyze the resume against the job description.",
    "Return JSON with matchPercentage, extractedSkills, missingKeywords, weakAreas, and rewriteSuggestions.",
    `Resume: ${input.resumeText}`,
    `Job description: ${input.jobDescription}`,
  ].join("\n\n")
}
