import { getOpenAIClient } from "@/lib/ai/prompts"

export async function generateStructuredJson<T>({
  system,
  user,
  model,
}: {
  system: string
  user: string
  model?: string
}): Promise<T> {
  const client = getOpenAIClient()
  const completion = await client.responses.create({
    model: model ?? process.env.OPENAI_MODEL ?? "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          system +
          " Respond with valid JSON only, no markdown fences.",
      },
      { role: "user", content: user },
    ],
  })

  const text = completion.output_text?.trim() ?? "{}"
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()

  return JSON.parse(cleaned) as T
}
