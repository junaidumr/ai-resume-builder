"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

type Message = { id: string; role: string; content: string }

export function CoachChat({ initialThreadId }: { initialThreadId?: string }) {
  const [threadId, setThreadId] = React.useState(initialThreadId)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!threadId) return
    fetch(`/api/coach/threads/${threadId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thread?.messages) setMessages(data.thread.messages)
      })
  }, [threadId])

  async function ensureThread() {
    if (threadId) return threadId
    const res = await fetch("/api/coach/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Career coaching" }),
    })
    const data = await res.json()
    setThreadId(data.thread.id)
    return data.thread.id as string
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    const id = await ensureThread()
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const res = await fetch(`/api/coach/threads/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userMessage.content }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessages((prev) => [...prev, data.message])
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-medium">AI Career Coach</h1>
        <p className="text-sm text-muted-foreground">
          Resume reviews, career paths, certifications, and interview prep.
        </p>
      </div>

      <Card className="flex min-h-[480px] flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ask about your resume, target roles, or interview preparation.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-lg border bg-background px-3 py-2 text-sm"
                  }
                >
                  {message.content}
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your career coach..."
            />
            <Button type="submit" disabled={loading}>
              {loading ? "..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
