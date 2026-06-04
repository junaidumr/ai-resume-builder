import { AtsTool } from "@/components/tools/ats-tool"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function AtsPage() {
  const user = await requireUser()
  const resumes = await prisma.resume.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  })

  return <AtsTool resumes={resumes} />
}
