"use client"

import { useState, useCallback } from "react"
import { X, Play, Square, ChevronDown, Settings2, Layers, Zap, AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react"

interface FieldDef {
  key: string
  label: string
  default: number | string
  unit?: string
  type?: "number" | "select"
  options?: string[]
}

interface ScriptResult {
  success: boolean
  message: string
  scriptPath?: string
  scriptUsed?: string
  method?: string
  automationError?: string
}

const FIELD_GROUPS = {
  shell: {
    title: "Shell Dimensions",
    icon: "shell",
    fields: [
      { key: "shellOD", label: "Shell OD", default: 2000, unit: "mm" },
      { key: "shellTHK", label: "Shell THK", default: 50, unit: "mm" },
      { key: "shellHeight", label: "Shell Height", default: 2000, unit: "mm" },
    ] as FieldDef[],
  },
  shell_nozzle_common: {
    title: "Shell Dimensions",
    icon: "shell",
    fields: [
      { key: "shellOD", label: "Shell OD", default: 2000, unit: "mm" },
      { key: "shellTHK", label: "Shell THK", default: 50, unit: "mm" },
      { key: "shellHeight", label: "Shell Height", default: 2000, unit: "mm" },
    ] as FieldDef[],
  },
  nozzle_straight: {
    title: "Nozzle Dimensions (Straight)",
    icon: "nozzle",
    fields: [
      { key: "nozzleLocation", label: "Nozzle Location", default: 1000, unit: "mm" },
      { key: "neckOD", label: "Neck OD", default: 400, unit: "mm" },
      { key: "neckThickness", label: "Neck Thickness", default: 60, unit: "mm" },
      { key: "nozzleProjection", label: "Nozzle Projection", default: 1600, unit: "mm" },
      { key: "nozzleOffset", label: "Nozzle Offset", default: 0, unit: "mm" },
      { key: "padRequired", label: "Pad Required", default: "NO", type: "select", options: ["NO", "YES"] },
    ] as FieldDef[],
  },
  pad: {
    title: "Pad Dimensions",
    icon: "pad",
    fields: [
      { key: "padWidth", label: "Pad Width", default: 75, unit: "mm" },
      { key: "padThickness", label: "Pad Thickness", default: 25, unit: "mm" },
    ] as FieldDef[],
  },
  nozzle_barrel: {
    title: "Nozzle Dimensions (Barrel)",
    icon: "nozzle",
    fields: [
      { key: "nozzleLocation", label: "Nozzle Location", default: 1000, unit: "mm" },
      { key: "neckOD", label: "Neck OD", default: 400, unit: "mm" },
      { key: "neckThickness", label: "Neck Thickness", default: 60, unit: "mm" },
      { key: "nozzleProjection", label: "Nozzle Projection", default: 1600, unit: "mm" },
      { key: "nozzleOffset", label: "Nozzle Offset", default: 0, unit: "mm" },
      { key: "hubOD", label: "Hub OD", default: 600, unit: "mm" },
      { key: "hubLength", label: "Hub Length", default: 300, unit: "mm" },
      { key: "transitionLength", label: "Transition Length", default: 200, unit: "mm" },
    ] as FieldDef[],
  },
  head_ellipse: {
    title: "Ellipsoidal Head Dimensions",
    icon: "head",
    fields: [
      { key: "headID", label: "Head ID", default: 1000, unit: "mm" },
      { key: "headTHK", label: "Head THK", default: 40, unit: "mm" },
      { key: "abRatio", label: "a:b Ratio", default: 2, unit: "" },
      { key: "straightFlangeOffset", label: "Straight Flange Offset", default: 50, unit: "mm" },
      { key: "attachedShellThickness", label: "Attached Shell Thickness", default: 50, unit: "mm" },
      { key: "attachedShellHeight", label: "Attached Shell Height", default: 100, unit: "mm" },
    ] as FieldDef[],
  },
  head_flat: {
    title: "Flat Head Dimensions",
    icon: "head",
    fields: [
      { key: "headOD", label: "Head Outer Dia (OD)", default: 1000, unit: "mm" },
      { key: "headThickness", label: "Head Thickness", default: 40, unit: "mm" },
      { key: "shellInnerDia", label: "Shell Inner Dia (ID)", default: 900, unit: "mm" },
      { key: "transitionLength", label: "Transition Length", default: 30, unit: "mm" },
      { key: "shellHeight", label: "Shell Height", default: 150, unit: "mm" },
      { key: "shellThickness", label: "Shell Thickness", default: 30, unit: "mm" },
    ] as FieldDef[],
  },
  head_tori: {
    title: "Torispherical Head Dimensions",
    icon: "head",
    fields: [
      { key: "crownRadius", label: "Crown Radius (Head ID)", default: 1000, unit: "mm" },
      { key: "headThickness", label: "Head Thickness", default: 40, unit: "mm" },
      { key: "knuckleRadius", label: "Knuckle Radius", default: 60, unit: "mm" },
      { key: "straightFlangeOffset", label: "Straight Flange Offset", default: 50, unit: "mm" },
      { key: "shellHeight", label: "Shell Height", default: 100, unit: "mm" },
      { key: "shellThickness", label: "Shell Thickness", default: 50, unit: "mm" },
    ] as FieldDef[],
  },
}

type ModelType = "shell" | "shell_nozzle" | "head_nozzle" | "head"
type NozzleType = "Straight" | "Barrel"
type HeadType = "Ellipsoidal Head" | "Flat Head" | "Torispherical Head"

function NumberInput({ field, value, onChange }: { field: FieldDef; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide" style={{ color: "#9ca3af" }}>
        {field.label}
        {field.unit && <span className="ml-1 text-xs" style={{ color: "#6b7280" }}>({field.unit})</span>}
      </label>
      <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(234,179,8,0.25)", background: "rgba(0,0,0,0.3)" }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm font-mono bg-transparent focus:outline-none"
          style={{ color: "#f9fafb", minWidth: 0 }}
        />
        {field.unit && (
          <span className="px-2 py-2 text-xs flex-shrink-0" style={{ background: "rgba(234,179,8,0.1)", color: "#eab308", borderLeft: "1px solid rgba(234,179,8,0.2)" }}>
            {field.unit}
          </span>
        )}
      </div>
    </div>
  )
}

function SelectInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide" style={{ color: "#9ca3af" }}>
        {field.label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 text-sm font-medium rounded-lg focus:outline-none pr-8"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(234,179,8,0.25)",
            color: "#f9fafb",
          }}
        >
          {field.options?.map(opt => <option key={opt} value={opt} style={{ background: "#1a1a1a" }}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#eab308" }} />
      </div>
    </div>
  )
}

