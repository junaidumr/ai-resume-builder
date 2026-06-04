import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth/options"
import { prisma } from "@/lib/db/prisma"

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      organizationId: true,
    },
  })

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/?auth=required")
  }

  return user
}
