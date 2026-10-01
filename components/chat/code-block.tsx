"use client"

import { useState, useCallback, useEffect } from "react"
import { Play, Square, Star, StarOff, Copy, RefreshCw, Info, Code2, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

type ExecMode = "always-allow" | "ask-first" | "read-only"

interface AutomationCardProps {
  code: string
  language: string
  cadSoftware: string
  cadDisplayName: string
  executionMode: ExecMode
  userId: string
  onRegenerate?: () => void
}

function extractDescription(code: string, language: string): string {
  const funcMatch = code.match(/def\s+(\w+)|function\s+(\w+)|Sub\s+(\w+)|void\s+(\w+)\s*\(/)
  if (funcMatch) {
    const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4]
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (code.includes("swDoc.SaveAs") || code.includes("SaveAs")) return "Multi-format part export with dimensions"
  if (code.includes("AddLine") || code.includes("CreateLine")) return "Create geometry in active sketch"
  if (code.includes("Extrude") || code.includes("FeatureExtrusion")) return "Create extrude feature on model"
  if (code.includes("NewDocument") || code.includes("NewPart")) return "Create new part document"
  if (code.includes("Circle") || code.includes("CreateCircle")) return "Create circle sketch geometry"
  if (code.includes("Fillet")) return "Apply fillet to selected edges"
  if (code.includes("Pattern") || code.includes("FeaturePattern")) return "Create pattern feature"
  if (code.includes("Assembly") || code.includes("InsertComponent")) return "Assemble components"
  if (code.includes("Drawing") || code.includes("CreateDrawing")) return "Generate engineering drawing"
  if (code.includes("Mate") || code.includes("AddMate")) return "Add mate constraint to assembly"
  return `${language || "Script"} automation for ${cadSoftware}`
}

async function runScript(code: string, cadSoftware: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("http://localhost:7800/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ software: cadSoftware, script: code }),
      signal: AbortSignal.timeout(20000),
      mode: "cors",
    })
    if (res.ok) {
      const data = await res.json()
      return { success: data.success !== false, message: data.message || "Automation executed successfully" }
    }
    return { success: false, message: `Bridge error ${res.status}` }
  } catch {
    return { success: false, message: "Bridge not running. Start bridge/START_BRIDGE.bat first." }
  }
}

