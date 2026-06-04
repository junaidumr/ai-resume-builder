"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { LogInIcon, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
  }

  if (!session?.user) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      >
        <LogInIcon />
        Sign in
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right text-xs md:block">
        <p className="font-medium">{session.user.name ?? "User"}</p>
        <p className="text-muted-foreground">{session.user.email}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOutIcon />
        Sign out
      </Button>
    </div>
  )
}
