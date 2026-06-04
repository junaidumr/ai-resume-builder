import type { ResumeContent } from "@/lib/types/resume"
import { cn } from "@/lib/utils"

export function ResumePreview({
  title,
  targetRole,
  content,
  className,
}: {
  title: string
  targetRole?: string | null
  content: ResumeContent
  className?: string
}) {
  const name = content.personal.fullName || title
  const exp = content.experience[0]

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-6 text-[13px] leading-relaxed text-zinc-800 shadow-sm dark:bg-zinc-950 dark:text-zinc-200",
        className
      )}
    >
      <header className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
        {targetRole ? (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{targetRole}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          {content.personal.email ? <span>{content.personal.email}</span> : null}
          {content.personal.phone ? <span>{content.personal.phone}</span> : null}
          {content.personal.location ? <span>{content.personal.location}</span> : null}
        </div>
      </header>

      {content.summary ? (
        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Summary
          </h3>
          <p className="mt-1.5">{content.summary}</p>
        </section>
      ) : null}

      {content.skills.length > 0 ? (
        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Skills
          </h3>
          <p className="mt-1.5">{content.skills.join(" · ")}</p>
        </section>
      ) : null}

      {exp ? (
        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Experience
          </h3>
          <p className="mt-1.5 font-medium">
            {exp.title}
            {exp.company ? ` · ${exp.company}` : ""}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {exp.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.education.length > 0 ? (
        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Education
          </h3>
          {content.education.map((e) => (
            <p key={`${e.school}-${e.degree}`} className="mt-1.5">
              {e.degree ? `${e.degree}, ` : ""}
              {e.school}
              {e.year ? ` (${e.year})` : ""}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  )
}
