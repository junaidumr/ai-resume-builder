"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { parseApiResponse } from "@/lib/api/parse-response"
import { Button } from "@/components/ui/button"

export function VersionRestoreButton({
  resumeId,
  versionId,
  versionNumber,
}: {
  resumeId: string
  versionId: string
  versionNumber: number
}) {
  const router = useRouter()

  async function restore() {
    const res = await fetch(`/api/resumes/${resumeId}/restore`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    })
    const parsed = await parseApiResponse<{ error?: string }>(res)
    if (!parsed.ok) {
      alert(parsed.error)
      return
    }
    router.push(`/dashboard/resumes/${resumeId}`)
    router.refresh()
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" asChild>
        <Link href={`/dashboard/resumes/${resumeId}?version=${versionNumber}`}>
          Preview
        </Link>
      </Button>
      <Button type="button" size="sm" onClick={restore}>
        Restore as new version
      </Button>
    </div>
  )
}
