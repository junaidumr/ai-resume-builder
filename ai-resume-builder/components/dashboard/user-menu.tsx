"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { LogInIcon, LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function initials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return (email?.[0] ?? "U").toUpperCase()
}

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
  }

  if (!session?.user) {
    return (
      <Button
        size="sm"
        onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      >
        <LogInIcon />
        Sign in
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">
          {session.user.name ?? "User"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{session.user.email}</p>
      </div>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        )}
        title={session.user.name ?? session.user.email ?? ""}
      >
        {initials(session.user.name, session.user.email)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOutIcon />
        <span className="sr-only sm:not-sr-only">Sign out</span>
      </Button>
    </div>
  )
}
