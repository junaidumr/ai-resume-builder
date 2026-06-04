import { create } from "zustand"

export type ResumeSection =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements"
  | "volunteer"
  | "publications"
  | "languages"

type ResumeBuilderState = {
  activeTemplate: string
  activeTheme: string
  layout: "one-column" | "two-column"
  sections: ResumeSection[]
  setTemplate: (template: string) => void
  setTheme: (theme: string) => void
  setLayout: (layout: ResumeBuilderState["layout"]) => void
  reorderSections: (sections: ResumeSection[]) => void
}

export const useResumeBuilderStore = create<ResumeBuilderState>((set) => ({
  activeTemplate: "ATS Minimal",
  activeTheme: "zinc",
  layout: "one-column",
  sections: [
    "personal",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ],
  setTemplate: (activeTemplate) => set({ activeTemplate }),
  setTheme: (activeTheme) => set({ activeTheme }),
  setLayout: (layout) => set({ layout }),
  reorderSections: (sections) => set({ sections }),
}))
