import { NextRequest, NextResponse } from "next/server"

const BRIDGE_URL = "http://localhost:7800"
const CREO_URL = "http://localhost:9056"

export async function GET(req: NextRequest) {
  const software = req.nextUrl.searchParams.get("software") || ""

  try {
    if (software === "creo") {
      const res = await fetch(`${CREO_URL}/creoson`, {
        signal: AbortSignal.timeout(2000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "command": "connection", "function": "is_running" }),
      })
      if (res.ok) {
        return NextResponse.json({ running: true, installed: true, name: "PTC Creo" })
      }
      return NextResponse.json({ running: false, installed: false, name: "PTC Creo" })
    }

    if (software === "onshape") {
      return NextResponse.json({ running: true, installed: true, versions: ["Cloud"], name: "Onshape" })
    }

    const url = software
      ? `${BRIDGE_URL}/status?software=${encodeURIComponent(software)}`
      : `${BRIDGE_URL}/all`

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })

    if (!res.ok) {
      return NextResponse.json({ running: false, installed: false, error: "Bridge returned error" })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { running: false, installed: false, bridgeDown: true, error: "Bridge not running. Start bridge/START_BRIDGE.bat" },
      { status: 200 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${BRIDGE_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: "Bridge not running" }, { status: 200 })
  }
}
