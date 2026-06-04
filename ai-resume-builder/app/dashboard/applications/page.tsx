import { ApplicationTracker } from "@/components/applications/application-tracker"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function ApplicationsPage() {
  const user = await requireUser()
  const applications = await prisma.jobApplication.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  return <ApplicationTracker initialApplications={applications} />
}
