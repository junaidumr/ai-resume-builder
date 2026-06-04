import type { ResumeContent } from "@/lib/types/resume"

export function emptyResumeContent(): ResumeContent {
  return {
    personal: {},
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  }
}
