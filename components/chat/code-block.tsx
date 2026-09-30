"use client"

import { useState, useCallback } from "react"
import { Play, Star, StarOff, CheckCircle, XCircle, Loader2, Copy, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

type ExecMode = "always-allow" | "ask-first" | "read-only"

interface CodeBlockProps {
  code: string
  language: string
  cadSoftware: string
  executionMode: ExecMode
  userId: string
}

function extractDescription(code: string, language: string): string {
  const lines = code.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (language === "python" && trimmed.startsWith("#")) {
      const desc = trimmed.slice(1).trim()
      if (desc.length > 3 && !desc.startsWith("!")) return desc
    }
    if ((language === "vba" || language === "vbscript") && trimmed.toLowerCase().startsWith("'")) {
      const desc = trimmed.slice(1).trim()
      if (desc.length > 3) return desc
    }
    if (["javascript", "typescript", "java", "cpp", "c"].includes(language)) {
      const match = trimmed.match(/^\/\/\s*(.+)/)
      if (match && match[1].length > 3) return match[1].trim()
    }
  }
  const funcMatch = code.match(/def\s+(\w+)|function\s+(\w+)|Sub\s+(\w+)|void\s+(\w+)\s*\(/)
  if (funcMatch) {
    const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4]
    return `Run ${name.replace(/_/g, " ")}`
  }
  return `Run ${language || "script"} macro`
}

interface RunResult {
  success: boolean
  message: string
}

async function executeScript(code: string, cadSoftware: string): Promise<RunResult> {
  try {
    const res = await fetch("http://localhost:7800/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ software: cadSoftware, script: code }),
      signal: AbortSignal.timeout(15000),
      mode: "cors",
    })
    if (res.ok) {
      const data = await res.json()
      return { success: data.success !== false, message: data.message || "Script executed successfully" }
    }
    return { success: false, message: `Bridge error: ${res.status}` }
  } catch {
    return { success: false, message: "Bridge not running. Open bridge/START_BRIDGE.bat first." }
  }
}

async function saveAutomation(
  userId: string,
  name: string,
  description: string,
  script: string,
  language: string,
  cadSoftware: string,
) {
  const { data, error } = await supabase.from("automations").insert({
    user_id: userId,
    name,
    description,
    script,
    language,
    cad_software: cadSoftware,
    run_count: 0,
  }).select().single()
  return { data, error }
}

async function incrementRunCount(automationId: string) {
  const { data } = await supabase.from("automations").select("run_count").eq("id", automationId).single()
  if (data) {
    await supabase.from("automations").update({ run_count: data.run_count + 1, updated_at: new Date().toISOString() }).eq("id", automationId)
  }
}

export function CodeBlock({ code, language, cadSoftware, executionMode, userId }: CodeBlockProps) {
  const description = extractDescription(code, language || "python")
  const [copied, setCopied] = useState(false)
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [runMessage, setRunMessage] = useState("")
  const [starred, setStarred] = useState(false)
  const [starredId, setStarredId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [autoRanOnce, setAutoRanOnce] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const doRun = useCallback(async () => {
    setRunStatus("running")
    setRunMessage("")
    const result = await executeScript(code, cadSoftware)
    setRunStatus(result.success ? "success" : "error")
    setRunMessage(result.message)
    setTimeout(() => setRunStatus((s) => (s !== "idle" ? "idle" : "idle")), 5000)
  }, [code, cadSoftware])

  const handleRun = useCallback(async () => {
    if (executionMode === "ask-first") {
      setShowConfirm(true)
      return
    }
    await doRun()
  }, [executionMode, doRun])

  const handleConfirm = useCallback(async (yes: boolean) => {
    setShowConfirm(false)
    if (yes) await doRun()
  }, [doRun])

  const handleStar = useCallback(async () => {
    if (starred && starredId) {
      await supabase.from("automations").delete().eq("id", starredId)
      setStarred(false)
      setStarredId(null)
      return
    }
    const { data } = await saveAutomation(
      userId,
      description,
      description,
      code,
      language || "python",
      cadSoftware,
    )
    if (data) {
      setStarred(true)
      setStarredId(data.id)
    }
  }, [starred, starredId, userId, description, code, language, cadSoftware])

  return (
    <div className="my-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)", background: "var(--surface-code, #0d1117)" }}>
      {/* Code header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}
      >
        <span className="text-xs font-mono font-medium" style={{ color: "#8b949e" }}>
          {language || "script"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors"
          style={{ color: "#8b949e" }}
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed" style={{ color: "#e6edf3", margin: 0 }}>
          <code>{code}</code>
        </pre>
      </div>

      {/* Action bar — Run | Description | Favourite */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}
      >
        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={runStatus === "running" || executionMode === "read-only"}
          title={
            executionMode === "read-only"
              ? "Read-only mode — cannot run"
              : executionMode === "ask-first"
                ? "Run (will ask for approval)"
                : "Run macro now"
          }
          className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          style={{
            background: runStatus === "success"
              ? "rgba(34,197,94,0.2)"
              : runStatus === "error"
                ? "rgba(239,68,68,0.2)"
                : "rgba(234,179,8,0.15)",
            border: `1.5px solid ${runStatus === "success" ? "#22c55e" : runStatus === "error" ? "#ef4444" : "#eab308"}`,
            boxShadow: runStatus === "idle" ? "0 0 8px rgba(234,179,8,0.3)" : "none",
          }}
        >
          {runStatus === "running" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#eab308" }} />
          ) : runStatus === "success" ? (
            <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
          ) : runStatus === "error" ? (
            <XCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" style={{ color: "#eab308" }} fill="#eab308" />
          )}
        </button>

        {/* Description line */}
        <div className="flex-1 min-w-0">
          {runMessage ? (
            <p
              className="text-xs truncate"
              style={{ color: runStatus === "error" ? "#f87171" : "#4ade80" }}
            >
              {runMessage}
            </p>
          ) : (
            <p className="text-xs truncate" style={{ color: "#8b949e" }}>
              {description}
            </p>
          )}
        </div>

        {/* Favourite / Star button */}
        <button
          onClick={handleStar}
          title={starred ? "Remove from My Automations" : "Save to My Automations"}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          style={{
            background: starred ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${starred ? "#fbbf24" : "rgba(255,255,255,0.12)"}`,
          }}
        >
          {starred ? (
            <Star className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} fill="#fbbf24" />
          ) : (
            <StarOff className="w-3.5 h-3.5" style={{ color: "#8b949e" }} />
          )}
        </button>
      </div>

      {/* Ask First confirmation popup */}
      {showConfirm && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(234,179,8,0.08)" }}
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-xs font-medium" style={{ color: "#fbbf24" }}>
              Run this macro in {cadSoftware}?
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "#8b949e" }}>{description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleConfirm(false)}
              className="px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "#8b949e", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              No
            </button>
            <button
              onClick={() => handleConfirm(true)}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
              style={{ background: "#eab308", color: "#000" }}
            >
              Yes, Run
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
