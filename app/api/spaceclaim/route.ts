import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const SCRIPTS_DIR = path.join(process.cwd(), "SpaceClaim Script")

const SCRIPT_MAP: Record<string, string> = {
  shell: "Shell.py",
  shell_nozzle: "SC.py",
  head_nozzle_ellipse: "Elipse_SC.py",
  head_nozzle_flat: "Flat_SC.py",
  head_nozzle_tori: "Tori_SC.py",
  head_ellipse: "Ellipse.py",
  head_flat: "Flat.py",
  head_tori: "Tori.py",
}

function buildVariableBlock(params: Record<string, unknown>): string {
  const lines: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      lines.push(`${key} = "${value}"`)
    } else if (typeof value === "number") {
      lines.push(`${key} = ${value}`)
    } else if (typeof value === "boolean") {
      lines.push(`${key} = ${value ? "True" : "False"}`)
    }
  }
  return lines.join("\n")
}

function getScriptKey(modelType: string, params: Record<string, unknown>): string {
  switch (modelType) {
    case "shell": return "shell"
    case "shell_nozzle": return "shell_nozzle"
    case "head_nozzle": {
      const headType = (params.headType as string || "ellipse").toLowerCase()
      if (headType.includes("flat")) return "head_nozzle_flat"
      if (headType.includes("tori")) return "head_nozzle_tori"
      return "head_nozzle_ellipse"
    }
    case "head": {
      const headType = (params.headType as string || "ellipse").toLowerCase()
      if (headType.includes("flat")) return "head_flat"
      if (headType.includes("tori")) return "head_tori"
      return "head_ellipse"
    }
    default: return "shell"
  }
}

