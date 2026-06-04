import { CoachChat } from "@/components/coach/coach-chat"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export default async function CoachPage() {
  const user = await requireUser()
  const thread = await prisma.coachThread.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  return <CoachChat initialThreadId={thread?.id} />
}
