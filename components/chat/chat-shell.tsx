"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MessageList } from "./message-list"
import { Composer } from "./composer"
import { SettingsPanel } from "./settings-panel"
import { useTheme } from "@/lib/theme-context"
import { useLang } from "@/lib/lang-context"
import { supabase } from "@/lib/supabase"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageData?: string
}

export interface ChatSession {
  id: string
  title: string
  cadSoftware: string
  createdAt: Date
  messages: Message[]
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getGuestId(): string {
  let id = localStorage.getItem("sg-guest-id")
  if (!id) { id = `guest-${generateId()}`; localStorage.setItem("sg-guest-id", id) }
  return id
}

export type AIModel = "google/gemini-2.0-flash-001" | "openai/gpt-4o" | "anthropic/claude-sonnet-4"

export function SpaceGeoShell() {
  const { isDark } = useTheme()
  const { t } = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"general" | "account">("general")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
  const [selectedCAD, setSelectedCAD] = useState<CADSoftware>(CAD_SOFTWARE_LIST[0])
  const [cadStatus, setCadStatus] = useState<"checking" | "online" | "offline">("offline")
  const [dailyUsage, setDailyUsage] = useState({ used: 0, limit: 50 })
  const [usagePopupOpen, setUsagePopupOpen] = useState(false)
  const [executionMode, setExecutionMode] = useState("ask-first")
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const storedCAD = localStorage.getItem("sg-cad-software")
    if (storedCAD) {
      const found = CAD_SOFTWARE_LIST.find((s) => s.id === storedCAD)
      if (found) setSelectedCAD(found)
    }
    const storedModel = localStorage.getItem("sg-model") as AIModel | null
    if (storedModel) setSelectedModel(storedModel)
    const storedExec = localStorage.getItem("sg-exec-mode")
    if (storedExec) setExecutionMode(storedExec)

    const storedSessions = localStorage.getItem("sg-sessions")
    if (storedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(storedSessions).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })),
        }))
        setSessions(parsed)
        if (parsed.length > 0) {
          const last = parsed[parsed.length - 1]
          setActiveSessionId(last.id)
          setMessages(last.messages)
        }
      } catch {}
    }

    loadDailyUsage()
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("sg-sessions", JSON.stringify(sessions))
  }, [sessions, isLoaded])

  async function loadDailyUsage() {
    const today = new Date().toISOString().split("T")[0]
    try {
      const { data } = await supabase.from("daily_usage").select("*").eq("user_id", getGuestId()).eq("date", today).single()
      if (data) setDailyUsage({ used: data.requests_count, limit: data.daily_limit })
    } catch {}
  }

  async function incrementUsage() {
    const today = new Date().toISOString().split("T")[0]
    const guestId = getGuestId()
    try {
      const { data } = await supabase.from("daily_usage").select("*").eq("user_id", guestId).eq("date", today).single()
      if (data) {
        const newCount = data.requests_count + 1
        await supabase.from("daily_usage").update({ requests_count: newCount }).eq("id", data.id)
        setDailyUsage((prev) => ({ ...prev, used: newCount }))
      } else {
        await supabase.from("daily_usage").insert({ user_id: guestId, date: today, requests_count: 1, daily_limit: 50 })
        setDailyUsage((prev) => ({ ...prev, used: 1 }))
      }
    } catch {}
  }

  const checkCADConnection = useCallback(async () => {
    setCadStatus("checking")
    try {
      if (selectedCAD.id === "creo") {
        const res = await fetch("http://localhost:9056/creoson", { signal: AbortSignal.timeout(2000) })
        if (res.ok) { setCadStatus("online"); return }
      }
      const res = await fetch(`http://localhost:7800/status?software=${selectedCAD.id}`, { signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        const data = await res.json()
        if (data.running) { setCadStatus("online"); return }
      }
    } catch {}
    setCadStatus("offline")
  }, [selectedCAD])

  useEffect(() => {
    checkCADConnection()
    const interval = setInterval(checkCADConnection, 15000)
    return () => clearInterval(interval)
  }, [checkCADConnection])

  const createNewSession = useCallback(() => {
    const session: ChatSession = {
      id: generateId(),
      title: t.newChat,
      cadSoftware: selectedCAD.id,
      createdAt: new Date(),
      messages: [],
    }
    setSessions((prev) => [...prev, session])
    setActiveSessionId(session.id)
    setMessages([])
    setError(null)
    setSidebarOpen(false)
  }, [selectedCAD.id, t.newChat])

  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setActiveSessionId(sessionId)
      setMessages(session.messages)
      setError(null)
      setSidebarOpen(false)
    }
  }, [sessions])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (activeSessionId === sessionId) { setActiveSessionId(null); setMessages([]) }
  }, [activeSessionId])

  useEffect(() => {
    if (!activeSessionId) return
    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, messages } : s)))
  }, [messages, activeSessionId])

  const sendMessage = useCallback(async (content: string, imageData?: string) => {
    if ((!content.trim() && !imageData) || isStreaming) return
    setError(null)

    let sessionId = activeSessionId
    if (!sessionId) {
      const session: ChatSession = {
        id: generateId(),
        title: content.slice(0, 40) || t.newChat,
        cadSoftware: selectedCAD.id,
        createdAt: new Date(),
        messages: [],
      }
      setSessions((prev) => [...prev, session])
      setActiveSessionId(session.id)
      sessionId = session.id
    } else {
      setSessions((prev) =>
        prev.map((s) => s.id === sessionId && s.messages.length === 0 ? { ...s, title: content.slice(0, 40) || t.newChat } : s)
      )
    }

    const userMsg: Message = { id: generateId(), role: "user", content: content.trim() || "Describe this image", createdAt: new Date(), imageData }
    const aiMsg: Message = { id: generateId(), role: "assistant", content: "", createdAt: new Date() }

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setIsStreaming(true)
    incrementUsage()

    try {
      await supabase.from("chat_sessions").upsert({ id: sessionId, title: content.slice(0, 40) || t.newChat, cad_software: selectedCAD.id })
      await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: userMsg.content, image_data: imageData || null })
    } catch {}

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content, imageData: m.imageData })),
          model: selectedModel,
          cadSoftware: selectedCAD.id,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(errData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error("No response body")

      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: accumulated } : m)))
      }

      try {
        await supabase.from("chat_messages").insert({ session_id: sessionId, role: "assistant", content: accumulated })
      } catch {}
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content || "[Cancelled]" } : m)))
      } else {
        setError(e instanceof Error ? e.message : "An error occurred")
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [messages, isStreaming, selectedModel, selectedCAD, activeSessionId, t.newChat])

  const stopStreaming = useCallback(() => { abortControllerRef.current?.abort() }, [])

  const retry = useCallback(() => {
    if (messages.length === 0) return
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (lastUser) {
      const idx = messages.findIndex((m) => m.id === lastUser.id)
      setMessages(messages.slice(0, idx))
      setError(null)
      setTimeout(() => sendMessage(lastUser.content, lastUser.imageData), 100)
    }
  }, [messages, sendMessage])

  const handleCADChange = (cad: CADSoftware) => {
    setSelectedCAD(cad)
    localStorage.setItem("sg-cad-software", cad.id)
    setCadStatus("checking")
  }

  const handleExecutionModeChange = (mode: string) => {
    setExecutionMode(mode)
    localStorage.setItem("sg-exec-mode", mode)
  }

  const usagePct = Math.round((dailyUsage.used / dailyUsage.limit) * 100)
  const hasActiveMessages = messages.length > 0

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        hasActiveMessages={hasActiveMessages}
        onNewChat={createNewSession}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        <Header
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onSettingsClick={(tab) => { setSettingsTab(tab || "general"); setSettingsOpen(true) }}
          selectedCAD={selectedCAD}
          onCADChange={handleCADChange}
          cadStatus={cadStatus}
          onRefreshConnection={checkCADConnection}
          usagePct={usagePct}
          dailyUsage={dailyUsage}
          usagePopupOpen={usagePopupOpen}
          onToggleUsagePopup={() => setUsagePopupOpen((v) => !v)}
        />

        <div className={`connection-banner flex items-center gap-2 ${cadStatus === "online" ? "connected" : "disconnected"}`}>
          <div className={cadStatus === "online" ? "status-online" : "status-offline"} />
          <span>
            {cadStatus === "checking"
              ? `${t.checking} ${selectedCAD.displayName}…`
              : cadStatus === "online"
                ? `${selectedCAD.displayName} — ${t.online}`
                : `${selectedCAD.displayName} ${t.offline} ${selectedCAD.displayName}${t.offlineEnd}`}
          </span>
        </div>

        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onRetry={retry}
          isLoaded={isLoaded}
          selectedCAD={selectedCAD}
        />

        <Composer
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          disabled={!!error}
          selectedModel={selectedModel}
          onModelChange={(m) => { setSelectedModel(m); localStorage.setItem("sg-model", m) }}
          selectedCAD={selectedCAD}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel
          activeTab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setSettingsOpen(false)}
          selectedCAD={selectedCAD}
          onCADChange={handleCADChange}
          dailyUsage={dailyUsage}
          executionMode={executionMode}
          onExecutionModeChange={handleExecutionModeChange}
        />
      )}
    </div>
  )
}
