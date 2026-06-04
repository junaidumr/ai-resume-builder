import Link from "next/link"

import { VersionRestoreButton } from "@/components/versions/version-restore-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function VersionsPage() {
  const user = await requireUser()
  const versions = await prisma.resumeVersion.findMany({
    where: { resume: { ownerId: user.id } },
    include: { resume: { select: { id: true, title: true } } },
    orderBy: [{ resumeId: "asc" }, { version: "desc" }],
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">Version Control</h1>
        <p className="text-sm text-muted-foreground">
          Compare resume versions and track ATS improvements.
        </p>
      </div>

      <div className="grid gap-3">
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        ) : (
          versions.map((version) => (
            <Card key={version.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">
                  <Link
                    href={`/dashboard/resumes/${version.resume.id}`}
                    className="hover:underline"
                  >
                    {version.resume.title}
                  </Link>
                </CardTitle>
                <Badge variant="outline">v{version.version}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{version.label}</p>
                <p className="mt-1">ATS {version.atsScore}% · {version.template}</p>
                {version.changeSummary ? (
                  <p className="mt-1">{version.changeSummary}</p>
                ) : null}
                <VersionRestoreButton
                  resumeId={version.resume.id}
                  versionId={version.id}
                  versionNumber={version.version}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