function mapParamsToScriptVars(modelType: string, params: Record<string, unknown>): Record<string, unknown> {
  const vars: Record<string, unknown> = {}

  if (modelType === "shell" || modelType === "shell_nozzle") {
    vars["S_OD"] = Number(params.shellOD ?? 2000)
    vars["S_THK"] = Number(params.shellTHK ?? 50)
    vars["S_H"] = Number(params.shellHeight ?? 2000)
  }

  if (modelType === "shell_nozzle") {
    const nType = (params.nozzleType as string) || "Straight"
    vars["N_TYPE"] = nType
    vars["N_L1"] = Number(params.nozzleLocation ?? 1000)
    vars["N_OD"] = Number(params.neckOD ?? 400)
    vars["N_THK"] = Number(params.neckThickness ?? 60)
    vars["N_P"] = Number(params.nozzleProjection ?? 1600)
    vars["N_OFF"] = Number(params.nozzleOffset ?? 0)
    if (nType === "Straight") {
      const padRequired = (params.padRequired as string || "NO").toUpperCase()
      vars["pad"] = padRequired
      if (padRequired === "YES") {
        vars["P_W"] = Number(params.padWidth ?? 75)
        vars["P_THK"] = Number(params.padThickness ?? 25)
      }
    } else {
      vars["Hub_OD"] = Number(params.hubOD ?? 600)
      vars["Hub_L"] = Number(params.hubLength ?? 300)
      vars["T_LEN"] = Number(params.transitionLength ?? 200)
    }
  }

  if (modelType === "head" || modelType === "head_nozzle") {
    const headType = (params.headType as string || "ellipse").toLowerCase()
    if (headType.includes("ellipse") || headType.includes("ellipsoidal")) {
      vars["a"] = Number(params.headID ?? 1000)
      vars["THK"] = Number(params.headTHK ?? 40)
      vars["ratio"] = Number(params.abRatio ?? 2)
      vars["S_OFF"] = Number(params.straightFlangeOffset ?? 50)
      vars["S_THK"] = Number(params.attachedShellThickness ?? 50)
      vars["S_H"] = Number(params.attachedShellHeight ?? 100)
    } else if (headType.includes("flat")) {
      vars["H_OD"] = Number(params.headOD ?? 1000)
      vars["H_THK"] = Number(params.headThickness ?? 40)
      vars["S_ID"] = Number(params.shellInnerDia ?? 900)
      vars["T_LEN"] = Number(params.transitionLength ?? 30)
      vars["S_H"] = Number(params.shellHeight ?? 150)
      vars["S_THK"] = Number(params.shellThickness ?? 30)
    } else if (headType.includes("tori")) {
      vars["H_ID"] = Number(params.crownRadius ?? 1000)
      vars["H_THK"] = Number(params.headThickness ?? 40)
      vars["H_KR"] = Number(params.knuckleRadius ?? 60)
      vars["SF"] = Number(params.straightFlangeOffset ?? 50)
      vars["S_H"] = Number(params.shellHeight ?? 100)
      vars["S_THK"] = Number(params.shellThickness ?? 50)
    }
  }

  if (modelType === "head_nozzle") {
    const headType = (params.headType as string || "ellipse").toLowerCase()
    if (headType.includes("ellipse") || headType.includes("ellipsoidal")) {
      vars["a"] = Number(params.headID ?? 1000)
      vars["THK"] = Number(params.headTHK ?? 40)
      vars["ratio"] = Number(params.abRatio ?? 2)
      vars["S_OFF"] = Number(params.straightFlangeOffset ?? 50)
      vars["S_THK"] = Number(params.attachedShellThickness ?? 50)
      vars["S_H"] = Number(params.attachedShellHeight ?? 100)
    } else if (headType.includes("flat")) {
      vars["H_OD"] = Number(params.headOD ?? 1000)
      vars["H_THK"] = Number(params.headThickness ?? 40)
      vars["S_ID"] = Number(params.shellInnerDia ?? 900)
      vars["T_LEN"] = Number(params.transitionLength ?? 30)
      vars["S_H"] = Number(params.shellHeight ?? 150)
      vars["S_THK"] = Number(params.shellThickness ?? 30)
    } else if (headType.includes("tori")) {
      vars["H_ID"] = Number(params.crownRadius ?? 1000)
      vars["H_THK"] = Number(params.headThickness ?? 40)
      vars["H_KR"] = Number(params.knuckleRadius ?? 60)
      vars["SF"] = Number(params.straightFlangeOffset ?? 50)
      vars["S_H"] = Number(params.shellHeight ?? 100)
      vars["S_THK"] = Number(params.shellThickness ?? 50)
    }
    const nType = (params.nozzleType as string) || "Straight"
    vars["N_TYPE"] = nType
    vars["N_L1"] = Number(params.nozzleLocation ?? 1000)
    vars["N_OD"] = Number(params.neckOD ?? 400)
    vars["N_THK"] = Number(params.neckThickness ?? 60)
    vars["N_P"] = Number(params.nozzleProjection ?? 1600)
    vars["N_OFF"] = Number(params.nozzleOffset ?? 0)
    if (nType === "Straight") {
      const padRequired = (params.padRequired as string || "NO").toUpperCase()
      vars["pad"] = padRequired
      if (padRequired === "YES") {
        vars["P_W"] = Number(params.padWidth ?? 75)
        vars["P_THK"] = Number(params.padThickness ?? 25)
      }
    } else {
      vars["Hub_OD"] = Number(params.hubOD ?? 600)
      vars["Hub_L"] = Number(params.hubLength ?? 300)
      vars["T_LEN"] = Number(params.transitionLength ?? 200)
    }
  }

  return vars
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { modelType, params } = body as { modelType: string; params: Record<string, unknown> }

    if (!modelType) {
      return NextResponse.json({ error: "modelType is required" }, { status: 400 })
    }

    const scriptKey = getScriptKey(modelType, params)
    const scriptFile = SCRIPT_MAP[scriptKey]
    if (!scriptFile) {
      return NextResponse.json({ error: `Unknown script for ${modelType}` }, { status: 400 })
    }

    const scriptPath = path.join(SCRIPTS_DIR, scriptFile)
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ error: `Script file not found: ${scriptFile}` }, { status: 500 })
    }

    const scriptBody = fs.readFileSync(scriptPath, "utf-8")
    const vars = mapParamsToScriptVars(modelType, params)
    const varBlock = buildVariableBlock(vars)
    const fullScript = `${varBlock}\n${scriptBody}`

    let execResult: Record<string, unknown> = { success: false, message: "Bridge not running" }
    try {
      const bridgeRes = await fetch("http://localhost:7800/spaceclaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: fullScript, scriptName: scriptFile }),
        signal: AbortSignal.timeout(30000),
      })
      if (bridgeRes.ok) {
        execResult = await bridgeRes.json()
      } else {
        execResult = { success: false, message: `Bridge error ${bridgeRes.status}` }
      }
    } catch {
      execResult = { success: false, message: "Bridge not running. Start bridge/START_BRIDGE.bat first." }
    }

    return NextResponse.json({
      success: execResult.success,
      message: execResult.message,
      scriptUsed: scriptFile,
      variables: vars,
      fullScript,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoints: {
      "POST /api/spaceclaim": "Execute a SpaceClaim script with model parameters",
    },
    modelTypes: ["shell", "shell_nozzle", "head_nozzle", "head"],
    scripts: SCRIPT_MAP,
  })
}
