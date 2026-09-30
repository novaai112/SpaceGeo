import { NextRequest } from "next/server"
import { getSystemPrompt } from "@/lib/cad-software"

const GEMINI_API_KEY = process.env["Gemini_API_KEY"] || ""
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-preview-05-20",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
]

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

async function callGeminiWithModel(
  modelName: string,
  contents: any[],
  systemPrompt: string,
): Promise<ReadableStream | null> {
  const encoder = new TextEncoder()

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topK: 40,
          topP: 0.95,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    },
  )

  if (!response.ok) {
    if (response.status === 429 || response.status === 503) return null
    const err = await response.text()
    throw new Error(`Gemini ${modelName} error ${response.status}: ${err.slice(0, 200)}`)
  }

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

async function callGemini(messages: any[], systemPrompt: string, imageData?: string): Promise<ReadableStream> {
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
      contents.push({ role: "model", parts: [{ text: msg.content || "" }] })
    }
  }

  for (const model of GEMINI_MODELS) {
    try {
      const stream = await callGeminiWithModel(model, contents, systemPrompt)
      if (stream) return stream
      console.log(`Gemini model ${model} unavailable, trying next...`)
    } catch (err: any) {
      if (!err.message?.includes("429") && !err.message?.includes("503")) throw err
      console.log(`Gemini model ${model} quota exceeded, trying next...`)
    }
  }

  throw new Error("All Gemini models are currently unavailable. Please try again in a moment.")
}

async function callOpenRouter(messages: any[], modelId: string, systemPrompt: string, imageData?: string): Promise<ReadableStream> {
  const apiKey = process.env["API_KEY"]
  if (!apiKey) throw new Error("API_KEY (OpenRouter) not configured")

  const orMessages: any[] = [{ role: "system", content: systemPrompt }]
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const isLast = i === messages.length - 1
    if (msg.role === "user" && isLast && imageData?.startsWith("data:image/")) {
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

  const orModelMap: Record<string, string> = {
    "openai/gpt-4o": "openai/gpt-4o",
    "anthropic/claude-sonnet-4": "anthropic/claude-sonnet-4-5",
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://space-geo.vercel.app",
      "X-Title": "SpaceGeo AI",
    },
    body: JSON.stringify({
      model: orModelMap[modelId] ?? modelId,
      messages: orMessages,
      stream: true,
      max_tokens: 8192,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${err.slice(0, 200)}`)
  }

  return makeOpenAIStream(response.body!)
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, cadSoftware } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = getSystemPrompt(cadSoftware || "solidworks")
    const lastMsg = messages[messages.length - 1]
    const imageData = lastMsg?.role === "user" ? lastMsg?.imageData : undefined

    const cleanMessages = messages
      .map((m: any) => ({
        role: m.role,
        content: m.content || (m.imageData ? "[Image provided for CAD modeling]" : ""),
      }))
      .filter((m: any) => m.content.trim().length > 0)

    const selectedModel: string = model || "google/gemini-3.8-flash"
    let stream: ReadableStream

    if (selectedModel.startsWith("google/") || selectedModel.includes("gemini")) {
      stream = await callGemini(cleanMessages, systemPrompt, imageData)
    } else {
      try {
        stream = await callOpenRouter(cleanMessages, selectedModel, systemPrompt, imageData)
      } catch {
        stream = await callGemini(cleanMessages, systemPrompt, imageData)
      }
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
