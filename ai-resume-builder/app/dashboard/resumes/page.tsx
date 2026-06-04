import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function ResumesPage() {
  const user = await requireUser()
  const resumes = await prisma.resume.findMany({
    where: { ownerId: user.id },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
      _count: { select: { versions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Resume Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage AI-optimized resumes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/resumes/new">New resume</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No resumes yet. Create your first resume to get started.
            </CardContent>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle>{resume.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {resume.targetRole ?? "No target role"}
                </p>
                <p className="text-sm">
                  ATS {resume.versions[0]?.atsScore ?? 0}% · {resume._count.versions}{" "}
                  versions
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/resumes/${resume.id}`}>Open editor</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