export function AutomationCard({
  code,
  language,
  cadSoftware,
  cadDisplayName,
  executionMode,
  userId,
  onRegenerate,
}: AutomationCardProps) {
  const description = extractDescription(code, language)
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const [runState, setRunState] = useState<"idle" | "running" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("Ready to execute")
  const [starred, setStarred] = useState(false)
  const [starredId, setStarredId] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [autoRanOnce, setAutoRanOnce] = useState(false)

  const doRun = useCallback(async () => {
    if (runState === "running") return
    setRunState("running")
    setStatusMessage("Executing automation…")
    const result = await runScript(code, cadSoftware)
    setRunState(result.success ? "success" : "error")
    setStatusMessage(result.message)
  }, [code, cadSoftware, runState])

  const handleStop = useCallback(() => {
    setRunState("idle")
    setStatusMessage("Automation stopped")
  }, [])

  const handleRunClick = useCallback(async () => {
    if (runState === "running") { handleStop(); return }
    if (executionMode === "ask-first") {
      if (!window.confirm(`Run this automation in ${cadDisplayName}?\n\n"${description}"`)) return
    }
    await doRun()
  }, [runState, executionMode, cadDisplayName, description, handleStop, doRun])

  const handleStar = useCallback(async () => {
    if (starred && starredId) {
      await supabase.from("automations").delete().eq("id", starredId)
      setStarred(false)
      setStarredId(null)
      return
    }
    const { data } = await supabase.from("automations").insert({
      user_id: userId,
      name: description,
      description,
      script: code,
      language: language || "python",
      cad_software: cadSoftware,
      run_count: 0,
    }).select().single()
    if (data) { setStarred(true); setStarredId(data.id) }
  }, [starred, starredId, userId, description, code, language, cadSoftware])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  useEffect(() => {
    if (executionMode === "always-allow" && !autoRanOnce && code.trim().length > 10) {
      setAutoRanOnce(true)
      doRun()
    }
  }, [executionMode, autoRanOnce, code, doRun])

  const isRunning = runState === "running"
  const dotColor = runState === "success" ? "#22c55e" : runState === "error" ? "#ef4444" : runState === "running" ? "#eab308" : "#6b7280"

  return (
    <div
      className="my-4 rounded-2xl overflow-hidden select-none"
      style={{
        background: "#0d0d0d",
        border: "1px solid rgba(234,179,8,0.2)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#eab308" strokeWidth="1.5" opacity="0.3" />
              <path d="M16 8a8 8 0 1 1 0 16A8 8 0 0 1 16 8z" stroke="#eab308" strokeWidth="2" fill="none" />
              <path d="M16 12v4l2.5 2.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2" fill="#eab308" />
              <path d="M22 10l1.5-1.5M10 22l-1.5 1.5M24 16h2M6 16H4M22 22l1.5 1.5M10 10l-1.5-1.5" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight" style={{ color: "#eab308" }}>
              {cadDisplayName} Automation
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full transition-colors" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
              <p className="text-xs" style={{ color: "#9ca3af" }}>{statusMessage}</p>
            </div>
          </div>
        </div>

        {/* Description title */}
        <div className="mt-4 mb-1">
          <p className="text-lg font-bold leading-snug" style={{ color: "#f9fafb" }}>
            {description}
            <span className="inline-block ml-2 opacity-40" style={{ fontSize: 10 }}>▶</span>
          </p>
        </div>
      </div>

      {/* Info panel (collapsed by default) */}
      {showInfo && (
        <div className="mx-5 mb-3 p-3 rounded-xl text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
          <p><span style={{ color: "#eab308" }}>Language:</span> {language || "python"}</p>
          <p className="mt-1"><span style={{ color: "#eab308" }}>CAD Software:</span> {cadDisplayName}</p>
          <p className="mt-1"><span style={{ color: "#eab308" }}>Lines:</span> {code.split("\n").length}</p>
          <p className="mt-1"><span style={{ color: "#eab308" }}>Execution Mode:</span> {executionMode}</p>
        </div>
      )}

      {/* Code panel (hidden until </> tap) */}
      {showCode && (
        <div className="mx-5 mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-mono" style={{ color: "#6b7280" }}>{language || "python"}</span>
          </div>
          <div className="overflow-x-auto max-h-80">
            <pre className="p-3 text-xs font-mono leading-relaxed" style={{ color: "#e2e8f0", margin: 0, background: "#0a0a0a" }}>
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="mx-5" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* ── Action buttons ── */}
      <div className="px-5 py-4 flex gap-3">
        {/* Run / Stop button */}
        <button
          onClick={handleRunClick}
          disabled={executionMode === "read-only"}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-98"
          style={{
            background: isRunning ? "#dc2626" : "#eab308",
            color: isRunning ? "#fff" : "#000",
            opacity: executionMode === "read-only" ? 0.4 : 1,
            cursor: executionMode === "read-only" ? "not-allowed" : "pointer",
            boxShadow: isRunning ? "0 0 20px rgba(220,38,38,0.3)" : "0 0 20px rgba(234,179,8,0.25)",
          }}
        >
          {isRunning ? (
            <>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white opacity-80" style={{ animationDelay: `${i * 0.1}s`, animation: "pulse 1s infinite" }} />
                ))}
              </div>
              Stop Automation
            </>
          ) : (
            <>
              <Play className="w-4 h-4" fill="currentColor" />
              Run Automation
            </>
          )}
        </button>

        {/* Add to favourites button */}
        <button
          onClick={handleStar}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-98"
          style={{
            background: "transparent",
            border: `2px solid ${starred ? "#eab308" : "rgba(234,179,8,0.5)"}`,
            color: "#eab308",
            boxShadow: starred ? "0 0 12px rgba(234,179,8,0.2)" : "none",
          }}
        >
          {starred ? <Star className="w-4 h-4" fill="#eab308" /> : <StarOff className="w-4 h-4" />}
          {starred ? "Saved" : "Add to favorites"}
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* ── Footer ── */}
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: "#6b7280" }}>{time}</span>

        <div className="flex items-center gap-1">
          {/* Info */}
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: showInfo ? "rgba(234,179,8,0.15)" : "transparent", color: showInfo ? "#eab308" : "#6b7280", border: "1px solid transparent" }}
            title="Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Code toggle </> */}
          <button
            onClick={() => setShowCode((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: showCode ? "rgba(234,179,8,0.15)" : "transparent", color: showCode ? "#eab308" : "#6b7280" }}
            title="Toggle code"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: copied ? "#22c55e" : "#6b7280" }}
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-180"
            style={{ color: "#6b7280", transition: "transform 0.4s ease, color 0.2s" }}
            title="Regenerate code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const CAD_DISPLAY_NAMES: Record<string, string> = {
  solidworks: "SolidWorks",
  inventor: "Autodesk Inventor",
  catia: "CATIA",
  fusion360: "Fusion 360",
  spaceclaim: "SpaceClaim",
  creo: "PTC Creo",
  nx: "Siemens NX",
  onshape: "Onshape",
  solidedge: "Solid Edge",
}

interface CodeBlockProps {
  code: string
  language: string
  cadSoftware?: string
  executionMode?: ExecMode
  userId?: string
}

export function CodeBlock({ code, language, cadSoftware = "solidworks", executionMode = "always-allow", userId = "guest" }: CodeBlockProps) {
  const cadDisplayName = CAD_DISPLAY_NAMES[cadSoftware] || cadSoftware

  const handleRegenerate = useCallback(() => {
    const event = new CustomEvent("sg-regenerate", { detail: { code, language } })
    window.dispatchEvent(event)
  }, [code, language])

  return (
    <AutomationCard
      code={code}
      language={language}
      cadSoftware={cadSoftware}
      cadDisplayName={cadDisplayName}
      executionMode={executionMode}
      userId={userId}
      onRegenerate={handleRegenerate}
    />
  )
}
