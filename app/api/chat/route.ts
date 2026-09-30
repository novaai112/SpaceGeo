import { NextRequest } from "next/server"
import { getSystemPrompt } from "@/lib/cad-software"

// ─── Helper: SSE stream from OpenAI-compatible API ───────────────────────────
function makeOpenAIStream(responseBody: ReadableStream): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const reader = responseBody.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            try {
              const json = JSON.parse(data)
              const text = json?.choices?.[0]?.delta?.content
              if (text) controller.enqueue(encoder.encode(text))
            } catch {}
          }
        }
      }
      controller.close()
    },
  })
}

// ─── Gemini (Google AI) ───────────────────────────────────────────────────────
async function callGemini(
  messages: any[],
  systemPrompt: string,
  imageData?: string
): Promise<ReadableStream> {
  const apiKey = process.env["Gemini_API_KEY"]
  if (!apiKey) throw new Error("Gemini_API_KEY not set in .env.local")

  const contents: any[] = []
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const isLast = i === messages.length - 1

    if (msg.role === "user") {
      const parts: any[] = []
      if (isLast && imageData && imageData.startsWith("data:image/")) {
        const [header, base64Data] = imageData.split(",")
        const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg"
        parts.push({ inlineData: { mimeType, data: base64Data } })
      }
      parts.push({ text: msg.content || "Describe this image for CAD modeling" })
      contents.push({ role: "user", parts })
    } else {
      contents.push({ role: "model", parts: [{ text: msg.content }] })
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    },
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${err}`)
  }

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            try {
              const json = JSON.parse(data)
              const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) controller.enqueue(encoder.encode(text))
            } catch {}
          }
        }
      }
      controller.close()
    },
  })
}

// ─── OpenRouter (GPT-4o and Claude) ──────────────────────────────────────────
async function callOpenRouter(
  messages: any[],
  modelId: string,
  systemPrompt: string,
  imageData?: string,
): Promise<ReadableStream> {
  const apiKey = process.env["API_KEY"]
  if (!apiKey) throw new Error("API_KEY (OpenRouter) not set in .env.local")

  const orMessages: any[] = [{ role: "system", content: systemPrompt }]

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const isLast = i === messages.length - 1

    if (msg.role === "user" && isLast && imageData && imageData.startsWith("data:image/")) {
      orMessages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageData, detail: "high" } },
          { type: "text", text: msg.content || "Analyze this image for CAD modeling" },
        ],
      })
    } else {
      orMessages.push({ role: msg.role, content: msg.content })
    }
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://spacegeo.ai",
      "X-Title": "SpaceGeo AI",
    },
    body: JSON.stringify({
      model: modelId,
      messages: orMessages,
      stream: true,
      max_tokens: 8192,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${err}`)
  }

  return makeOpenAIStream(response.body!)
}

// ─── Main POST Handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, model, cadSoftware } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get system prompt based on selected CAD software
    const systemPrompt = getSystemPrompt(cadSoftware || "solidworks")

    // Extract image from last user message
    const lastMsg = messages[messages.length - 1]
    const imageData = lastMsg?.role === "user" ? lastMsg?.imageData : undefined

    // Clean messages
    const cleanMessages = messages
      .map((m: any) => ({
        role: m.role,
        content: m.content || (m.imageData ? "[Image provided for CAD modeling]" : ""),
      }))
      .filter((m: any) => m.content.trim().length > 0)

    const selectedModel: string = model || "google/gemini-2.0-flash-001"
    let stream: ReadableStream

    if (selectedModel.startsWith("google/") || selectedModel.includes("gemini")) {
      try {
        stream = await callGemini(cleanMessages, systemPrompt, imageData)
      } catch (error: any) {
        if (error.message?.includes("429")) {
          console.log("Gemini quota exceeded, falling back to GPT-4o via OpenRouter...")
          stream = await callOpenRouter(cleanMessages, "openai/gpt-4o", systemPrompt, imageData)
        } else {
          throw error
        }
      }
    } else {
      const orModelMap: Record<string, string> = {
        "openai/gpt-4o": "openai/gpt-4o",
        "anthropic/claude-sonnet-4": "anthropic/claude-sonnet-4-5",
      }
      const orModel = orModelMap[selectedModel] ?? selectedModel
      stream = await callOpenRouter(cleanMessages, orModel, systemPrompt, imageData)
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("SpaceGeo AI error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
