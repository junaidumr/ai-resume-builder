"use client"

import * as React from "react"
import { BotIcon } from "lucide-react"

import { parseApiResponse } from "@/lib/api/parse-response"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Message = { id: string; role: string; content: string }

const prompts = [
  "Review my resume for a software engineer role",
  "How should I prepare for a technical interview?",
  "What certifications help frontend developers?",
  "Suggest a 30-day job search plan",
]

export function CoachChat({ initialThreadId }: { initialThreadId?: string }) {
  const [threadId, setThreadId] = React.useState(initialThreadId)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!threadId) return
    fetch(`/api/coach/threads/${threadId}/messages`, { credentials: "include" })
      .then((res) => parseApiResponse<{ thread?: { messages: Message[] } }>(res))
      .then((parsed) => {
        if (parsed.ok && parsed.data.thread?.messages) {
          setMessages(parsed.data.thread.messages)
        } else if (!parsed.ok) setError(parsed.error)
      })
      .catch(() => setError("Could not load conversation."))
  }, [threadId])

  async function ensureThread() {
    if (threadId) return threadId
    const res = await fetch("/api/coach/threads", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Career coaching" }),
    })
    const parsed = await parseApiResponse<{ thread: { id: string } }>(res)
    if (!parsed.ok) throw new Error(parsed.error)
    setThreadId(parsed.data.thread.id)
    return parsed.data.thread.id
  }

  async function sendMessage(content: string) {
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const id = await ensureThread()
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      const res = await fetch(`/api/coach/threads/${id}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage.content }),
      })
      const parsed = await parseApiResponse<{ message: Message }>(res)
      setLoading(false)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setMessages((prev) => [...prev, parsed.data.message])
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Send failed.")
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-6 md:px-6">
        <PageHeader
          title="AI Career Coach"
          description="Resume strategy, interview prep, certifications, and personalized career roadmaps."
          icon={BotIcon}
          badge="Assistant"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 md:pt-2">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => void sendMessage(p)}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        <Card className="flex min-h-[520px] flex-1 flex-col border-border/80 shadow-sm">
          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <BotIcon className="mb-3 size-10 opacity-40" />
                  <p>Ask anything about your career journey.</p>
                  <p className="mt-1">Try a suggested prompt above.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm"
                        : "max-w-[85%] rounded-2xl rounded-bl-md border bg-muted/30 px-4 py-2.5 text-sm leading-relaxed"
                    }
                  >
                    {message.content}
                  </div>
                ))
              )}
              {loading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Coach is thinking...</p>
              ) : null}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2 border-t pt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your career coach..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