function FieldGroup({ title, fields, values, onChange }: { title: string; fields: FieldDef[]; values: Record<string, string | number>; onChange: (key: string, val: string) => void }) {
  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#eab308" }}>{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          f.type === "select"
            ? <SelectInput key={f.key} field={f} value={String(values[f.key] ?? f.default)} onChange={v => onChange(f.key, v)} />
            : <NumberInput key={f.key} field={f} value={values[f.key] ?? f.default} onChange={v => onChange(f.key, v)} />
        ))}
      </div>
    </div>
  )
}

interface SCPanelProps {
  modelType: ModelType
  initialParams?: Record<string, unknown>
  onClose: () => void
}

export function SpaceClaimPanel({ modelType, initialParams, onClose }: SCPanelProps) {
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const defaults: Record<string, string | number> = {}
    const setDefaults = (fields: FieldDef[]) => fields.forEach(f => { defaults[f.key] = f.default })
    setDefaults(FIELD_GROUPS.shell.fields)
    setDefaults(FIELD_GROUPS.nozzle_straight.fields)
    setDefaults(FIELD_GROUPS.pad.fields)
    setDefaults(FIELD_GROUPS.nozzle_barrel.fields)
    setDefaults(FIELD_GROUPS.head_ellipse.fields)
    setDefaults(FIELD_GROUPS.head_flat.fields)
    setDefaults(FIELD_GROUPS.head_tori.fields)
    if (initialParams) Object.entries(initialParams).forEach(([k, v]) => { defaults[k] = v as string | number })
    return defaults
  })

  const [nozzleType, setNozzleType] = useState<NozzleType>("Straight")
  const [headType, setHeadType] = useState<HeadType>("Ellipsoidal Head")
  const [nozzlePosition, setNozzlePosition] = useState<"Shell Nozzle" | "Head Nozzle">("Shell Nozzle")
  const [runState, setRunState] = useState<"idle" | "running" | "success" | "error">("idle")
  const [result, setResult] = useState<ScriptResult | null>(null)

  const handleChange = useCallback((key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleRun = useCallback(async () => {
    setRunState("running")
    setResult(null)

    let effectiveModelType = modelType
    if (modelType === "shell_nozzle") {
      effectiveModelType = nozzlePosition === "Head Nozzle" ? "head_nozzle" : "shell_nozzle"
    }

    const params: Record<string, unknown> = { ...values, nozzleType }
    if (effectiveModelType === "head_nozzle" || modelType === "head") {
      params.headType = headType
    }

    try {
      // Step 1: Build the script via Next.js API
      const apiRes = await fetch("/api/spaceclaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelType: effectiveModelType, params }),
      })
      const apiData = await apiRes.json()

      if (!apiData.success) {
        setResult({ success: false, message: apiData.error || "Failed to build script" })
        setRunState("error")
        return
      }

      // Step 2: Send script to bridge for execution in SpaceClaim
      let bridgeResult: ScriptResult
      try {
        const bridgeRes = await fetch("http://localhost:7800/spaceclaim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: apiData.fullScript, scriptName: apiData.scriptUsed }),
          signal: AbortSignal.timeout(300000),
          mode: "cors",
        })
        if (bridgeRes.ok) {
          bridgeResult = await bridgeRes.json()
        } else {
          bridgeResult = { success: false, message: `Bridge responded with HTTP ${bridgeRes.status}` }
        }
      } catch {
        bridgeResult = {
          success: false,
          message:
            "Cannot reach bridge on localhost:7800.\n" +
            "Make sure the bridge is running: open bridge/START_BRIDGE.bat",
        }
      }

      setResult(bridgeResult)
      setRunState(bridgeResult.success ? "success" : "error")
    } catch {
      setResult({ success: false, message: "Network error reaching /api/spaceclaim" })
      setRunState("error")
    }
  }, [modelType, values, nozzleType, headType, nozzlePosition])

  const isNozzle = modelType === "shell_nozzle"
  const isHead = modelType === "head"
  const isHeadNozzle = modelType === "head_nozzle" || (isNozzle && nozzlePosition === "Head Nozzle")
  const showShell = modelType === "shell" || (isNozzle && nozzlePosition === "Shell Nozzle")
  const showShellForHeadNozzle = isHeadNozzle

  const titleMap: Record<string, string> = {
    shell: "Create Shell",
    shell_nozzle: "Create Nozzle",
    head_nozzle: "Create Head Nozzle",
    head: "Create Head",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(234,179,8,0.3)",
          boxShadow: "0 8px 64px rgba(0,0,0,0.8), 0 0 40px rgba(234,179,8,0.08)",
        }}
      >
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}>
            <Settings2 className="w-5 h-5" style={{ color: "#eab308" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold" style={{ color: "#f9fafb" }}>{titleMap[modelType] || "SpaceClaim Builder"}</h2>
            <p className="text-xs" style={{ color: "#6b7280" }}>Enter dimensions in mm · All values have defaults</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: "#9ca3af" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          {isNozzle && (
            <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#eab308" }}>Nozzle Position</p>
              <div className="flex gap-2">
                {(["Shell Nozzle", "Head Nozzle"] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setNozzlePosition(pos)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: nozzlePosition === pos ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.04)",
                      border: nozzlePosition === pos ? "1px solid rgba(234,179,8,0.6)" : "1px solid rgba(255,255,255,0.08)",
                      color: nozzlePosition === pos ? "#eab308" : "#9ca3af",
                    }}
                  >{pos}</button>
                ))}
              </div>
            </div>
          )}

          {isHeadNozzle && (
            <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#eab308" }}>Head Type</p>
              <div className="flex flex-col gap-2">
                {(["Ellipsoidal Head", "Flat Head", "Torispherical Head"] as HeadType[]).map(ht => (
                  <button
                    key={ht}
                    onClick={() => setHeadType(ht)}
                    className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-left"
                    style={{
                      background: headType === ht ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.04)",
                      border: headType === ht ? "1px solid rgba(234,179,8,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      color: headType === ht ? "#eab308" : "#9ca3af",
                    }}
                  >{ht} {headType === ht && "(Selected)"}</button>
                ))}
              </div>
            </div>
          )}

          {isHead && (
            <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#eab308" }}>Head Type</p>
              <div className="flex flex-col gap-2">
                {(["Ellipsoidal Head", "Flat Head", "Torispherical Head"] as HeadType[]).map(ht => (
                  <button
                    key={ht}
                    onClick={() => setHeadType(ht)}
                    className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-left"
                    style={{
                      background: headType === ht ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.04)",
                      border: headType === ht ? "1px solid rgba(234,179,8,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      color: headType === ht ? "#eab308" : "#9ca3af",
                    }}
                  >{ht} {headType === ht && "(Selected)"}</button>
                ))}
              </div>
            </div>
          )}

          {showShell && (
            <FieldGroup
              title="Shell Dimensions"
              fields={FIELD_GROUPS.shell.fields}
              values={values}
              onChange={handleChange}
            />
          )}

          {isHeadNozzle && headType === "Ellipsoidal Head" && (
            <FieldGroup title="Ellipsoidal Head Dimensions" fields={FIELD_GROUPS.head_ellipse.fields} values={values} onChange={handleChange} />
          )}
          {isHeadNozzle && headType === "Flat Head" && (
            <FieldGroup title="Flat Head Dimensions" fields={FIELD_GROUPS.head_flat.fields} values={values} onChange={handleChange} />
          )}
          {isHeadNozzle && headType === "Torispherical Head" && (
            <FieldGroup title="Torispherical Head Dimensions" fields={FIELD_GROUPS.head_tori.fields} values={values} onChange={handleChange} />
          )}

          {isHead && headType === "Ellipsoidal Head" && (
            <FieldGroup title="Ellipsoidal Head Dimensions" fields={FIELD_GROUPS.head_ellipse.fields} values={values} onChange={handleChange} />
          )}
          {isHead && headType === "Flat Head" && (
            <FieldGroup title="Flat Head Dimensions" fields={FIELD_GROUPS.head_flat.fields} values={values} onChange={handleChange} />
          )}
          {isHead && headType === "Torispherical Head" && (
            <FieldGroup title="Torispherical Head Dimensions" fields={FIELD_GROUPS.head_tori.fields} values={values} onChange={handleChange} />
          )}

          {(isNozzle || isHeadNozzle) && (
            <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#eab308" }}>Nozzle Type</p>
              <div className="flex gap-2">
                {(["Straight", "Barrel"] as NozzleType[]).map(nt => (
                  <button
                    key={nt}
                    onClick={() => setNozzleType(nt)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: nozzleType === nt ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.04)",
                      border: nozzleType === nt ? "1px solid rgba(234,179,8,0.6)" : "1px solid rgba(255,255,255,0.08)",
                      color: nozzleType === nt ? "#eab308" : "#9ca3af",
                    }}
                  >{nt}</button>
                ))}
              </div>
            </div>
          )}

          {(isNozzle || isHeadNozzle) && nozzleType === "Straight" && (
            <FieldGroup title="Nozzle Dimensions (Straight)" fields={FIELD_GROUPS.nozzle_straight.fields} values={values} onChange={handleChange} />
          )}
          {(isNozzle || isHeadNozzle) && nozzleType === "Straight" && String(values.padRequired) === "YES" && (
            <FieldGroup title="Pad Dimensions" fields={FIELD_GROUPS.pad.fields} values={values} onChange={handleChange} />
          )}
          {(isNozzle || isHeadNozzle) && nozzleType === "Barrel" && (
            <FieldGroup title="Nozzle Dimensions (Barrel)" fields={FIELD_GROUPS.nozzle_barrel.fields} values={values} onChange={handleChange} />
          )}

          {result && (
            <div
              className="rounded-xl p-4"
              style={{
                background: result.success ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${result.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="flex items-start gap-3 mb-2">
                {result.success
                  ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                  : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                <p className="text-sm font-bold" style={{ color: result.success ? "#22c55e" : "#ef4444" }}>
                  {result.success
                    ? result.method === "com_api"
                      ? "Model created via COM API ✅"
                      : result.method === "ui_clicks"
                      ? "Model created via SpaceClaim UI ✅"
                      : result.method === "launch_with_script"
                      ? "SpaceClaim launching…"
                      : "Script Executed"
                    : result.method === "manual_required" || result.method === "not_found"
                    ? "Manual Steps Required"
                    : "Error"}
                </p>
              </div>

              {/* Success: show which method worked */}
              {result.success && result.method && (
                <div className="ml-8 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(34,197,94,0.12)", color: "#86efac" }}>
                    method: {result.method}
                  </span>
                </div>
              )}

              {/* Manual steps when automation could not run */}
              {!result.success && (result.method === "manual_required" || result.method === "not_found") && (
                <div className="ml-8 mb-3">
                  <div className="rounded-lg p-3" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "#eab308" }}>Run the script manually:</p>
                    <div className="space-y-1 text-xs" style={{ color: "#d1d5db" }}>
                      <p>1. Open SpaceClaim</p>
                      <p>2. Click <b style={{ color: "#f9fafb" }}>File → Scripting → Run Script</b></p>
                      <p>3. Browse to the script path below and click <b style={{ color: "#f9fafb" }}>Open</b></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Script path with copy button */}
              {result.scriptPath && (
                <div className="ml-8 flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono flex-1 truncate" style={{ color: "#6b7280" }}>{result.scriptPath}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.scriptPath || "")}
                    className="shrink-0 px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308" }}
                  >Copy Path</button>
                </div>
              )}

              {/* Error message for non-manual failures */}
              {!result.success && result.method !== "manual_required" && result.method !== "not_found" && (
                <p className="ml-8 text-xs mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: "#9ca3af" }}>{result.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={handleRun}
            disabled={runState === "running"}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: runState === "running" ? "#dc2626" : "#eab308",
              color: runState === "running" ? "#fff" : "#000",
              boxShadow: runState === "running" ? "0 0 24px rgba(220,38,38,0.3)" : "0 0 24px rgba(234,179,8,0.3)",
              opacity: runState === "running" ? 1 : 1,
            }}
          >
            {runState === "running" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Script…</>
            ) : (
              <><Play className="w-4 h-4" fill="currentColor" /> Build in SpaceClaim</>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
