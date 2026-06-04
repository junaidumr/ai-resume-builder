import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth/options"
import { prisma } from "@/lib/db/prisma"

export async function requireApiUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
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

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 401 }),
    }
  }

  return { user, error: null }
}
