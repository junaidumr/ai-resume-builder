"use client"

import { useRouter } from "next/navigation"

import { parseApiResponse } from "@/lib/api/parse-response"
import { Button } from "@/components/ui/button"

export function ResumeCardActions({ resumeId }: { resumeId: string }) {
  const router = useRouter()

  async function remove() {
    if (!confirm("Delete this resume and all its versions?")) return

    const res = await fetch(`/api/resumes/${resumeId}`, {
      method: "DELETE",
      credentials: "include",
    })
    const parsed = await parseApiResponse(res)
    if (parsed.ok) {
      router.refresh()
    } else {
      alert(parsed.error)
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" className="w-full" onClick={remove}>
      Delete
    </Button>
  )
}
